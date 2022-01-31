//==============================================================================
// Constructor
//==============================================================================
function CreateLocation(site) {

    this.site = site;
    this.map = site.map;
    this.location;
    this.marker;

    this.map.on('click', this.onMapClick);

    this.location = JSON.parse(window.sessionStorage.getItem("location"));
    if (this.location)
        this.addLocation(this.location.latitude, this.location.longitude);
}

//==============================================================================
// Public Methods
//==============================================================================
CreateLocation.prototype.showDiscard = function () {

    if (!this.location) {
        this.site.editMode = "View";
        window.location.reload();
        return;
    }

    var modal = new bootstrap.Modal(document.getElementById('discardModal'));
    modal.show();
}

CreateLocation.prototype.discard = function () {

    this.location = null;
    this.site.editMode = "View";
    window.location.reload();
}

CreateLocation.prototype.showSave = function () {

    if (window.sessionStorage.getItem("authenticated") !== "True") {
        window.location = "/Account/SignIn";
        return;
    }

    var modal = new bootstrap.Modal(document.getElementById('saveLocationModal'));
    modal.show();
}

CreateLocation.prototype.save = function () {

    var body = new FormData(document.getElementById('saveLocationForm'));

    body.append('Type', this.site.editMode === "CreatePortage" ? 0 : 1);
    body.append('Latitude', this.location.latitude);
    body.append('Longitude', this.location.longitude);

    var options = {
        method: 'POST',
        body: body
    };

    fetch('/data/saveLocation', options)
        .then(response => {
            if (response.status == 201) {
                this.location = null;
                this.site.editMode = "View";
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
}