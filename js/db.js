/* =====================================================================
   SkillConnect — client-side "database" layer (IndexedDB)
   A real browser database (not just localStorage): structured object
   stores, schema versioning and async CRUD. In production this would
   be swapped for a hosted DB (Postgres/Firestore) behind an API, but
   the schema and access patterns below are written to map 1:1 onto
   that migration.
   Depends on: state.js (idb), seed-data.js (SEED_WORKERS, SEED_USERS)
===================================================================== */
const DB_NAME = 'SkillConnectDB';
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject('IndexedDB unsupported'); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'email' });
      if (!db.objectStoreNames.contains('workers')) db.createObjectStore('workers', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('bookings')) db.createObjectStore('bookings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('messages')) { const s = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true }); s.createIndex('chatId', 'chatId'); }
      if (!db.objectStoreNames.contains('transactions')) { const s = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true }); s.createIndex('workerId', 'workerId'); }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function tx(store, mode) { return idb.transaction(store, mode).objectStore(store); }
function dbGetAll(store) { return new Promise((res, rej) => { const r = tx(store, 'readonly').getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
function dbGet(store, key) { return new Promise((res, rej) => { const r = tx(store, 'readonly').get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
function dbPut(store, val) { return new Promise((res, rej) => { const r = tx(store, 'readwrite').put(val); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
function dbDelete(store, key) { return new Promise((res, rej) => { const r = tx(store, 'readwrite').delete(key); r.onsuccess = () => res(); r.onerror = () => rej(r.error); }); }
function dbClearAll() { return Promise.all(['users','workers','bookings','messages','transactions','meta'].map(s => new Promise((res) => { tx(s,'readwrite').clear().onsuccess = res; }))); }

async function seedIfEmpty() {
  const existing = await dbGetAll('workers');
  if (existing.length) return;
  for (const w of SEED_WORKERS) await dbPut('workers', w);
  for (const u of SEED_USERS) await dbPut('users', u);
  await dbPut('transactions', { workerId:1, amount:350, label:"Pipe leak repair — Jubilee Hills", ts: Date.now() - 3600e3*3 });
  await dbPut('transactions', { workerId:1, amount:400, label:"Bathroom fitting install", ts: Date.now() - 3600e3*9 });
  await dbPut('transactions', { workerId:1, amount:300, label:"Tap replacement", ts: Date.now() - 3600e3*26 });
}
