//==============================================================================
// Constructor
//==============================================================================
function ViewAll(site) {

    this.site = site;
    this.map = site.map;

    fetch('/data/routes')
        .then(response => response.json())
        .then(routes => this.drawRoutes(routes));

    fetch('/data/locations')
        .then(response => response.json())
        .then(locations => this.drawLocations(locations));
}

//==============================================================================
// Public Methods
//==============================================================================
ViewAll.prototype.createRoute = function () {

    this.site.editMode = "CreateRoute";
    window.location.reload();
}

ViewAll.prototype.createPortage = function () {

    this.site.editMode = "CreatePortage";
    window.location.reload();
}

ViewAll.prototype.createCampsite = function () {

    this.site.editMode = "CreateCampsite";
    window.location.reload();
}

//==============================================================================
// Private Methods
//==============================================================================
ViewAll.prototype.drawRoutes = function (routes) {

    for (var route of routes) {

        var coordinates = [];

        for (var coordinate of route.coordinates) {
            coordinates.push([coordinate.latitude, coordinate.longitude]);
        }

        var lineOptions = {
            color: 'blue',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        };

        L.polyline(coordinates, lineOptions).addTo(this.map);
    }
}

ViewAll.prototype.drawLocations = function (locations) {

    for (var location of locations) {

        var marker = L.marker(L.latLng(location.latitude, location.longitude));
        marker.addTo(this.map);

        var icon = location.type === 0 ? this.site.yellowMarker : this.site.orangeMarker;
        marker.setIcon(icon);
    }
}