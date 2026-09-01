/* =====================================================================
   SkillConnect — static seed / reference data
===================================================================== */

/* Worker latOffset/lngOffset now represent a realistic, varied spread of
   distances (roughly 1km to 25km, in different directions) rather than the
   old set where every worker sat within ~5.5km of the user no matter what.
   That old clustering meant every single technician always fell inside the
   12km "nearby" radius — the radius filter was effectively decorative,
   since nobody was ever far enough away to be excluded. With a real spread,
   only the technicians actually within range show up as nearby, and each
   category ends up with a different, believable subset. */
const SEED_WORKERS = [
  // Plumbers
  { id: 1,  name: "Ravi Kumar",       email:"ravi.plumber@demo.com",    skill: "plumber",     rating: 4.9, exp: "6 yrs",  priceNum: 350, avatar: "RK", latOffset: 0.0094, lngOffset: 0.0057, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:147, completionRate:96, cancellationRate:3 },
  { id: 7,  name: "Mohammed Irfan",   email:"irfan.plumber@demo.com",   skill: "plumber",     rating: 4.6, exp: "4 yrs",  priceNum: 320, avatar: "MI", latOffset: -0.0381, lngOffset: 0.0145, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:76,  completionRate:93, cancellationRate:5 },
  { id: 8,  name: "Srinivas Rao",     email:"srinivas.plumber@demo.com",skill: "plumber",     rating: 4.8, exp: "9 yrs",  priceNum: 380, avatar: "SR", latOffset: -0.0141, lngOffset: -0.0837, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:189, completionRate:97, cancellationRate:2 },
  { id: 9,  name: "Pavan Kalyan",     email:"pavan.plumber@demo.com",   skill: "plumber",     rating: 4.4, exp: "3 yrs",  priceNum: 290, avatar: "PK", latOffset: -0.0282, lngOffset: 0.1674, online:false, identityVerified:true, skillVerified:true, jobsCompleted:38,  completionRate:89, cancellationRate:8 },

  // Electricians
  { id: 2,  name: "Suresh Sharma",    email:"suresh.elec@demo.com",     skill: "electrician", rating: 4.8, exp: "8 yrs",  priceNum: 400, avatar: "SS", latOffset: -0.0169, lngOffset: -0.0065, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:98,  completionRate:94, cancellationRate:4 },
  { id: 10, name: "Kiran Kumar",      email:"kiran.elec@demo.com",      skill: "electrician", rating: 4.7, exp: "6 yrs",  priceNum: 370, avatar: "KK", latOffset: 0.0414, lngOffset: 0.0364, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:112, completionRate:95, cancellationRate:3 },
  { id: 11, name: "Naveen Chowdary",  email:"naveen.elec@demo.com",     skill: "electrician", rating: 4.9, exp: "11 yrs", priceNum: 450, avatar: "NC", latOffset: 0.0725, lngOffset: -0.0637, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:241, completionRate:98, cancellationRate:1 },
  { id: 12, name: "Farhan Ali",       email:"farhan.elec@demo.com",     skill: "electrician", rating: 4.3, exp: "2 yrs",  priceNum: 300, avatar: "FA", latOffset: 0.0678, lngOffset: 0.1952, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:22,  completionRate:88, cancellationRate:9 },

  // Carpenters
  { id: 3,  name: "Arjun Reddy",      email:"arjun.carp@demo.com",      skill: "carpenter",   rating: 4.7, exp: "5 yrs",  priceNum: 450, avatar: "AR", latOffset: -0.0092, lngOffset: 0.0266, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:61,  completionRate:92, cancellationRate:5 },
  { id: 13, name: "Ramesh Yadav",     email:"ramesh.carp@demo.com",     skill: "carpenter",   rating: 4.5, exp: "7 yrs",  priceNum: 420, avatar: "RY", latOffset: -0.0216, lngOffset: -0.0621, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:88,  completionRate:91, cancellationRate:6 },
  { id: 14, name: "Aditya Rao",       email:"aditya.carp@demo.com",     skill: "carpenter",   rating: 4.8, exp: "10 yrs", priceNum: 480, avatar: "AD", latOffset: 0.1153, lngOffset: 0.0213, online:false, identityVerified:true, skillVerified:true, jobsCompleted:156, completionRate:96, cancellationRate:3 },
  { id: 15, name: "Shabbir Khan",     email:"shabbir.carp@demo.com",    skill: "carpenter",   rating: 4.4, exp: "3 yrs",  priceNum: 360, avatar: "SK", latOffset: -0.1686, lngOffset: -0.0312, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:29,  completionRate:90, cancellationRate:7 },

  // Mechanics
  { id: 4,  name: "Vijay Reddy",      email:"vijay.mech@demo.com",      skill: "mechanic",    rating: 4.9, exp: "10 yrs", priceNum: 500, avatar: "VR", latOffset: 0.0152, lngOffset: -0.0058, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:203, completionRate:97, cancellationRate:2 },
  { id: 16, name: "Sandeep Verma",    email:"sandeep.mech@demo.com",    skill: "mechanic",    rating: 4.6, exp: "5 yrs",  priceNum: 420, avatar: "SV", latOffset: 0.0086, lngOffset: 0.0511, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:97,  completionRate:93, cancellationRate:4 },
  { id: 17, name: "Imran Sheikh",     email:"imran.mech@demo.com",      skill: "mechanic",    rating: 4.7, exp: "8 yrs",  priceNum: 460, avatar: "IS", latOffset: -0.0931, lngOffset: -0.0355, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:134, completionRate:94, cancellationRate:3 },
  { id: 18, name: "Rajesh Goud",      email:"rajesh.mech@demo.com",     skill: "mechanic",    rating: 4.2, exp: "2 yrs",  priceNum: 350, avatar: "RG", latOffset: -0.1951, lngOffset: 0.1180, online:false, identityVerified:true, skillVerified:true, jobsCompleted:18,  completionRate:87, cancellationRate:10 },

  // Cleaners
  { id: 5,  name: "Lakshmi Devi",     email:"lakshmi.clean@demo.com",   skill: "cleaner",     rating: 4.9, exp: "4 yrs",  priceNum: 300, avatar: "LD", latOffset: 0.0113, lngOffset: 0.0204, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:132, completionRate:98, cancellationRate:1 },
  { id: 19, name: "Sunitha Rani",     email:"sunitha.clean@demo.com",   skill: "cleaner",     rating: 4.8, exp: "6 yrs",  priceNum: 320, avatar: "SU", latOffset: 0.0293, lngOffset: -0.0532, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:167, completionRate:97, cancellationRate:2 },
  { id: 20, name: "Padma Priya",      email:"padma.clean@demo.com",     skill: "cleaner",     rating: 4.6, exp: "3 yrs",  priceNum: 280, avatar: "PP", latOffset: 0.0804, lngOffset: 0.0307, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:71,  completionRate:94, cancellationRate:4 },
  { id: 21, name: "Anitha Kumari",    email:"anitha.clean@demo.com",    skill: "cleaner",     rating: 4.5, exp: "5 yrs",  priceNum: 310, avatar: "AK", latOffset: -0.0927, lngOffset: -0.1157, online:false, identityVerified:true, skillVerified:true, jobsCompleted:104, completionRate:92, cancellationRate:5 },

  // Painters
  { id: 6,  name: "Manoj Naidu",      email:"manoj.paint@demo.com",     skill: "painter",     rating: 4.6, exp: "7 yrs",  priceNum: 380, avatar: "MN", latOffset: -0.0232, lngOffset: 0.0289, online:false, identityVerified:true, skillVerified:true, jobsCompleted:44,  completionRate:90, cancellationRate:7 },
  { id: 22, name: "Ravindra Babu",    email:"ravindra.paint@demo.com",  skill: "painter",     rating: 4.7, exp: "9 yrs",  priceNum: 410, avatar: "RB", latOffset: 0.0710, lngOffset: 0.0131, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:118, completionRate:95, cancellationRate:3 },
  { id: 23, name: "Zaheer Ahmed",     email:"zaheer.paint@demo.com",    skill: "painter",     rating: 4.5, exp: "4 yrs",  priceNum: 340, avatar: "ZA", latOffset: 0.0211, lngOffset: -0.1255, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:52,  completionRate:91, cancellationRate:6 },
  { id: 24, name: "Krishna Murthy",   email:"krishna.paint@demo.com",   skill: "painter",     rating: 4.9, exp: "12 yrs", priceNum: 460, avatar: "KM", latOffset: 0.1693, lngOffset: -0.0646, online:true,  identityVerified:true, skillVerified:true, jobsCompleted:267, completionRate:98, cancellationRate:1 }
];

const SEED_USERS = [
  { email:"aditya@customer.com", name:"Aditya Verma", password:"password123", role:"customer" },
  { email:"ravi.plumber@demo.com", name:"Ravi Kumar", password:"password123", role:"technician", skill:"plumber", rate:350, exp:"6 yrs", workerId:1 },
  { email:"admin@skillconnect.com", name:"Platform Admin", password:"admin123", role:"admin" }
];
/* Symptom → appliance → skill map used by the problem-first diagnosis engine.
   Keywords are matched as whole words/phrases (see diagnosis.js), so short
   entries like "ac" or "fan" only match when they appear as their own word
   — not as a substring of "reach", "pack", "fantastic", etc. */
const SYMPTOM_MAP = [
  { keywords:["washing machine","washer","dryer","drum","spin cycle","laundry machine"], appliance:"Washing Machine", skill:"electrician" },
  { keywords:["fridge","refrigerator","freezer","fridge not cooling"], appliance:"Refrigerator", skill:"electrician" },
  { keywords:["ac","air conditioner","air conditioning","fan","exhaust fan","ac not cooling"], appliance:"Air Conditioner / Fan", skill:"electrician" },
  { keywords:["wiring","short circuit","switch","socket","mcb","power cut","spark","sparking","fuse","circuit breaker","no power","electric shock"], appliance:"Electrical Wiring", skill:"electrician" },
  { keywords:["tap","faucet","pipe","leak","leaking","drainage","drain","toilet","flush","bathroom","water heater","geyser","water pressure","clogged","overflow"], appliance:"Plumbing Fixture", skill:"plumber" },
  { keywords:["door","cabinet","furniture","wood","hinge","lock","almirah","wardrobe","drawer","shelf","chair","creaking"], appliance:"Furniture / Fittings", skill:"carpenter" },
  { keywords:["car","bike","vehicle","engine","scooter","battery","brake","tyre","tire","won't start","not starting","clutch","gear"], appliance:"Vehicle", skill:"mechanic" },
  { keywords:["clean","dust","sofa","deep clean","housekeeping","mop","vacuum","dusting","stains"], appliance:"Home Cleaning", skill:"cleaner" },
  { keywords:["wall paint","painting","wall crack","peeling paint","paint peeling","damp wall","repaint"], appliance:"Wall / Paint", skill:"painter" }
];

/* Canned technician chat replies, bucketed by detected intent */
const CHAT_REPLY_BANK = {
  eta: [
    "I'm on my way! You can track my live GPS location on the map above.",
    "About {eta} minutes out based on current traffic — I'll message when I'm close.",
    "Just left my last job, heading straight to you now."
  ],
  price: [
    "My rate is fair-priced against nearby helpers for this category — no hidden charges.",
    "It'll be within the estimate you saw at booking; I'll confirm the exact total after inspecting.",
    "No surprise fees — you'll see the final cost before I start any work."
  ],
  greeting: [
    "Hi there! Happy to help — could you tell me a bit more about the issue?",
    "Hello! I've got your request — I'll take good care of it.",
    "Hey! Thanks for reaching out, I'm getting ready to head over."
  ],
  thanks: [
    "You're welcome! See you shortly.",
    "Anytime — glad to help.",
    "No problem at all, happy to assist."
  ],
  location: [
    "I have your address from the booking — I'll follow the live route shown above.",
    "Got the location locked in, navigating there now.",
    "Yes, I can see the pin on my end — heading that way."
  ],
  urgent: [
    "Understood, I'll prioritize this and move as fast as I safely can.",
    "Got it — treating this as urgent, on my way now.",
    "I hear you, I'll get there as quickly as possible."
  ],
  fallback: [
    "Got it, thanks for the details — I'll take a look as soon as I arrive.",
    "Understood, I'll bring the right tools for that.",
    "Noted! Let me know if there's anything else before I get there.",
    "Sure thing — I'll factor that in once I'm on site.",
    "Thanks for letting me know, I'll handle it when I arrive."
  ]
};
