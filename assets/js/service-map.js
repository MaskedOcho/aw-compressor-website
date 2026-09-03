// Renders the multi-pin service area map on the Service Areas page using
// Leaflet + OpenStreetMap. Free, no API key, no billing account required.

var SERVICE_AREAS = [
  { name: "Maynardville, TN (Headquarters)", lat: 36.2445, lng: -83.8047, hq: true },
  { name: "Knoxville, TN", lat: 35.9606, lng: -83.9207 },
  { name: "Knox County", lat: 35.9165, lng: -83.9177 },
  { name: "Union County", lat: 36.2946, lng: -83.8241 },
  { name: "Anderson County (Clinton)", lat: 36.1023, lng: -84.1310 },
  { name: "Sevier County (Sevierville)", lat: 35.8682, lng: -83.5614 },
  { name: "Blount County (Maryville)", lat: 35.7565, lng: -83.9705 },
];

function initServiceMap() {
  var mapEl = document.getElementById("service-map");
  if (!mapEl || typeof L === "undefined") return;

  mapEl.innerHTML = "";
  mapEl.classList.add("map-live");

  var map = L.map(mapEl, { scrollWheelZoom: false }).setView([36.05, -83.95], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  var bounds = [];
  SERVICE_AREAS.forEach(function (area) {
    var marker = L.circleMarker([area.lat, area.lng], {
      radius: area.hq ? 10 : 7,
      fillColor: area.hq ? "#f2994a" : "#1d6fae",
      fillOpacity: 1,
      color: "#ffffff",
      weight: 2,
    }).addTo(map);
    marker.bindPopup(
      "<strong>" + area.name + "</strong>" + (area.hq ? "<br>A&amp;W Compressor Headquarters" : "<br>Service Area")
    );
    bounds.push([area.lat, area.lng]);
  });

  map.fitBounds(bounds, { padding: [30, 30] });
}

document.addEventListener("DOMContentLoaded", initServiceMap);
