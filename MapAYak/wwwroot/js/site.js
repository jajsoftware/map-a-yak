//==============================================================================
// Constructor
//==============================================================================
function Site() {

    this.map;
    this.editMode;
    this.defaultMarker;
    this.greenMarker;
    this.redMarker;
    this.yellowMarker;
    this.orangeMarker;
    this.layer;

    this.modalValues = {
        layerDescription: ""
    };

    ko.applyBindings(this.modalValues);

    this.initializeMap();
    this.initializeMarkers();
    this.setEditMode();

    window.onbeforeunload = this.onBeforeUnload;
}

//==============================================================================
// Public Methods
//==============================================================================
Site.prototype.getLayer = function () {

    switch (this.editMode) {

        case "CreateRoute":
            this.layer = new CreateRoute(this);
            break;

        case "CreatePortage":
        case "CreateCampsite":
            this.layer = new CreateLocation(this);
            break;

        default:
            this.layer = new ViewAll(this);
            break;
    }

    return this.layer;
}

//==============================================================================
// Overrides
//==============================================================================
Site.prototype.onBeforeUnload = function () {

    var self = site;

    window.sessionStorage.setItem("editMode", self.editMode);

    if (self.layer.onBeforeUnloadLayer)
        self.layer.onBeforeUnloadLayer();
}

//==============================================================================
// Private Methods
//==============================================================================
Site.prototype.initializeMap = function () {

    this.map = L.map('map');

    var mapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var mapOptions = {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };

    L.tileLayer(mapUrl, mapOptions).addTo(this.map);

    // Save coordinates and zoom level as cookies. (just Michigan right now)
    this.map.setView([43.5, -84.5], 7);
}

Site.prototype.initializeMarkers = function () {

    this.defaultMarker = L.marker().getIcon();

    this.greenMarker = L.icon({
        iconUrl: 'images/green-marker.png',
        shadowUrl: 'images/marker-shadow.png'
    });

    this.redMarker = L.icon({
        iconUrl: 'images/red-marker.png',
        shadowUrl: 'images/marker-shadow.png'
    });

    this.yellowMarker = L.icon({
        iconUrl: 'images/green-marker.png',
        shadowUrl: 'images/marker-shadow.png'
    });

    this.orangeMarker = L.icon({
        iconUrl: 'images/red-marker.png',
        shadowUrl: 'images/marker-shadow.png'
    });
}

Site.prototype.setEditMode = function () {

    this.editMode = window.sessionStorage.getItem("editMode") ?? "View";

    if (this.editMode === "View") {
        document.getElementById("createLayerDiv").style.display = 'none';
        L.DomUtil.removeClass(this.map._container, 'crosshair-cursor');
    }
    else {
        document.getElementById("viewLayerDiv").style.display = 'none';
        L.DomUtil.addClass(this.map._container, 'crosshair-cursor');
    }
}