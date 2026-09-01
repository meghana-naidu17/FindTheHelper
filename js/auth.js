/* =====================================================================
   SkillConnect — authentication, session and view routing
   Adds a third role, 'admin', alongside the original 'customer' and
   'technician' roles. Unlike those two (whose login is a demo-only
   lookup-by-email with no password check), admin login always verifies
   the password against a stored/seeded record — nobody can talk their
   way into the admin dashboard just by picking the "Admin" chip.
   Depends on: state.js, db.js, seed-data.js
===================================================================== */

function switchAuthTab(m) {
  authMode = m;
  document.getElementById('tabLogin').classList.toggle('active', m === 'login');
  document.getElementById('tabRegister').classList.toggle('active', m === 'register');
  document.getElementById('registerNameGroup').style.display = m === 'register' ? 'flex' : 'none';
  document.getElementById('btnAuthSubmit').innerText = m === 'login' ? 'Log In to Account' : 'Register Pro Account';

  // Admin accounts are provisioned ahead of time, never self-registered —
  // the Admin chip only ever appears on the Login tab.
  const adminChip = document.getElementById('roleAdmin');
  adminChip.classList.toggle('visible', m === 'login');
  if (m === 'register' && selectedRole === 'admin') selectRole('customer');

  if (m === 'register' && selectedRole === 'technician') updateFairPriceHint();
}

function selectRole(r) {
  selectedRole = r;
  document.getElementById('roleCust').classList.toggle('active', r === 'customer');
  document.getElementById('roleTech').classList.toggle('active', r === 'technician');
  document.getElementById('roleAdmin').classList.toggle('active', r === 'admin');
  document.getElementById('techFields').style.display = r === 'technician' ? 'flex' : 'none';
  if (r === 'technician') updateFairPriceHint();
}

async function handleAuthSubmit() {
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value;
  if (!email || !password) { showToast('Please fill in email and password'); return; }

  // Admin accounts can never be created through this form.
  if (selectedRole === 'admin' && authMode === 'register') {
    showToast('Admin accounts are provisioned by the platform, not self-registered');
    return;
  }

  if (selectedRole === 'admin') {
    const u = idb ? await dbGet('users', email) : SEED_USERS.find(x => x.email === email);
    if (!u || u.role !== 'admin' || u.password !== password) {
      showToast('Invalid admin credentials');
      return;
    }
    currentUser = { name: u.name, email: u.email, role: 'admin' };
    localStorage.setItem('sc_session', JSON.stringify(currentUser));
    updateAppView();
    return;
  }

  if (authMode === 'register') {
    const name = document.getElementById('authName').value.trim();
    if (!name) { showToast('Please enter your full name to register'); return; }
    const skill = document.getElementById('authSkill').value;
    const rate = parseInt(document.getElementById('authRate').value) || 450;
    const exp = document.getElementById('authExp').value || "5 yrs";
    const govtId = document.getElementById('authGovtId').value;

    let workerId = null;
    if (selectedRole === 'technician') {
      const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2);
      const offset = () => (Math.random()-0.5)*0.05;
      workerId = Date.now();
      const newWorker = {
        id: workerId, name, email, skill, rating: 5.0, exp, priceNum: rate, avatar: initials,
        lat: userLocation[0] + offset(), lng: userLocation[1] + offset(), online: true,
        identityVerified: !!govtId, skillVerified: true, jobsCompleted: 0, completionRate: 100, cancellationRate: 0
      };
      workers.unshift(newWorker);
      if (idb) await dbPut('workers', newWorker);
      showToast(`🎉 Welcome ${name}! You're now a verified ${skill} on SkillConnect.`);
    }

    currentUser = { name, email, role: selectedRole, skill, rate, exp, workerId };
    if (idb) await dbPut('users', { email, name, password, role: selectedRole, skill, rate, exp, workerId });
  } else {
    let u = idb ? await dbGet('users', email) : SEED_USERS.find(x=>x.email===email);
    if (!u) u = { name: email.split('@')[0], email, role: selectedRole };
    currentUser = { name: u.name, email: u.email, role: u.role, skill: u.skill, rate: u.rate, exp: u.exp, workerId: u.workerId };
  }

  localStorage.setItem('sc_session', JSON.stringify(currentUser));
  updateAppView();
}

function logout() { currentUser = null; localStorage.removeItem('sc_session'); updateAppView(); }

async function updateAppView() {
  if (!currentUser) {
    document.getElementById('authView').style.display = 'flex';
    document.getElementById('customerDash').style.display = 'none';
    document.getElementById('techDash').style.display = 'none';
    document.getElementById('edaDash').style.display = 'none';
    document.getElementById('userHeaderInfo').style.display = 'none';
    return;
  }

  document.getElementById('authView').style.display = 'none';
  document.getElementById('userHeaderInfo').style.display = 'flex';
  document.getElementById('userPill').classList.toggle('badge-admin', currentUser.role === 'admin');

  if (currentUser.role === 'admin') {
    document.getElementById('userBadgeText').innerText = `🛡️ ${currentUser.name}`;
    document.getElementById('customerDash').style.display = 'none';
    document.getElementById('techDash').style.display = 'none';
    document.getElementById('edaDash').style.display = 'flex';
    await renderAdminDashboard();
    return;
  }

  document.getElementById('edaDash').style.display = 'none';

  if (currentUser.role === 'customer') {
    document.getElementById('userBadgeText').innerText = `👤 ${currentUser.name}`;
    document.getElementById('customerDash').style.display = 'flex';
    document.getElementById('techDash').style.display = 'none';
    applyFilters();
    renderBookingTracker();
    setTimeout(initNearbyMap, 60);
  } else {
    document.getElementById('userBadgeText').innerText = `🧰 ${currentUser.name}`;
    document.getElementById('customerDash').style.display = 'none';
    document.getElementById('techDash').style.display = 'flex';
    await renderTechDashboard();
    setTimeout(initWorkerNearbyMap, 60);
  }
}
