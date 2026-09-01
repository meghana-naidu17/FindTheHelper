/* =====================================================================
   SkillConnect — customer dashboard: worker discovery, trust modal, booking
   Depends on: state.js, db.js, location.js, trust.js, maps.js
===================================================================== */
function renderWorkers(items) {
  const c = document.getElementById('workerList'); c.innerHTML = '';
  if (!items.length) { c.innerHTML = `<div class="worker-card" style="text-align:center; color:var(--text-muted);">No helpers found in this category right now.</div>`; return; }
  items.forEach(w => {
    const dist = distanceKm(userLocation, [w.lat, w.lng]).toFixed(1);
    const trust = computeTrustScore(w);
    const card = document.createElement('div'); card.className = 'worker-card';
    card.innerHTML = `
      <div class="worker-header">
        <div class="worker-avatar">${w.avatar}<span class="presence-dot ${w.online?'':'offline'}"></span></div>
        <div class="worker-info">
          <h5>${w.name} <span class="verified-badge">✔ VERIFIED</span></h5>
          <div class="worker-meta">
            <span>★ ${w.rating}</span> • <span>📍 ${dist} km</span> • <span>🧰 ${w.exp}</span>
            <span class="trust-chip" onclick="openTrustModal(${w.id})">Trust ${trust}/100</span>
          </div>
        </div>
      </div>
      <div class="worker-footer">
        <div class="price">₹${w.priceNum}<small>/hr</small></div>
        <div class="btn-group-card">
          <button class="btn-chat-direct" onclick="openDirectChat(${w.id}, '${w.name}')">💬 Chat</button>
          <button class="btn-book" onclick="openBookingModal(${w.id})">Book Now</button>
        </div>
      </div>
    `;
    c.appendChild(card);
  });
  document.getElementById('workerCountText').innerText = `${items.filter(w=>w.online).length} Available`;
}

function selectCategory(cat, el) {
  document.querySelectorAll('.cat-pill').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  currentCat = cat;
  applyFilters();
}

function applyFilters() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let list = workers.filter(w =>
    w.name.trim().toLowerCase() !== 'user' &&
    (currentCat === 'all' || w.skill === currentCat) &&
    (!q || w.name.toLowerCase().includes(q) || w.skill.includes(q))
  );

  // Only show helpers within the nearby radius of the user's real location.
  // If nobody qualifies (sparse area / demo data), fall back to citywide so
  // the list is never empty.
  const nearby = list.filter(w => distanceKm(userLocation, [w.lat, w.lng]) <= NEARBY_RADIUS_KM);
  const usingNearbyOnly = nearby.length > 0;
  if (usingNearbyOnly) list = nearby;

  list = list.slice().sort((a,b) => {
    const da = distanceKm(userLocation,[a.lat,a.lng]), db = distanceKm(userLocation,[b.lat,b.lng]);
    const scoreA = computeTrustScore(a) - da*4, scoreB = computeTrustScore(b) - db*4;
    return scoreB - scoreA;
  });

  const eyebrow = document.getElementById('nearbyEyebrow');
  if (eyebrow) {
    eyebrow.innerText = usingNearbyOnly
      ? `📍 Live near you (within ${NEARBY_RADIUS_KM} km)`
      : `📍 Live near you (no helpers within ${NEARBY_RADIUS_KM} km — showing citywide)`;
  }

  renderWorkers(list);
}

/* =====================================================================
   Trust score modal
===================================================================== */
function openTrustModal(id) {
  const w = workers.find(x => x.id === id);
  if (!w) return;
  const score = computeTrustScore(w);
  document.getElementById('trustModalName').innerText = `🛡️ ${w.name}'s Trust Profile`;
  document.getElementById('trustRing').style.setProperty('--pct', score);
  document.getElementById('trustScoreNum').innerText = score;
  document.getElementById('trustBreakdown').innerHTML = `
    <div class="trust-row"><span>Identity verified</span><span class="ok">${w.identityVerified?'✓ Verified':'— Pending'}</span></div>
    <div class="trust-row"><span>Skill verified</span><span class="ok">${w.skillVerified?'✓ Verified':'— Pending'}</span></div>
    <div class="trust-row"><span>Jobs completed</span><span class="val">${w.jobsCompleted}</span></div>
    <div class="trust-row"><span>Completion rate</span><span class="val">${w.completionRate}%</span></div>
    <div class="trust-row"><span>Cancellation rate</span><span class="val">${w.cancellationRate}%</span></div>
    <div class="trust-row"><span>Customer rating</span><span class="val">${w.rating} ★</span></div>
  `;
  document.getElementById('trustModal').style.display = 'flex';
}
function closeTrustModal() { document.getElementById('trustModal').style.display = 'none'; }

/* =====================================================================
   Booking + fair-price estimate
===================================================================== */
async function openBookingModal(id) {
  selectedWorker = workers.find(w => w.id === id);
  document.getElementById('modalWorkerName').innerText = `Book ${selectedWorker.name}`;
  const range = await fairPriceRange(selectedWorker.skill);
  const est = document.getElementById('bookingPriceEstimate');
  if (range) est.innerHTML = `💰 Estimated service cost: ₹${range.min}–₹${range.max} based on nearby ${selectedWorker.skill}s`;

  // Carry over whatever the customer entered/attached in the Diagnose flow.
  if (lastDiagnosisProblem) document.getElementById('bookProblem').value = lastDiagnosisProblem;
  const photoWrap = document.getElementById('bookPhotoWrap');
  if (lastDiagnosisPhoto) {
    document.getElementById('bookPhotoImg').src = lastDiagnosisPhoto;
    photoWrap.style.display = 'flex';
  } else {
    photoWrap.style.display = 'none';
  }

  document.getElementById('bookingModal').style.display = 'flex';
}
function closeModal() { document.getElementById('bookingModal').style.display = 'none'; }

async function confirmBooking() {
  closeModal();
  activeBooking = {
    id: Date.now(),
    workerId: selectedWorker.id,
    workerName: selectedWorker.name,
    workerSkill: selectedWorker.skill,
    workerStart: [selectedWorker.lat, selectedWorker.lng],
    price: selectedWorker.priceNum,
    address: document.getElementById('bookAddress').value,
    problem: document.getElementById('bookProblem').value || "General Repair",
    photo: lastDiagnosisPhoto || null,
    statusStep: 2,
    statusText: `${selectedWorker.name} is en route`,
    createdAt: Date.now(),
    accepted: false
  };
  if (idb) await dbPut('bookings', activeBooking);
  localStorage.setItem('sc_active_booking', JSON.stringify(activeBooking));
  lastDiagnosisProblem = '';
  lastDiagnosisPhoto = null;
  renderBookingTracker();
  showToast('Booking confirmed — live GPS dispatch started');
}

function renderBookingTracker() {
  const container = document.getElementById('activeBookingCard');
  if (!activeBooking) { container.style.display = 'none'; if (liveTrackers.customer) liveTrackers.customer.stop(); return; }
  container.style.display = 'block';
  container.className = 'order-tracker fade-in';
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <strong style="font-size:0.85rem; color:var(--primary-dark);">📍 ${activeBooking.statusText}</strong>
      <button class="btn-chat-direct" style="padding:4px 10px; font-size:0.72rem;" onclick="openDirectChat(${activeBooking.workerId}, '${activeBooking.workerName}')">💬 Chat</button>
    </div>
    <div class="tracker-steps">
      <span class="done">Booked</span><span class="active">En Route</span><span>Arrived</span><span>Completed</span>
    </div>
    <div id="custLiveMap" class="live-map"></div>
    <div class="gps-telemetry">
      <div class="gps-stat"><h5 id="custDistStat">—</h5><p>Distance</p></div>
      <div class="gps-stat"><h5 id="custEtaStat">—</h5><p>ETA</p></div>
      <div class="gps-stat"><h5>${activeBooking.workerSkill}</h5><p>Category</p></div>
    </div>
  `;
  setTimeout(() => startLiveTracking('customer'), 60);
}
