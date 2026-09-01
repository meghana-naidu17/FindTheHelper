# SkillConnect — Cooperative Gig Services Platform

A mobile-style demo app connecting customers with local skilled helpers
(plumbers, electricians, carpenters, mechanics, cleaners, painters).
Runs entirely client-side — data is stored in the browser's IndexedDB,
nothing is sent to a server.

## Project structure

```
skillconnect/
├── index.html          Markup only
├── css/
│   └── style.css       All styles
└── js/
    ├── state.js         Shared app state (load first)
    ├── seed-data.js     Demo workers, users, symptom map, chat replies
    ├── db.js            IndexedDB layer (schema + CRUD + seeding)
    ├── location.js      Geolocation + distance helpers
    ├── trust.js         Trust score + fair-price engine
    ├── diagnosis.js     "Describe the problem" → skill matching
    ├── chat.js          Simulated direct chat with a helper
    ├── maps.js          Self-contained inline-SVG live tracking maps
    ├── customer.js      Customer dashboard: search, booking, trust modal
    ├── technician.js    Technician dashboard: jobs, ledger, referrals
    ├── matching.js       Hyperlocal matching engine (SOS + "find match")
    ├── admin.js         Admin-only Cooperative Insights dashboard
    ├── auth.js          Login/registration + view routing
    └── main.js          Boot sequence (load last)
```

Scripts are loaded in that order via plain `<script>` tags (no build step,
no bundler — just open `index.html` or serve the folder statically).

## Running it

Any static file server works, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly via `file://` also works in most browsers,
though IndexedDB and geolocation behave more reliably over `http://`.)

## Roles & demo logins

There are three roles: **Customer**, **Skilled Helper (technician)**, and
**Admin**.

| Role | How to access | Demo credentials |
|---|---|---|
| Customer | "Customer" chip, Login or Register tab | Register with any email/password, or log in as `aditya@customer.com` |
| Skilled Helper | "Skilled Helper" chip, Login or Register tab | Register with any email/password, or log in as `ravi.plumber@demo.com` / `password123` |
| Admin | "Admin" chip — **Login tab only** | `admin@skillconnect.com` / `admin123` |

### Admin access is restricted

- The **Admin** chip only appears on the **Login** tab — there is no way to
  self-register an admin account through the UI.
- Unlike customer/technician demo login (which is intentionally permissive,
  for demo purposes), **admin login always checks the password** against
  the seeded/stored record and rejects anything that doesn't match.
- The "📊 Cooperative Insights" analytics dashboard is **only** ever shown
  to a logged-in admin. It is not a toggle in the header and customers/
  technicians have no path to it.

To add more admins, add an entry with `role: "admin"` to `SEED_USERS` in
`js/seed-data.js` (or insert one into the `users` IndexedDB store) — or
just create one from the admin dashboard itself (see below).

### Admin: account management (CRUD)

The admin dashboard includes a **"👥 Manage accounts"** panel listing every
account (customer, helper, admin) with:

- **Create** — "+ New account" opens a form for name / email / password /
  role. Choosing "Skilled Helper" reveals specialty, experience, and hourly
  rate fields, and automatically creates the matching worker profile
  (same shape as self-registration).
- **Read** — each row shows the role, and for helpers also their skill,
  rate, live trust score, and online/offline status.
- **Update** — "Edit" prefills the form (email is locked, since it's the
  account's primary key). Changing rate/skill/name for a helper updates
  their linked worker profile too. Changing role away from "Skilled
  Helper" retires their worker profile; changing it *to* "Skilled Helper"
  creates one.
- **Delete** — "Delete" removes the account (and its worker profile, if
  any) after a confirmation prompt. An admin can't delete the account
  they're currently logged in as.

## Notes

- All data (users, workers, bookings, transactions) lives in the browser's
  IndexedDB (`SkillConnectDB`). Clearing site data resets the demo.
- Live GPS tracking maps are self-contained inline SVG — no external map
  tile server or API key required.
