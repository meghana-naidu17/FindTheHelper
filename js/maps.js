/* =====================================================================
   SkillConnect — live tracking maps, rendered with Leaflet on real
   OpenStreetMap tiles (loaded via CDN in index.html).

   Previously this drew a fake illustrated SVG (a plain grid with a couple
   of decorative rectangles) — it never reflected real streets or geography,
   so it always looked identical no matter where a user actually was. This
   version renders an actual map of the area, with pins placed at real
   coordinates.

   Depends on: state.js, location.js, the global `L` from the Leaflet CDN
   script (must be loaded before this file — see index.html).
===================================================================== */

// One Leaflet map instance per container id. Several screens rebuild their
// container's innerHTML from scratch (e.g. renderBookingTracker,
// renderTechDashboard), which replaces the DOM node — so we detect a stale
// node and recreate the map rather than reusing a detached instance.
let mapInstances = {};

function escapeMapLabel(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function ensureLeafletMap(containerId) {
  if (typeof L === 'undefined') return null; // Leaflet failed to load (e.g. offline)
  const el = document.getElementById(containerId);
  if (!el) return null;

  let inst = mapInstances[containerId];
  if (inst && inst.el === el) return inst;
  if (inst) { try { inst.map.remove(); } catch (e) { /* already gone */ } delete mapInstances[containerId]; }

  const map = L.map(el, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: true,
    tap: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const layerGroup = L.layerGroup().addTo(map);

  inst = { map, layerGroup, routeLine: null, el };
  mapInstances[containerId] = inst;
  return inst;
}

function makePinIcon(cls, emoji, label) {
  return L.divIcon({
    className: 'sc-pin-icon',
    html: `<div class="map-pin-wrap"><div class="map-pin ${cls}"><span>${emoji}</span></div>${label ? `<span class="pin-label">${escapeMapLabel(label)}</span>` : ''}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
}

/**
 * Renders a real map into `containerId`.
 * markers: [{ id, pos:[lat,lng], cls, emoji, label }]
 * route: true to draw a dashed line between the first two markers
 * Returns a controller with setMarkerPos(id, latlng) and setRouteEnd(id, latlng).
 */
function renderMiniMap(containerId, { markers = [], route = false } = {}) {
  const inst = ensureLeafletMap(containerId);
  if (!inst) return null;
  const { map, layerGroup } = inst;

  layerGroup.clearLayers();
  inst.routeLine = null;

  const markerObjs = {};
  markers.forEach(m => {
    const marker = L.marker(m.pos, { icon: makePinIcon(m.cls, m.emoji, m.label) }).addTo(layerGroup);
    markerObjs[m.id] = marker;
  });

  if (route && markers.length >= 2) {
    inst.routeLine = L.polyline([markers[0].pos, markers[1].pos], {
      color: '#0f766e', weight: 3, dashArray: '5,7', opacity: 0.85
    }).addTo(layerGroup);
  }

  if (markers.length) {
    const bounds = L.latLngBounds(markers.map(m => m.pos));
    map.fitBounds(bounds.isValid() && markers.length > 1 ? bounds.pad(0.35) : bounds, { animate: false, maxZoom: 15 });
    if (markers.length === 1) map.setZoom(14);
  } else {
    map.setView(userLocation, 13);
  }
  // Containers created while hidden (display:none) report zero size to
  // Leaflet — kick a resize once the surrounding layout has settled.
  setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 60);

  return {
    setMarkerPos(id, latlng) {
      const marker = markerObjs[id];
      if (marker) marker.setLatLng(latlng);
      return latlng;
    },
    setRouteEnd(id, latlng) {
      if (!inst.routeLine) return;
      const latlngs = inst.routeLine.getLatLngs();
      latlngs[0] = L.latLng(latlng[0], latlng[1]);
      inst.routeLine.setLatLngs(latlngs);
    }
  };
}

// Kept as a no-op for backward compatibility — Leaflet's fitBounds handles
// framing automatically now, so there's no fixed viewport to recompute.
function recomputeMapBounds() {}

function initNearbyMap() {
  const markers = [
    { id: 'me', pos: userLocation, cls: 'pin-customer', emoji: '🏠', label: 'You' },
    ...workers.filter(w => w.online && w.name.trim().toLowerCase() !== 'user' && distanceKm(userLocation,[w.lat,w.lng]) <= NEARBY_RADIUS_KM)
      .map(w => ({ id: 'w' + w.id, pos: [w.lat, w.lng], cls: 'pin-worker', emoji: '🧰', label: w.name.split(' ')[0] }))
  ];
  renderMiniMap('nearbyMap', { markers });
}

function initWorkerNearbyMap() {
  const markers = [];
  if (activeBooking && !activeBooking.accepted) markers.push({ id: 'job', pos: userLocation, cls: 'pin-customer', emoji: '📍', label: 'Job request' });
  workers.filter(w => w.online && w.id !== currentUser.workerId && w.name.trim().toLowerCase() !== 'user').forEach(w => {
    markers.push({ id: 'w' + w.id, pos: [w.lat, w.lng], cls: 'pin-other', emoji: '🤝', label: w.name.split(' ')[0] });
  });
  renderMiniMap('workerNearbyMap', { markers });
}

function startLiveTracking(who) {
  const mapId = who === 'customer' ? 'custLiveMap' : 'techLiveMap';
  const el = document.getElementById(mapId);
  if (!el || !activeBooking) return;
  if (liveTrackers[who]) liveTrackers[who].stop();

  const dest = userLocation;
  const start = activeBooking.workerStart || [dest[0] + 0.03, dest[1] - 0.03];
  const controller = renderMiniMap(mapId, {
    route: true,
    markers: [
      { id: 'worker', pos: start, cls: 'pin-worker', emoji: '🧰', label: activeBooking.workerName.split(' ')[0] },
      { id: 'dest', pos: dest, cls: 'pin-customer', emoji: '🏠', label: 'You' }
    ]
  });
  if (!controller) return;

  let step = 0;
  const totalSteps = 22;
  const speedKmh = 26;

  function tick() {
    step++;
    const frac = Math.min(step / totalSteps, 1);
    const lat = start[0] + (dest[0] - start[0]) * frac;
    const lng = start[1] + (dest[1] - start[1]) * frac;
    controller.setMarkerPos('worker', [lat, lng]);
    controller.setRouteEnd('worker', [lat, lng]);
    const remainingKm = distanceKm([lat, lng], dest);
    const etaMin = Math.max(1, Math.round(remainingKm / speedKmh * 60));
    if (who === 'customer') {
      const dEl = document.getElementById('custDistStat'), eEl = document.getElementById('custEtaStat');
      if (dEl) dEl.innerText = `${remainingKm.toFixed(1)} km`;
      if (eEl) eEl.innerText = `${etaMin} min`;
    }
    if (frac >= 1) {
      clearInterval(intervalId);
      if (who === 'customer' && activeBooking) {
        activeBooking.statusText = `${activeBooking.workerName} has arrived`;
        renderBookingTracker();
      }
    }
  }
  const intervalId = setInterval(tick, 1600);
  tick();
  liveTrackers[who] = { stop: () => clearInterval(intervalId) };
}
