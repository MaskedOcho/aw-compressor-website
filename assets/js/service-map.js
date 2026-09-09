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

// Real shop addresses, used on the Contact page's map instead of the
// county-level service-area view above.
var SHOP_LOCATIONS = [
  { name: "Maynardville Shop", address: "2423 Maynardville Hwy, Maynardville, TN 37807", lat: 36.2168554, lng: -83.8594912 },
  { name: "Cookeville Shop", address: "1510 Holladay Road, Cookeville, TN 38506", lat: 36.1350120, lng: -85.5448677 },
  { name: "Johnson City Shop", address: "1400 E Millard Street, Johnson City, TN 37601", lat: 36.3328560, lng: -82.3389610 },
];

function initServiceMap() {
  var mapEl = document.getElementById("service-map");
  if (!mapEl || typeof L === "undefined") return;

  var shopMode = mapEl.dataset.mode === "shops";
  var points = shopMode ? SHOP_LOCATIONS : SERVICE_AREAS;

  mapEl.innerHTML = "";
  mapEl.classList.add("map-live");

  var map = L.map(mapEl, { scrollWheelZoom: false }).setView([36.05, -83.95], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  var bounds = [];
  points.forEach(function (area) {
    var marker = L.circleMarker([area.lat, area.lng], {
      radius: shopMode ? 9 : (area.hq ? 10 : 7),
      fillColor: shopMode || area.hq ? "#f2994a" : "#1d6fae",
      fillOpacity: 1,
      color: "#ffffff",
      weight: 2,
    }).addTo(map);
    var popup = shopMode
      ? "<strong>" + area.name + "</strong><br>" + area.address
      : "<strong>" + area.name + "</strong>" + (area.hq ? "<br>A&amp;W Compressor Headquarters" : "<br>Service Area");
    marker.bindPopup(popup);
    bounds.push([area.lat, area.lng]);
  });

  map.fitBounds(bounds, { padding: [30, 30] });
}

document.addEventListener("DOMContentLoaded", initServiceMap);
