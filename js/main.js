/* =====================================================================
   SkillConnect — boot sequence and misc UI helpers
   This is the last script loaded — it kicks the whole app off.
   Depends on: every other file in /js (loaded before this one in
   index.html)
===================================================================== */
async function boot() {
  try {
    idb = await openDatabase();
    await seedIfEmpty();
  } catch (err) {
    console.error('Database unavailable, continuing without persistence', err);
  }
  workers = idb ? await dbGetAll('workers') : SEED_WORKERS.slice();

  // Clean up any leftover worker profile that was saved with the placeholder
  // name "User" (e.g. from an earlier registration with a blank name field).
  const junkWorkers = workers.filter(w => w.name.trim().toLowerCase() === 'user');
  if (junkWorkers.length) {
    workers = workers.filter(w => w.name.trim().toLowerCase() !== 'user');
    if (idb) for (const w of junkWorkers) await dbDelete('workers', w.id);
  }

  const savedSession = localStorage.getItem('sc_session');
  if (savedSession) currentUser = JSON.parse(savedSession);
  const savedBooking = localStorage.getItem('sc_active_booking');
  if (savedBooking) activeBooking = JSON.parse(savedBooking);

  await requestUserLocation();
  await anchorWorkersToLocation();
  recomputeMapBounds();
  updateLocationLabelUI();

  document.getElementById('bootSplash').style.display = 'none';
  updateAppView();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerText = msg; t.style.display = 'block';
  clearTimeout(showToast._h);
  showToast._h = setTimeout(() => t.style.display = 'none', 2600);
}

boot();
