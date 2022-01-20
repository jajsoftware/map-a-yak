//==============================================================================
// Constructor
//==============================================================================
function CreateRoute(site) {

    this.site = site;
    this.map = site.map;
    this.greenMarker = site.greenMarker;
    this.redMarker = site.redMarker;
    this.coordinates = [];
    this.markers = [];
    this.line;

    this.map.on('click', this.onMapClick);

    var coordinates = JSON.parse(window.sessionStorage.getItem("coordinates"));
    if (!coordinates || coordinates.length === 0)
        return;

    for (var coordinate of coordinates)
        this.addCoordinate(coordinate.latitude, coordinate.longitude);

    this.markers[0].setIcon(this.greenMarker);
    if (this.markers.length > 1)
        this.markers.at(-1).setIcon(this.redMarker);

    this.updateLine();
}

//==============================================================================
// Public Methods
//==============================================================================
CreateRoute.prototype.showDiscard = function () {

    if (this.coordinates.length === 0) {
        this.site.editMode = "View";
        window.location.reload();
        return;
    }

    var modal = new bootstrap.Modal(document.getElementById('discardModal'));
    modal.show();
}

CreateRoute.prototype.discard = function () {

    this.coordinates = [];
    this.site.editMode = "View";
    window.location.reload();
}

CreateRoute.prototype.showSave = function () {

    if (window.sessionStorage.getItem("authenticated") !== "True") {
        window.location = "/Account/SignIn";
        return;
    }

    var modal = new bootstrap.Modal(document.getElementById('saveRouteModal'));
    modal.show();
}

CreateRoute.prototype.save = function () {

    var body = new FormData(document.getElementById('saveRouteForm'));

    for (var i = 0; i < this.coordinates.length; i++) {
        body.append(`Coordinates[${i}].Latitude`, this.coordinates[i].latitude);
        body.append(`Coordinates[${i}].Longitude`, this.coordinates[i].longitude);
    }

    var options = {
        method: 'POST',
        body: body
    };

    fetch('/data/saveRoute', options)
        .then(response => {
            if (response.status == 201) {
                this.coordinates = [];
                this.site.editMode = "View";
                window.location.reload();
            }
            else
                return response.text();
        })
        .then(html => {
            var newForm = new DOMParser().parseFromString(html, "text/html").getElementById("saveRouteForm");
            document.getElementById("saveRouteForm").innerHTML = newForm.innerHTML;
        });
}

CreateRoute.prototype.removeCoordinate = function (coordinateGuid) {

    var index = this.coordinates.findIndex(c => c.coordinateGuid === coordinateGuid);
    var marker = this.markers.find(c => c.coordinateGuid == coordinateGuid);

    marker.remove();
    this.coordinates.splice(index, 1);
    this.markers.splice(index, 1);

    if (index == 0 && this.markers.length > 0)
        this.markers[0].setIcon(this.greenMarker);
    else if (index == this.markers.length && this.markers.length > 1)
        this.markers[index - 1].setIcon(this.redMarker);

    this.updateLine();
}

//==============================================================================
// Overrides
//==============================================================================
CreateRoute.prototype.onBeforeUnloadLayer = function () {

    window.sessionStorage.setItem("coordinates", JSON.stringify(this.coordinates));
}

//==============================================================================
// Event Handlers
//==============================================================================
CreateRoute.prototype.onMapClick = function (e) {

    var self = layer;

    self.addCoordinate(e.latlng.lat, e.latlng.lng);
    self.updateLine();

    if (self.markers.length === 1) {
        self.markers[0].setIcon(self.greenMarker);
    }
    else if (self.markers.length == 2) {
        self.markers[0].setIcon(self.greenMarker);
        self.markers[1].setIcon(self.redMarker);
    }
    else {
        self.markers.at(-2).setIcon(self.site.defaultMarker);
        self.markers.at(-1).setIcon(self.redMarker);
    }
}

CreateRoute.prototype.onCoordinateMove = function (e) {

    var self = layer;

    self.moveCoordinate(e.target.coordinateGuid, e.latlng);
    self.updateLine();
}

CreateRoute.prototype.onGetCoordinateHtml = function (e) {

    return `<a onclick="layer.removeCoordinate('${e.coordinateGuid}')" class="text-danger">Remove</a>`;
}

//==============================================================================
// Private Methods
//==============================================================================
CreateRoute.prototype.addCoordinate = function (latitude, longitude) {

    var marker = L.marker(
        L.latLng(latitude, longitude),
        { draggable: true });

    marker.addTo(this.map);
    marker.on('move', this.onCoordinateMove);
    marker.bindPopup(this.onGetCoordinateHtml);

    marker.coordinateGuid = this.createGuid();

    this.coordinates.push({ latitude: latitude, longitude: longitude, coordinateGuid: marker.coordinateGuid });
    this.markers.push(marker);
}

CreateRoute.prototype.moveCoordinate = function (coordinateGuid, latlng) {

    var coordinate = this.coordinates.find(c => c.coordinateGuid === coordinateGuid);

    coordinate.latitude = latlng.lat;
    coordinate.longitude = latlng.lng;
}

CreateRoute.prototype.createGuid = function () {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
        c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

CreateRoute.prototype.updateLine = function () {

    if (this.line && this.map.hasLayer(this.line))
        this.map.removeLayer(this.line);

    var coordinates = this.coordinates.map(c => [c.latitude, c.longitude]);

    var lineOptions = {
        color: 'blue',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    };

    this.line = L.polyline(coordinates, lineOptions).addTo(this.map);
}