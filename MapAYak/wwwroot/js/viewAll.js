//==============================================================================
// Constructor
//==============================================================================
function ViewAll(site) {

    this.site = site;
    this.map = site.map;
    this.selectedLocationName;
    this.selectedRouteName;
    this.selectedRouteLine;
    this.selectedRouteStartMarker;
    this.selectedRouteEndMarker;
    this.routePreviewLine;

    this.routeMarkers = [];
    this.locationMarkers = [];
    this.userLayersModal = new bootstrap.Modal(document.getElementById('userLayersModal'));
    this.deleteConfirmationModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));

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
    this.hideLocation();
    document.getElementById('detailsModal').style.display = 'none';
}

ViewAll.prototype.showUserLayers = function () {

    this.closeDetails();

    this.userLayersModal.show();

    fetch(`/data/userLayers?userId=${this.site.userId}`)
        .then(response => response.json())
        .then(layers => this.updateUserLayers(layers));
}

ViewAll.prototype.viewUserLayer = function (name, type) {

    var markers = type === 0 ? this.routeMarkers : this.locationMarkers;
    var marker = markers.find(c => c.name === name);

    this.map.setView(marker.getLatLng(), 12);
    this.userLayersModal.hide();

    if (type === 0)
        this.showRoute(marker);
    else
        this.showLocation(marker);
}

ViewAll.prototype.editUserLayer = function (name, type, description) {

    var markers = type === 0 ? this.routeMarkers : this.locationMarkers;
    var marker = markers.find(c => c.name === name);

    window.sessionStorage.setItem("existingLayerName", name);
    window.sessionStorage.setItem("existingLayerDescription", description);

    if (type === 0) {
        var coordinates = [];
        marker.coordinates.forEach(c => coordinates.push({ latitude: c.latitude, longitude: c.longitude }));
        window.sessionStorage.setItem("coordinates", JSON.stringify(coordinates));
    }
    else
        window.sessionStorage.setItem("location", JSON.stringify({ latitude: marker.latitude, longitude: marker.longitude }));

    this.map.setView(marker.getLatLng(), 12);

    if (type === 0)
        this.createRoute();
    else if (type === 1)
        this.createPortage();
    else if (type === 2)
        this.createCampsite();
}

ViewAll.prototype.showDeleteUserLayer = function (name, type) {

    this.site.modalValues.layerName(name);

    if (type === 0)
        this.site.modalValues.layerType('Route');
    else if (type === 1)
        this.site.modalValues.layerType('Portage');
    else if (type === 2)
        this.site.modalValues.layerType('Campsite');

    this.userLayersModal.hide();
    this.deleteConfirmationModal.show();
}

ViewAll.prototype.deleteUserLayer = function () {

    var name = this.site.modalValues.layerName();

    var layerType = this.site.modalValues.layerType();
    if (layerType !== 'Route')
        layerType = 'Location';

    fetch(`/data/delete${layerType}?name=${name}`)
        .then(response => {
            if (response.status === 201)
                window.location.reload();
        });
}

//==============================================================================
// Event Handlers
//==============================================================================
ViewAll.prototype.onRouteClick = function (e) {

    var self = layer;

    if (self.selectedRouteName === e.target.name)
        self.closeDetails();
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

    if (self.selectedLocationName === e.target.name)
        self.closeDetails();
    else
        self.showLocation(e.target);
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

        this.routeMarkers.push(marker);
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
        marker.latitude = location.latitude;
        marker.longitude = location.longitude;

        this.locationMarkers.push(marker);
    }
}

ViewAll.prototype.showRoute = function (startMarker) {

    this.hideRoute();
    this.hideLocation();
    this.selectedRouteName = startMarker.name;

    var coordinates = [];
    for (var coordinate of startMarker.coordinates) {
        coordinates.push([coordinate.latitude, coordinate.longitude]);
    }

    var distance = 0;
    for (var i = 0; i < coordinates.length - 1; i++)
        distance += L.latLng(coordinates[i]).distanceTo(L.latLng(coordinates[i + 1]));

    var lineOptions = {
        color: 'blue',
        weight: 3,
        opacity: 0.75,
        smoothFactor: 1
    };

    this.selectedRouteLine = L.polyline(coordinates, lineOptions).addTo(this.map);

    this.selectedRouteStartMarker = startMarker;
    this.selectedRouteStartMarker.setIcon(this.site.greenMarker);

    this.selectedRouteEndMarker = L.marker(L.latLng(startMarker.coordinates.at(-1).latitude, startMarker.coordinates.at(-1).longitude)).addTo(this.map);
    this.selectedRouteEndMarker.setIcon(this.site.redMarker);

    this.site.modalValues.layerType('Route');
    this.site.modalValues.layerName(startMarker.name);
    this.site.modalValues.layerUser(startMarker.user);
    this.site.modalValues.layerDescription(startMarker.description);
    this.site.modalValues.layerMarkerPath('/images/blue-marker.png');
    this.site.modalValues.routeDistance((distance / 1609.34).toFixed(2)); // Converts meters to miles and rounds.
    document.getElementById('distanceInfo').style.display = 'block';
    document.getElementById('detailsModal').style.display = 'block';
}

ViewAll.prototype.hideRoute = function () {

    this.hidePreview();

    if (!this.selectedRouteName)
        return;

    this.selectedRouteLine.remove();
    this.selectedRouteEndMarker.remove();
    this.selectedRouteStartMarker.setIcon(this.site.defaultMarker);

    this.selectedRouteName = '';
    this.selectedRouteLine = null;
    this.selectedRouteStartMarker = null;
    this.selectedRouteEndMarker = null;
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

    this.routePreviewLine = L.polyline(coordinates, lineOptions).addTo(this.map);
}

ViewAll.prototype.hidePreview = function () {

    if (!this.routePreviewLine)
        return;

    this.routePreviewLine.remove();
    this.routePreviewLine = null;
}

ViewAll.prototype.showLocation = function (marker) {

    this.selectedLocationName = marker.name;

    this.site.modalValues.layerName(marker.name);
    this.site.modalValues.layerUser(marker.user);
    this.site.modalValues.layerDescription(marker.description);

    if (marker.type === 0) {
        this.site.modalValues.layerType('Portage');
        this.site.modalValues.layerMarkerPath('/images/yellow-marker.png');
    }
    else {
        this.site.modalValues.layerType('Campsite');
        this.site.modalValues.layerMarkerPath('/images/orange-marker.png');
    }

    document.getElementById('distanceInfo').style.display = 'none';
    document.getElementById('detailsModal').style.display = 'block';
}

ViewAll.prototype.hideLocation = function () {

    this.selectedLocationName = '';
}

ViewAll.prototype.updateUserLayers = function (layers) {

    var html = '';

    for (var layer of layers) {

        var description = layer.description;
        if (!description || description === '')
            description = 'No description.';

        var markerPath = '/images/blue-marker.png';
        if (layer.layerType === 1)
            markerPath = '/images/yellow-marker.png';
        else if (layer.layerType === 2)
            markerPath = '/images/orange-marker.png';

        if (html !== '')
            html += '<hr />';

        html += `
            <div class="row">
                <h5>
                    <a onclick="layer.showDeleteUserLayer('${layer.name}',${layer.layerType})" class="btn btn-danger btn-sm float-end ms-1">Delete</a>
                    <a onclick="layer.editUserLayer('${layer.name}',${layer.layerType},'${layer.description ?? ''}')" class="btn btn-warning btn-sm float-end ms-1">Edit</a>
                    <a onclick="layer.viewUserLayer('${layer.name}',${layer.layerType})" class="btn btn-info btn-sm float-end">View</a>
                    <img src="${markerPath}" class="text-marker-icon" alt="Marker">
                    <span class="align-middle ms-1">${layer.name}</span>
                </h5>
                <p>${description}</p>
            </div>`;
    }

    if (html === '')
        html = '<p>You have not created any routes, portages or campsites yet.</p>';

    document.getElementById('userLayersModalBody').innerHTML = html;
}