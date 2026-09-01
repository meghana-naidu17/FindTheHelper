/* =====================================================================
   SkillConnect — shared application state
   Every other script in /js relies on these globals. This file must be
   loaded first (see the <script> order in index.html).
===================================================================== */

// IndexedDB handle (set by db.js once the database opens)
let idb = null;

// Auth / session
let currentUser = null;   // { name, email, role: 'customer' | 'technician' | 'admin', ... }
let authMode = 'login';   // 'login' | 'register'
let selectedRole = 'customer'; // 'customer' | 'technician' | 'admin'

// Marketplace data
let workers = [];
let activeBooking = null;
let selectedWorker = null;
let currentCat = 'all';
let activeChatWorker = null;

// Live map tracking controllers, keyed by 'customer' / 'worker'
let liveTrackers = {};
