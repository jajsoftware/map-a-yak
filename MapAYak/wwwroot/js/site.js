var map = L.map('map');

var mapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var mapOptions = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

L.tileLayer(mapUrl, mapOptions).addTo(map);

map.setView([43.5, -84.5], 7); // Just centers Michigan for now.