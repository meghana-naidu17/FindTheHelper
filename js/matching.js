/* =====================================================================
   SkillConnect — hyperlocal matching engine (used for "Find match" + SOS)
   Depends on: state.js, location.js, trust.js
===================================================================== */
function openMatchModal(title) { document.getElementById('matchModalTitle').innerText = title; document.getElementById('matchModal').style.display = 'flex'; }
function closeMatchModal() { document.getElementById('matchModal').style.display = 'none'; }

async function runMatchingEngine({ skill, urgent }) {
  openMatchModal(urgent ? '🚨 Emergency Matching' : '🔎 Matching you now');
  const flow = document.getElementById('matchFlowContainer');
  flow.innerHTML = `
    <div class="match-box"><strong>Required:</strong> ${skill ? skill.charAt(0).toUpperCase()+skill.slice(1) : 'Any available helper'}<br><strong>Urgency:</strong> ${urgent ? 'HIGH' : 'Normal'}<br><strong>Location:</strong> ${userLocationLabel}</div>
    <div class="match-arrow">↓</div>
    <div class="match-engine-pulse">MATCHING ENGINE</div>
  `;
  let pool = workers.filter(w => (!skill || w.skill === skill) && w.name.trim().toLowerCase() !== 'user');
  pool = pool.map(w => ({ w, dist: distanceKm(userLocation,[w.lat,w.lng]), trust: computeTrustScore(w) }))
             .sort((a,b) => {
               const scoreA = (a.w.online?40:0) + a.trust*0.5 - a.dist*4;
               const scoreB = (b.w.online?40:0) + b.trust*0.5 - b.dist*4;
               return scoreB - scoreA;
             });
  await new Promise(r => setTimeout(r, 1100));
  const arrow = document.createElement('div'); arrow.className = 'match-arrow fade-in'; arrow.innerText = '↓';
  flow.appendChild(arrow);

  if (!pool.length) {
    const empty = document.createElement('div');
    empty.className = 'match-box fade-in';
    empty.innerHTML = `😕 No ${skill ? skill.charAt(0).toUpperCase()+skill.slice(1)+'s' : 'helpers'} found nearby right now. Try a different category or check back shortly.`;
    flow.appendChild(empty);
    return;
  }

  const top = pool.slice(0,3);
  top.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'match-result-row fade-in';
    row.innerHTML = `<span><span class="match-rank">#${i+1}</span>${entry.w.name} · ${entry.dist.toFixed(1)} km · ★${entry.w.rating}</span><span>${entry.w.online?'🟢':'🔴'}</span>`;
    flow.appendChild(row);
  });
  const btn = document.createElement('button');
  btn.className = 'btn-auth-submit fade-in';
  btn.style.marginTop = '8px';
  btn.innerText = urgent ? `Dispatch ${top[0]?.w.name || ''} now` : `Book best match: ${top[0]?.w.name || ''}`;
  btn.onclick = () => { closeMatchModal(); if (top[0]) openBookingModal(top[0].w.id); };
  flow.appendChild(btn);
}

function triggerSOS() { runMatchingEngine({ skill: null, urgent: true }); }
function triggerFindMatch() { runMatchingEngine({ skill: currentCat === 'all' ? null : currentCat, urgent: false }); }
