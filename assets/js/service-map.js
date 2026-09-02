// Renders the multi-pin Google Map on the Service Areas page.
// No-op if #service-map isn't on the page, or no API key has been set in maps-config.js.

var SERVICE_AREAS = [
  { name: "Maynardville, TN (Headquarters)", lat: 36.2445, lng: -83.8047, hq: true },
  { name: "Knoxville, TN", lat: 35.9606, lng: -83.9207 },
  { name: "Knox County", lat: 35.9165, lng: -83.9177 },
  { name: "Union County", lat: 36.2946, lng: -83.8241 },
  { name: "Anderson County (Clinton)", lat: 36.1023, lng: -84.1310 },
  { name: "Sevier County (Sevierville)", lat: 35.8682, lng: -83.5614 },
  { name: "Blount County (Maryville)", lat: 35.7565, lng: -83.9705 }
];

var NAVY_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#eef1f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#2b3440" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#5a6675" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f7f8fa" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#dde3ea" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dde3ea" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d6e6" }] }
];

function initServiceMap() {
  var mapEl = document.getElementById("service-map");
  if (!mapEl || typeof google === "undefined") return;

  mapEl.innerHTML = "";
  mapEl.classList.remove("map-block");
  mapEl.classList.add("map-live");

  var map = new google.maps.Map(mapEl, {
    zoom: 9,
    center: { lat: 36.05, lng: -83.95 },
    styles: NAVY_MAP_STYLE
  });

  var bounds = new google.maps.LatLngBounds();
  var infoWindow = new google.maps.InfoWindow();

  SERVICE_AREAS.forEach(function (area) {
    var marker = new google.maps.Marker({
      position: { lat: area.lat, lng: area.lng },
      map: map,
      title: area.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: area.hq ? 10 : 7,
        fillColor: area.hq ? "#f2994a" : "#1d6fae",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });
    marker.addListener("click", function () {
      infoWindow.setContent(
        "<strong>" + area.name + "</strong>" + (area.hq ? "<br>A&amp;W Compressor Headquarters" : "<br>Service Area")
      );
      infoWindow.open(map, marker);
    });
    bounds.extend(marker.getPosition());
  });

  map.fitBounds(bounds);
}

(function () {
  var mapEl = document.getElementById("service-map");
  if (!mapEl) return;

  var key = window.GOOGLE_MAPS_API_KEY;
  if (!key || key === "YOUR_API_KEY_HERE") {
    return; // leave the static placeholder showing until a real key is set
  }

  var script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) + "&callback=initServiceMap";
  script.async = true;
  document.head.appendChild(script);
})();
