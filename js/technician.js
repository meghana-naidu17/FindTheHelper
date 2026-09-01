/* =====================================================================
   SkillConnect — technician dashboard: jobs, ledger, referrals
   Depends on: state.js, db.js, trust.js, maps.js
===================================================================== */
/* =====================================================================
   Technician dashboard
===================================================================== */
async function toggleWorkerOnline() {
  if (!currentUser.workerId) return;
  const w = workers.find(x => x.id === currentUser.workerId);
  if (!w) return;
  w.online = document.getElementById('onlineToggle').checked;
  if (idb) await dbPut('workers', w);
}

async function renderTechDashboard() {
  const myWorker = workers.find(w => w.id === currentUser.workerId);
  document.getElementById('techEarnedText').innerText = `₹${myWorker ? await earningsToday(myWorker.id) : 2850}`;
  document.getElementById('techJobsText').innerText = myWorker ? myWorker.jobsCompleted : 6;
  document.getElementById('techTrustText').innerText = myWorker ? computeTrustScore(myWorker) : 93;
  document.getElementById('onlineToggle').checked = myWorker ? myWorker.online : true;

  const c = document.getElementById('techRequests'); c.innerHTML = '';
  if (!activeBooking) {
    c.innerHTML = `<div class="worker-card" style="text-align:center; color:var(--text-muted);">No active customer requests right now. Stay online to receive nearby jobs.</div>`;
  } else if (activeBooking.accepted && activeBooking.assignedWorkerId !== currentUser.workerId) {
    const assigned = workers.find(w => w.id === activeBooking.assignedWorkerId);
    c.innerHTML = `<div class="worker-card" style="text-align:center; color:var(--text-muted);">This job was referred to ${assigned ? assigned.name : 'another helper'} in the cooperative.</div>`;
  } else if (activeBooking.accepted) {
    c.innerHTML = `
      <div class="worker-card">
        <strong>${activeBooking.workerSkill.toUpperCase()} Job — In Progress</strong>
        <p style="font-size:0.75rem; color:var(--text-muted);">📍 ${activeBooking.address}</p>
        <p style="font-size:0.75rem; color:var(--text-muted);">Issue: ${activeBooking.problem}</p>
        ${activeBooking.photo ? `<img class="job-photo-thumb" src="${activeBooking.photo}" alt="Customer's snapshot of the problem" />` : ''}
        <div id="techLiveMap" class="live-map" style="margin-top:8px;"></div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn-chat-direct" style="flex:1;" onclick="openDirectChat(99, 'Customer')">💬 Chat Customer</button>
          <button class="btn-book" style="flex:1;" onclick="completeJob()">Mark Completed</button>
        </div>
      </div>
    `;
    setTimeout(() => startLiveTracking('worker'), 60);
  } else {
    c.innerHTML = `
      <div class="worker-card">
        <strong>${activeBooking.workerSkill.toUpperCase()} Job Request</strong>
        <p style="font-size:0.75rem; color:var(--text-muted);">📍 ${activeBooking.address}</p>
        <p style="font-size:0.75rem; color:var(--text-muted);">Issue: ${activeBooking.problem}</p>
        ${activeBooking.photo ? `<img class="job-photo-thumb" src="${activeBooking.photo}" alt="Customer's snapshot of the problem" />` : ''}
        <p style="font-size:0.72rem; color:var(--saffron-dark); font-weight:700;">💰 ₹${activeBooking.price}/hr estimated</p>
        <div style="display:flex; gap:8px; margin-top:4px;">
          <button class="btn-chat-direct" style="flex:1;" onclick="openDirectChat(99, 'Customer')">💬 Chat Customer</button>
          <button class="btn-book" style="flex:1;" onclick="acceptJob()">Accept Job</button>
        </div>
        <button class="btn-trust" style="margin-top:4px;" onclick="referJob()">🔁 Refer to another Pro in the cooperative</button>
      </div>
    `;
  }
  await renderLedger();
}

async function earningsToday(workerId) {
  if (!idb) return 2850;
  const txns = (await dbGetAll('transactions')).filter(t => t.workerId === workerId && Date.now() - t.ts < 24*3600e3);
  return txns.reduce((s,t) => s + t.amount, 300) || 2850;
}

async function renderLedger() {
  const el = document.getElementById('earningsLedger');
  if (!idb || !currentUser.workerId) { el.innerHTML = ''; return; }
  const txns = (await dbGetAll('transactions')).filter(t => t.workerId === currentUser.workerId).sort((a,b)=>b.ts-a.ts).slice(0,5);
  if (!txns.length) { el.innerHTML = `<div class="ledger-row" style="color:var(--text-muted);">No completed jobs yet</div>`; return; }
  el.innerHTML = txns.map(t => `<div class="ledger-row"><span>${t.label}</span><span class="amt">+₹${t.amount}</span></div>`).join('');
}

async function acceptJob() {
  activeBooking.accepted = true;
  activeBooking.assignedWorkerId = currentUser.workerId;
  activeBooking.statusText = `${currentUser.name} accepted — heading to you`;
  if (idb) await dbPut('bookings', activeBooking);
  localStorage.setItem('sc_active_booking', JSON.stringify(activeBooking));
  showToast('Job accepted — live tracking started');
  await renderTechDashboard();
  renderBookingTracker();
}

async function completeJob() {
  const w = workers.find(x => x.id === currentUser.workerId);
  if (w) {
    w.jobsCompleted += 1;
    if (idb) { await dbPut('workers', w); await dbPut('transactions', { workerId: w.id, amount: activeBooking.price, label: `${activeBooking.problem} — ${activeBooking.address.split(',')[0]}`, ts: Date.now() }); }
  }
  activeBooking = null;
  localStorage.removeItem('sc_active_booking');
  showToast('🎉 Job marked complete — earnings added to your ledger');
  await renderTechDashboard();
  setTimeout(initWorkerNearbyMap, 60);
}

async function referJob() {
  const candidates = workers.filter(w => w.skill === activeBooking.workerSkill && w.id !== currentUser.workerId && w.online);
  if (!candidates.length) { showToast('No other cooperative helper available for this category right now'); return; }
  candidates.sort((a,b) => computeTrustScore(b) - computeTrustScore(a));
  const target = candidates[0];
  activeBooking.accepted = true;
  activeBooking.assignedWorkerId = target.id;
  activeBooking.statusText = `Referred to ${target.name} — cooperative helper`;
  if (idb) await dbPut('bookings', activeBooking);
  localStorage.setItem('sc_active_booking', JSON.stringify(activeBooking));
  showToast(`🔁 Referred to ${target.name} (Trust ${computeTrustScore(target)}/100) — they've been notified`);
  await renderTechDashboard();
}
