// 🌍 Default location (New Delhi)
const defaultLat = 28.6139;
const defaultLon = 77.2090;
const defaultZoom = 12;

//  Initialize map safely after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Make sure the map container exists
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.error(" Map container not found in DOM!");
    return;
  }

  let map, lat, lon;

  if (
    listingGeometry &&
    listingGeometry.coordinates &&
    Array.isArray(listingGeometry.coordinates) &&
    listingGeometry.coordinates.length === 2
  ) {
    // GeoJSON order is [longitude, latitude]
    [lon, lat] = listingGeometry.coordinates;

    console.log(" Using listing coordinates:", lat, lon);

    map = L.map("map").setView([lat, lon], 13);

    // Add marker at listing location
    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<h4>${listingTitle}</h4><p>Exact location will be provided after booking</p>`)
      .openPopup();
  } else {
    //  Fallback: No geometry data available
    console.warn(" No geometry found — showing default location");
    map = L.map("map").setView([defaultLat, defaultLon], defaultZoom);

    // Add a default marker
    L.marker([defaultLat, defaultLon])
      .addTo(map)
      .bindPopup(`<h4>${listingTitle}</h4><p>Exact location will be provided after booking</p>`)
      .openPopup();
  }

  //  Add OpenStreetMap tiles (must be added after map initialization)
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
});
