/* =====================================================================
   SkillConnect — problem-first diagnosis engine (symptom → appliance → skill)
   Depends on: seed-data.js (SYMPTOM_MAP), state.js

   Scoring approach (fixes the old "always matches the same category" bug):
   - Old version used plain substring matching (`text.includes(keyword)`)
     and returned the FIRST entry with any hit. Short keywords like "ac"
     match as a substring inside totally unrelated words ("reach", "pack",
     "track", "crack"...), so almost any sentence tripped the same early
     entry regardless of what the user actually typed.
   - This version matches whole words/phrases only (word-boundary regex),
     scores every category by how many — and how specific — its keywords
     match, and returns the highest-scoring category above a minimum
     confidence bar. Multi-word phrases ("washing machine") count for more
     than single ambiguous words, so specific descriptions win over
     coincidental single-word overlaps.
===================================================================== */
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function scoreEntryAgainstText(text, keywords) {
  let score = 0;
  const matched = [];
  for (const kw of keywords) {
    const re = new RegExp(`\\b${escapeRegExp(kw.toLowerCase())}\\b`, 'i');
    if (re.test(text)) {
      // Multi-word phrases are more specific signals than single short words,
      // so they contribute more to the score.
      const weight = kw.trim().split(/\s+/).length;
      score += weight;
      matched.push(kw);
    }
  }
  return { score, matched };
}

function diagnoseProblem(text) {
  if (!text || !text.trim()) return null;
  const t = text.toLowerCase();
  let best = null;
  for (const entry of SYMPTOM_MAP) {
    const { score, matched } = scoreEntryAgainstText(t, entry.keywords);
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score, matched };
    }
  }
  if (!best) return null;
  return { ...best.entry, confidence: best.score, matchedKeywords: best.matched };
}

// Snapshot attached to the current diagnosis session (base64 data URL), and
// what's carried forward to the booking modal once a category is matched.
let diagnosisPhotoDataUrl = null;
let lastDiagnosisProblem = '';
let lastDiagnosisPhoto = null;

function openAIChat() {
  document.getElementById('aiDiagnosisResult').style.display = 'none';
  document.getElementById('aiProblemInput').value = '';
  removeDiagnosisPhoto();
  document.getElementById('aiModal').style.display = 'flex';
}
function closeAIChat() { document.getElementById('aiModal').style.display = 'none'; }

function handleDiagnosisPhotoSelect(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please choose an image file'); input.value = ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    diagnosisPhotoDataUrl = e.target.result;
    document.getElementById('aiPhotoPreviewImg').src = diagnosisPhotoDataUrl;
    document.getElementById('aiPhotoPreviewWrap').style.display = 'block';
    document.getElementById('aiPhotoPickBtn').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function removeDiagnosisPhoto() {
  diagnosisPhotoDataUrl = null;
  const fileInput = document.getElementById('aiProblemPhoto');
  if (fileInput) fileInput.value = '';
  document.getElementById('aiPhotoPreviewImg').src = '';
  document.getElementById('aiPhotoPreviewWrap').style.display = 'none';
  document.getElementById('aiPhotoPickBtn').style.display = 'inline-block';
}

function runDiagnosis() {
  const val = document.getElementById('aiProblemInput').value.trim();
  const box = document.getElementById('aiDiagnosisResult');
  if (!val) { box.style.display='block'; box.innerHTML = `<p style="font-size:0.78rem;color:var(--danger);">Please describe what's wrong first.</p>`; return; }
  const result = diagnoseProblem(val);
  box.style.display = 'block';
  box.className = 'fade-in';
  if (!result) {
    box.innerHTML = `
      <div class="match-box">😕 We couldn't confidently match that to a category. Try adding more detail, or browse categories manually below.</div>
    `;
    return;
  }
  box.innerHTML = `
    <div class="match-flow" style="margin-top:6px;">
      <div class="match-box"><strong>Appliance:</strong> ${result.appliance}</div>
      <div class="match-arrow">↓</div>
      <div class="match-box" style="background:var(--primary-light); color:var(--primary-dark); font-weight:800;">Recommended: ${result.skill.charAt(0).toUpperCase()+result.skill.slice(1)}</div>
    </div>
    ${diagnosisPhotoDataUrl ? `<div class="ai-photo-preview" style="margin-top:10px;"><img src="${diagnosisPhotoDataUrl}" alt="Problem snapshot" /></div>` : ''}
    <button class="btn-auth-submit" style="margin-top:12px;" onclick="applyDiagnosisResult('${result.skill}')">Show matching helpers</button>
  `;
}

function applyDiagnosisResult(skill) {
  lastDiagnosisProblem = document.getElementById('aiProblemInput').value.trim();
  lastDiagnosisPhoto = diagnosisPhotoDataUrl;
  closeAIChat();
  currentCat = skill;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.textContent.toLowerCase().includes(skill)));
  applyFilters();
  showToast(`Matched to ${skill.charAt(0).toUpperCase()+skill.slice(1)} — showing nearby helpers`);
}
