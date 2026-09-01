/* =====================================================================
   SkillConnect — direct chat (customer ↔ helper), simulated replies
   Depends on: seed-data.js (CHAT_REPLY_BANK), state.js
===================================================================== */
function openDirectChat(workerId, workerName) {
  activeChatWorker = { id: workerId, name: workerName };
  document.getElementById('chatTargetTitle').innerText = `💬 Chat with ${workerName}`;
  const container = document.getElementById('chatBodyMessages');
  container.innerHTML = `<div class="msg-bubble incoming">Hello! 👋 This is ${workerName}. How can I assist you with your repair service today?</div>`;
  document.getElementById('directChatModal').style.display = 'flex';
}
function closeDirectChat() { document.getElementById('directChatModal').style.display = 'none'; }

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickChatReply(text) {
  const t = text.toLowerCase();
  let bucket;
  if (/\b(far|time|when|eta|arrive|long|delay)\b/.test(t)) bucket = CHAT_REPLY_BANK.eta;
  else if (/\b(price|cost|charge|rate|fee|₹|expensive|cheap)\b/.test(t)) bucket = CHAT_REPLY_BANK.price;
  else if (/\b(urgent|asap|emergency|hurry|quick)\b/.test(t)) bucket = CHAT_REPLY_BANK.urgent;
  else if (/\b(hi|hello|hey)\b/.test(t)) bucket = CHAT_REPLY_BANK.greeting;
  else if (/\b(thank|thanks)\b/.test(t)) bucket = CHAT_REPLY_BANK.thanks;
  else if (/\b(where|address|location|route)\b/.test(t)) bucket = CHAT_REPLY_BANK.location;
  else bucket = CHAT_REPLY_BANK.fallback;
  const etaMin = 6 + Math.floor(Math.random() * 10);
  return randomFrom(bucket).replace('{eta}', etaMin);
}

function sendDirectMessage() {
  const input = document.getElementById('chatInputText');
  const text = input.value.trim();
  if (!text) return;
  const container = document.getElementById('chatBodyMessages');
  const userBubble = document.createElement('div');
  userBubble.className = 'msg-bubble outgoing';
  userBubble.innerText = text;
  container.appendChild(userBubble);
  input.value = '';
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    const replyBubble = document.createElement('div');
    replyBubble.className = 'msg-bubble incoming';
    replyBubble.innerText = pickChatReply(text);
    container.appendChild(replyBubble);
    container.scrollTop = container.scrollHeight;
  }, 850 + Math.random() * 500);
}
