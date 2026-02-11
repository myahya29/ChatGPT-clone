/* =====================
   SELECT ELEMENTS
===================== */
var input = document.querySelector('#user-input');
var sendBtn = document.querySelector('#send-btn');
var messages = document.querySelector('#messages');
var loading = document.querySelector('#loading');
var emptyState = document.querySelector('#empty-state');

var newChatBtn = document.querySelector('#new-chat-btn');
var sidebar = document.querySelector('#sidebar');
var overlay = document.querySelector('#overlay');
var menuBtn = document.querySelector('#menu-btn');
var closeBtn = document.querySelector('#close-sidebar');
var chatHistory = document.querySelector('#chat-history');

/* =====================
   CHAT DATA
===================== */
var chats = [];
var currentChatId = null;

/* =====================
   SIDEBAR
===================== */
menuBtn.onclick = function () {
  sidebar.classList.remove('-translate-x-full');
  overlay.classList.remove('hidden');
};

closeBtn.onclick = overlay.onclick = function () {
  sidebar.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
};

/* =====================
   INPUT CHECK
===================== */
input.oninput = function () {
  sendBtn.disabled = input.value.trim() === '';
};

/* =====================
   SEND MESSAGE
===================== */
async function sendMessage() {
  var text = input.value.trim();
  if (!text) return;

  emptyState.style.display = 'none';
  messages.classList.remove('hidden');

  if (!currentChatId) {
    currentChatId = Date.now();
    chats.push({ id: currentChatId, title: text, messages: [] });
    renderHistory();
  }

  addMessage(text, 'user');
  saveMessage('user', text);

  input.value = '';
  sendBtn.disabled = true;

  var aiBubble = addMessage('', 'ai');
  showLoading();

  try {
    var response = await sendToAPI(text);
    typeEffect(aiBubble, response);
    saveMessage('ai', response);
  } catch {
    aiBubble.textContent = '⚠️ Error';
  } finally {
    hideLoading();
  }
}

/* =====================
   EVENTS
===================== */
sendBtn.onclick = sendMessage;

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
});

/* =====================
   ADD MESSAGE
===================== */
function addMessage(text, type) {
  var msg = document.createElement('div');
  msg.className = 'max-w-[70%] px-4 py-2 rounded-lg text-sm';

  if (type === 'user') {
    msg.classList.add('bg-black', 'text-white', 'ml-auto');
  } else {
    msg.classList.add('bg-gray-100', 'mr-auto');
  }

  var content = document.createElement('div');
  content.textContent = text;
  msg.appendChild(content);

  messages.appendChild(msg);
  autoScroll();
  return content;
}

/* =====================
   TYPING EFFECT
===================== */
function typeEffect(el, text) {
  let i = 0;
  let interval = setInterval(() => {
    el.textContent += text[i++];
    autoScroll();
    if (i >= text.length) clearInterval(interval);
  }, 15);
}

/* =====================
   SAVE MESSAGE
===================== */
function saveMessage(role, text) {
  var chat = chats.find(c => c.id === currentChatId);
  chat.messages.push({ role, text });
}

/* =====================
   HISTORY
===================== */
function renderHistory() {
  chatHistory.innerHTML = '';

  chats.forEach(chat => {
    var item = document.createElement('div');
    item.className =
      'flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100 cursor-pointer';

    item.innerHTML = `
      <span>${chat.title.slice(0, 20)}</span>
      <button class="text-red-500 text-xs">✕</button>
    `;

    item.onclick = () => loadChat(chat.id);
    item.querySelector('button').onclick = (e) => {
      e.stopPropagation();
      chats = chats.filter(c => c.id !== chat.id);
      renderHistory();
      messages.innerHTML = '';
      emptyState.style.display = 'block';
    };

    chatHistory.appendChild(item);
  });
}

function loadChat(id) {
  currentChatId = id;
  messages.innerHTML = '';
  messages.classList.remove('hidden');
  emptyState.style.display = 'none';

  var chat = chats.find(c => c.id === id);
  chat.messages.forEach(m => addMessage(m.text, m.role));
}

/* =====================
   HELPERS
===================== */
function showLoading() { loading.classList.remove('hidden'); }
function hideLoading() { loading.classList.add('hidden'); }
function autoScroll() { messages.scrollTop = messages.scrollHeight; }

/* =====================
   NEW CHAT
===================== */
newChatBtn.onclick = function () {
  currentChatId = null;
  messages.innerHTML = '';
  messages.classList.add('hidden');
  emptyState.style.display = 'block';
};

/* =====================
   OPENROUTER API
===================== */
async function sendToAPI(userInput) {
  const API_KEY = "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";   // apni key
  const MODEL = "deepseek/deepseek-r1-0528:free";     // model name

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: userInput }]
      })
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
}
//----------------------- MY API KEY--------------------------
// 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


// --------------------------MY API MODEL-------------------------
// deepseek/deepseek-r1-0528:free