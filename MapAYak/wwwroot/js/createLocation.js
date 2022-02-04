//==============================================================================
// Constructor
//==============================================================================
function CreateLocation(site) {

    this.site = site;
    this.map = site.map;
    this.location;
    this.marker;
    this.existingLocationName;

    this.discardModal = new bootstrap.Modal(document.getElementById('discardModal'));
    this.saveModal = new bootstrap.Modal(document.getElementById('saveLocationModal'));

    this.site.modalValues.layerType(this.site.editMode === "CreatePortage" ? "Portage" : "Campsite");

    this.map.on('click', this.onMapClick);

    this.location = JSON.parse(window.sessionStorage.getItem("location"));
    if (this.location)
        this.addLocation(this.location.latitude, this.location.longitude);

    this.existingLocationName = window.sessionStorage.getItem("existingLayerName");
    if (this.existingLocationName) {
        var nameInput = document.getElementById('saveLocationNameInput');
        nameInput.value = this.existingLocationName;
        nameInput.readOnly = true;

        document.getElementById('saveLocationDescriptionInput').value = window.sessionStorage.getItem("existingLayerDescription");
    }
}

//==============================================================================
// Public Methods
//==============================================================================
CreateLocation.prototype.showDiscard = function () {

    if (!this.location && !this.existingLocationName) {
        this.site.editMode = "View";
        window.location.reload();
        return;
    }

    this.discardModal.show();
}

CreateLocation.prototype.discard = function () {

    this.site.editMode = "View";
    this.location = null;
    this.existingLocationName = null;
    window.location.reload();
}

CreateLocation.prototype.showSave = function () {

    if (!this.site.userId || this.site.userId === '') {
        window.location = "/Account/SignIn";
        return;
    }

    this.saveModal.show();
}

CreateLocation.prototype.save = function () {

    var body = new FormData(document.getElementById('saveLocationForm'));

    body.append('UserId', this.site.userId);
    body.append('Type', this.site.editMode === "CreatePortage" ? 0 : 1);
    body.append('Latitude', this.location.latitude);
    body.append('Longitude', this.location.longitude);

    var options = {
        method: 'POST',
        body: body
    };

    var url = '/data/saveLocation';
    if (this.existingLocationName)
        url = '/data/updateLocation';

    fetch(url, options)
        .then(response => {
            if (response.status == 201) {
                this.site.editMode = "View";
                this.location = null;
                this.existingLocationName = null;
                window.location.reload();
            }
            else
                return response.text();
        })
        .then(html => {
            var newForm = new DOMParser().parseFromString(html, "text/html").getElementById("saveLocationForm");
            document.getElementById("saveLocationForm").innerHTML = newForm.innerHTML;
        });
}

//==============================================================================
// Overrides
//==============================================================================
CreateLocation.prototype.onBeforeUnloadLayer = function () {

    window.sessionStorage.setItem("location", JSON.stringify(this.location));

    if (!this.existingLocationName) {
        window.sessionStorage.removeItem("existingLayerName");
        window.sessionStorage.removeItem("existingLayerDescription");
    }
}

//==============================================================================
// Event Handlers
//==============================================================================
CreateLocation.prototype.onMapClick = function (e) {

    var self = layer;

    if (self.location)
        self.marker.setLatLng(e.latlng);
    else
        self.addLocation(e.latlng.lat, e.latlng.lng);

    self.location = { latitude: e.latlng.lat, longitude: e.latlng.lng };
}

CreateLocation.prototype.onCoordinateMove = function (e) {

    var self = layer;

    self.location.latitude = e.latlng.lat
    self.location.longitude = e.latlng.lng;
}

//==============================================================================
// Private Methods
//==============================================================================
CreateLocation.prototype.addLocation = function (latitude, longitude) {

    this.marker = L.marker(
        L.latLng(latitude, longitude),
        { draggable: true });

    this.marker.addTo(this.map);

    var icon = this.site.editMode === "CreatePortage" ? this.site.yellowMarker : this.site.orangeMarker;
    this.marker.setIcon(icon);

    this.marker.on('move', this.onCoordinateMove);
}