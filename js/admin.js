/* =====================================================================
   SkillConnect — admin dashboard ("Cooperative Insights" + account CRUD)
   Only ever rendered when currentUser.role === 'admin' (see auth.js /
   updateAppView). There is no way to reach this view as a customer or
   technician — it is not a toggle in the header, it is the admin's
   dashboard.
   Depends on: state.js, db.js, trust.js, location.js
===================================================================== */

// Tracks which account is being edited in the modal. null = "create" mode.
let accEditingEmail = null;

async function renderAdminDashboard() {
  const list = idb ? await dbGetAll('workers') : workers;
  const avgTrust = Math.round(list.reduce((s, w) => s + computeTrustScore(w), 0) / Math.max(list.length, 1));
  document.getElementById('edaTrust').innerText = `${avgTrust}/100`;
  document.getElementById('edaActive').innerText = list.filter(w => w.online).length;
  await renderAccountsList();
}

/* =====================================================================
   Account list (read)
===================================================================== */
async function loadAllAccounts() {
  if (!idb) return [];
  return await dbGetAll('users');
}

async function renderAccountsList() {
  const el = document.getElementById('accountList');
  if (!el) return;
  const accounts = await loadAllAccounts();

  if (!accounts.length) {
    el.innerHTML = `<div class="account-card" style="justify-content:center; color:var(--text-muted);">No accounts yet — create one above.</div>`;
    return;
  }

  const roleOrder = { admin: 0, technician: 1, customer: 2 };
  const sorted = accounts.slice().sort((a, b) =>
    (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3) || a.name.localeCompare(b.name)
  );

  el.innerHTML = sorted.map(u => {
    const worker = u.workerId ? workers.find(w => w.id === u.workerId) : null;
    const roleLabel = u.role === 'admin' ? 'Admin' : u.role === 'technician' ? 'Helper' : 'Customer';
    const extra = worker
      ? ` • ${worker.skill} • ₹${worker.priceNum}/hr • Trust ${computeTrustScore(worker)}/100 • ${worker.online ? '🟢 Online' : '⚪ Offline'}`
      : '';
    const isSelf = currentUser && currentUser.email === u.email;
    return `
      <div class="account-card">
        <div class="account-info">
          <h5>${u.name} <span class="role-badge role-${u.role}">${roleLabel}</span>${isSelf ? ' <span style="font-size:0.65rem; color:var(--text-muted);">(you)</span>' : ''}</h5>
          <p>${u.email}${extra}</p>
        </div>
        <div class="account-actions">
          <button class="btn-edit-acc" onclick="editAccount('${u.email}')">Edit</button>
          <button class="btn-delete-acc" onclick="deleteAccount('${u.email}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

/* =====================================================================
   Account modal (create / edit)
===================================================================== */
function toggleAccountTechFields() {
  const role = document.getElementById('accRole').value;
  document.getElementById('accTechFields').style.display = role === 'technician' ? 'flex' : 'none';
}

function openAccountModal(mode) {
  accEditingEmail = null;
  document.getElementById('accountModalTitle').innerText = mode === 'edit' ? 'Edit Account' : 'New Account';
  document.getElementById('accName').value = '';
  document.getElementById('accEmail').value = '';
  document.getElementById('accEmail').disabled = false;
  document.getElementById('accPassword').value = '';
  document.getElementById('accPassword').placeholder = 'Set a password';
  document.getElementById('accRole').value = 'customer';
  document.getElementById('accSkill').value = 'plumber';
  document.getElementById('accExp').value = '5 yrs';
  document.getElementById('accRate').value = 400;
  toggleAccountTechFields();
  document.getElementById('accountModal').style.display = 'flex';
}

async function editAccount(email) {
  if (!idb) { showToast('Database unavailable'); return; }
  const u = await dbGet('users', email);
  if (!u) { showToast('Account not found'); return; }

  openAccountModal('edit');
  accEditingEmail = email;

  document.getElementById('accName').value = u.name || '';
  document.getElementById('accEmail').value = u.email;
  document.getElementById('accEmail').disabled = true; // email is the record's key — can't change in place
  document.getElementById('accPassword').value = '';
  document.getElementById('accPassword').placeholder = 'Leave blank to keep current password';
  document.getElementById('accRole').value = u.role;
  toggleAccountTechFields();
  if (u.role === 'technician') {
    document.getElementById('accSkill').value = u.skill || 'plumber';
    document.getElementById('accExp').value = u.exp || '5 yrs';
    document.getElementById('accRate').value = u.rate || 400;
  }
}

function closeAccountModal() { document.getElementById('accountModal').style.display = 'none'; }

/* =====================================================================
   Create / update (write)
===================================================================== */
async function saveAccount() {
  if (!idb) { showToast('Database unavailable'); return; }

  const name = document.getElementById('accName').value.trim();
  const email = document.getElementById('accEmail').value.trim().toLowerCase();
  const password = document.getElementById('accPassword').value;
  const role = document.getElementById('accRole').value;
  const skill = document.getElementById('accSkill').value;
  const rate = parseInt(document.getElementById('accRate').value) || 400;
  const exp = document.getElementById('accExp').value || '5 yrs';

  if (!name || !email) { showToast('Name and email are required'); return; }
  if (!accEditingEmail && !password) { showToast('Set a password for the new account'); return; }

  const existing = accEditingEmail ? await dbGet('users', accEditingEmail) : await dbGet('users', email);
  if (!accEditingEmail && existing) { showToast('An account with that email already exists'); return; }

  const finalPassword = password || (existing ? existing.password : '');
  let workerId = existing ? existing.workerId : null;

  if (role === 'technician') {
    if (workerId) {
      // Already a helper — keep the linked worker profile in sync.
      const w = workers.find(x => x.id === workerId) || await dbGet('workers', workerId);
      if (w) {
        w.name = name; w.skill = skill; w.priceNum = rate; w.exp = exp;
        await dbPut('workers', w);
        const idx = workers.findIndex(x => x.id === workerId);
        if (idx >= 0) workers[idx] = w; else workers.push(w);
      }
    } else {
      // Promoting to helper — create a new worker profile, same shape as
      // self-registration.
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const offset = () => (Math.random() - 0.5) * 0.05;
      workerId = Date.now();
      const newWorker = {
        id: workerId, name, email, skill, rating: 5.0, exp, priceNum: rate, avatar: initials,
        lat: userLocation[0] + offset(), lng: userLocation[1] + offset(), online: true,
        identityVerified: true, skillVerified: true, jobsCompleted: 0, completionRate: 100, cancellationRate: 0
      };
      await dbPut('workers', newWorker);
      workers.unshift(newWorker);
    }
  } else if (existing && existing.workerId) {
    // Demoted away from helper — retire their worker profile.
    await dbDelete('workers', existing.workerId);
    workers = workers.filter(w => w.id !== existing.workerId);
    workerId = null;
  }

  const record = { email, name, password: finalPassword, role };
  if (role === 'technician') Object.assign(record, { skill, rate, exp, workerId });
  await dbPut('users', record);

  // If the admin just edited their own account, keep the active session in sync.
  if (currentUser && currentUser.email === email) {
    currentUser = { name: record.name, email: record.email, role: record.role, skill: record.skill, rate: record.rate, exp: record.exp, workerId: record.workerId };
    localStorage.setItem('sc_session', JSON.stringify(currentUser));
  }

  closeAccountModal();
  showToast(accEditingEmail ? '✅ Account updated' : '🎉 Account created');
  await renderAdminDashboard();
}

/* =====================================================================
   Delete
===================================================================== */
async function deleteAccount(email) {
  if (!idb) { showToast('Database unavailable'); return; }
  if (currentUser && currentUser.email === email) {
    showToast("You can't delete the account you're logged in as");
    return;
  }
  const u = await dbGet('users', email);
  if (!u) { showToast('Account not found'); return; }
  if (!confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return;

  await dbDelete('users', email);
  if (u.workerId) {
    await dbDelete('workers', u.workerId);
    workers = workers.filter(w => w.id !== u.workerId);
  }

  showToast('🗑️ Account deleted');
  await renderAdminDashboard();
}
