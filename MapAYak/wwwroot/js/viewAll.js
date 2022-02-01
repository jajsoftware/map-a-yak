//==============================================================================
// Constructor
//==============================================================================
function ViewAll(site) {

    this.site = site;
    this.map = site.map;
    this.routeName;
    this.routeLine;
    this.routeStartMarker;
    this.routeEndMarker;
    this.routePreview;
    this.locationName;

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

ViewAll.prototype.closeDetails = function () {

    this.hideRoute();
    document.getElementById('detailsModal').style.display = 'none';
}

//==============================================================================
// Event Handlers
//==============================================================================
ViewAll.prototype.onRouteClick = function (e) {

    var self = layer;

    if (self.routeName === e.target.name)
        self.hideRoute();
    else
        self.showRoute(e.target);
}

ViewAll.prototype.onRouteHover = function (e) {

    var self = layer;
    self.showPreview(e.target);
}

ViewAll.prototype.onRouteLeaveHover = function (e) {

    var self = layer;
    self.hidePreview();
}

ViewAll.prototype.onLocationClick = function (e) {

    var self = layer;

    if (self.locationName === e.target.name) {
        document.getElementById('detailsModal').style.display = 'none';
        return;
    }

    self.site.modalValues.layerName(e.target.name);
    self.site.modalValues.layerUser(e.target.user);
    self.site.modalValues.layerDescription(e.target.description);

    if (e.target.type === 0) {
        self.site.modalValues.layerType('Portage');
        self.site.modalValues.layerMarkerPath('/images/yellow-marker.png');
    }
    else {
        self.site.modalValues.layerType('Campsite');
        self.site.modalValues.layerMarkerPath('/images/orange-marker.png');
    }

    document.getElementById('detailsModal').style.display = 'block';
}

//==============================================================================
// Private Methods
//==============================================================================
ViewAll.prototype.drawRoutes = function (routes) {

    for (var route of routes) {

        var marker = L.marker(L.latLng(route.coordinates[0].latitude, route.coordinates[0].longitude));
        marker.addTo(this.map);

        marker.on('click', this.onRouteClick);
        marker.on('mouseover', this.onRouteHover);
        marker.on('mouseout', this.onRouteLeaveHover);

        marker.name = route.name;
        marker.user = route.userName;
        marker.description = route.description && route.description !== '' ? route.description : 'No description.';
        marker.coordinates = route.coordinates;
    }
}

ViewAll.prototype.drawLocations = function (locations) {

    for (var location of locations) {

        var marker = L.marker(L.latLng(location.latitude, location.longitude));
        marker.addTo(this.map);

        var icon = location.type === 0 ? this.site.yellowMarker : this.site.orangeMarker;
        marker.setIcon(icon);

        marker.on('click', this.onLocationClick);

        marker.name = location.name;
        marker.user = location.userName;
        marker.description = location.description && location.description !== '' ? location.description : 'No description.';
        marker.type = location.type;
    }
}

ViewAll.prototype.showRoute = function (startMarker) {

    this.hideRoute();
    this.routeName = startMarker.name;

    var coordinates = [];
    for (var coordinate of startMarker.coordinates) {
        coordinates.push([coordinate.latitude, coordinate.longitude]);
    }

    var lineOptions = {
        color: 'blue',
        weight: 3,
        opacity: 0.75,
        smoothFactor: 1
    };

    this.routeLine = L.polyline(coordinates, lineOptions).addTo(this.map);

    this.routeStartMarker = startMarker;
    this.routeStartMarker.setIcon(this.site.greenMarker);

    this.routeEndMarker = L.marker(L.latLng(startMarker.coordinates.at(-1).latitude, startMarker.coordinates.at(-1).longitude)).addTo(this.map);
    this.routeEndMarker.setIcon(this.site.redMarker);

    this.site.modalValues.layerType('Route');
    this.site.modalValues.layerName(startMarker.name);
    this.site.modalValues.layerUser(startMarker.user);
    this.site.modalValues.layerDescription(startMarker.description);
    this.site.modalValues.layerMarkerPath('/images/blue-marker.png');
    document.getElementById('detailsModal').style.display = 'block';
}

ViewAll.prototype.hideRoute = function () {

    this.hidePreview();

    if (!this.routeName)
        return;

    this.routeLine.remove();
    this.routeEndMarker.remove();
    this.routeStartMarker.setIcon(this.site.defaultMarker);

    document.getElementById('detailsModal').style.display = 'none';

    this.routeName = '';
    this.routeLine = null;
    this.routeStartMarker = null;
    this.routeEndMarker = null;
}

ViewAll.prototype.showPreview = function (startMarker) {

    var coordinates = [];
    for (var coordinate of startMarker.coordinates) {
        coordinates.push([coordinate.latitude, coordinate.longitude]);
    }

    var lineOptions = {
        color: 'red',
        weight: 5,
        opacity: 0.75,
        smoothFactor: 1
    };

    this.routePreview = L.polyline(coordinates, lineOptions).addTo(this.map);
}

ViewAll.prototype.hidePreview = function () {

    if (!this.routePreview)
        return;

    this.routePreview.remove();
    this.routePreview = null;
}