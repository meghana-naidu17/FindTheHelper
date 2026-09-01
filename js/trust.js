/* =====================================================================
   SkillConnect — trust score + fair-price engine
   Depends on: db.js
===================================================================== */
function computeTrustScore(w) {
  let score = 0;
  score += (w.rating / 5) * 35;
  score += w.identityVerified ? 15 : 0;
  score += w.skillVerified ? 15 : 0;
  score += (w.completionRate || 0) * 0.2;
  score += Math.min(w.jobsCompleted || 0, 150) / 150 * 15;
  score -= (w.cancellationRate || 0) * 0.6;
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function fairPriceRange(skill) {
  const all = await dbGetAll('workers');
  const rates = all.filter(w => w.skill === skill).map(w => w.priceNum);
  if (!rates.length) return null;
  const min = Math.min(...rates), max = Math.max(...rates);
  return { min: Math.round(min*0.92/10)*10, max: Math.round(max*1.08/10)*10 };
}

async function updateFairPriceHint() {
  const skill = document.getElementById('authSkill').value;
  const hint = document.getElementById('fairPriceHint');
  const range = await fairPriceRange(skill);
  hint.style.display = 'block';
  hint.innerHTML = range ? `⚖️ Fair-price guide for ${skill}: ₹${range.min}–₹${range.max}/hr based on nearby helpers.` : `⚖️ Set a competitive hourly rate — you're the first ${skill} on the platform.`;
}
