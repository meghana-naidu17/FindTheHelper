/* =====================================================================
   SkillConnect — geolocation + distance helpers
   Depends on: state.js, db.js
===================================================================== */
const HYD = [17.4326, 78.4071]; // fallback demo location — Jubilee Hills, Hyderabad (used only if GPS is unavailable/denied)
let userLocation = HYD.slice();   // the customer's actual location — updated by requestUserLocation()
let userLocationLabel = "Jubilee Hills, Hyderabad (demo location)";
let userLocationIsReal = false;
const NEARBY_RADIUS_KM = 12; // only show helpers within this radius by default

// Ask the browser for the customer's real GPS coordinates. Falls back to the
// demo Hyderabad location if permission is denied, unavailable, or times out.
function requestUserLocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) { resolve(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        userLocation = [pos.coords.latitude, pos.coords.longitude];
        userLocationIsReal = true;
        userLocationLabel = 'your current location';
        // Best-effort, key-free reverse geocoding for a friendly place name.
        // Silently falls back to the coordinates if it's unavailable (e.g. offline).
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
          const j = await r.json();
          const place = [j.locality, j.principalSubdivision].filter(Boolean).join(', ');
          if (place) userLocationLabel = place;
        } catch (e) { /* offline or blocked — coordinates still work fine */ }
        resolve(true);
      },
      () => resolve(false),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  });
}

// Re-anchors every seed worker's real lat/lng to sit around the user's actual
// detected location, using each worker's fixed latOffset/lngOffset (their
// position relative to one another stays the same, only the center point
// shifts to wherever the user really is). Workers created via registration
// don't carry an offset — they were already placed near userLocation when
// created, so they're left untouched here.
async function anchorWorkersToLocation() {
  for (const w of workers) {
    if (typeof w.latOffset === 'number') {
      w.lat = userLocation[0] + w.latOffset;
      w.lng = userLocation[1] + w.lngOffset;
      if (idb) await dbPut('workers', w);
    }
  }
}

function updateLocationLabelUI() {
  const el = document.getElementById('locationLabelText');
  if (!el) return;
  el.innerText = userLocationIsReal
    ? `📡 Showing pros near ${userLocationLabel}`
    : `⚠️ Location access unavailable — showing demo helpers near ${userLocationLabel}`;
}

async function refreshUserLocation() {
  const el = document.getElementById('locationLabelText');
  if (el) el.innerText = 'Detecting your location…';
  const ok = await requestUserLocation();
  // Don't re-anchor helpers mid-job — it would teleport a worker who's already
  // live-tracking toward you. Only reposition when there's no active booking.
  if (!activeBooking) await anchorWorkersToLocation();
  updateLocationLabelUI();
  recomputeMapBounds();
  applyFilters();
  if (currentUser?.role === 'customer') initNearbyMap();
  if (!ok) showToast('Could not access your GPS — using demo location instead');
  else showToast('📍 Location updated');
}

function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b[0]-a[0]) * Math.PI/180;
  const dLng = (b[1]-a[1]) * Math.PI/180;
  const s = Math.sin(dLat/2)**2 + Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}
