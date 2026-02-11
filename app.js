/* =====================
   SELECT ELEMENTS
===================== */
var input = document.querySelector('#user-input');
var sendBtn = document.querySelector('#send-btn');
var messages = document.querySelector('#messages');
var emptyState = document.querySelector('#empty-state');

var newChatBtn = document.querySelector('#new-chat-btn');
var sidebar = document.querySelector('#sidebar');
var overlay = document.querySelector('#overlay');
var menuBtn = document.querySelector('#menu-btn');
var closeBtn = document.querySelector('#close-sidebar');
var chatHistory = document.querySelector('#chat-history');
var typingIndicator = document.querySelector('#typing-indicator');

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

  showLoading();
  var aiBubble = addMessage('', 'ai');

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
   ADD MESSAGE (WITH TIME)
===================== */
function addMessage(text, type) {
  var wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col max-w-[75%]';

  if (type === 'user') {
    wrapper.classList.add('ml-auto', 'items-end');
  } else {
    wrapper.classList.add('mr-auto', 'items-start');
  }

  var bubble = document.createElement('div');
  bubble.className = 'px-4 py-2 rounded-lg text-sm';

  if (type === 'user') {
    bubble.classList.add('bg-black', 'text-white');
  } else {
    bubble.classList.add('bg-gray-100');
  }

  bubble.textContent = text;

  var time = document.createElement('span');
  time.className = 'text-xs text-gray-400 mt-1';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  wrapper.appendChild(bubble);
  wrapper.appendChild(time);

  messages.appendChild(wrapper);
  autoScroll();

  return bubble;
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
  }, 5);
}

/* =====================
   SAVE MESSAGE
===================== */
function saveMessage(role, text) {
  var chat = chats.find(c => c.id === currentChatId);
  chat.messages.push({ role, text });
}

/* =====================
   HISTORY UI
===================== */
function renderHistory() {
  chatHistory.innerHTML = '';

  chats.forEach(chat => {
    var item = document.createElement('div');
    item.className =
      'flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition';

    var left = document.createElement('div');
    left.className = 'flex flex-col';

    var title = document.createElement('span');
    title.textContent = chat.title.slice(0, 25);

    var time = document.createElement('span');
    time.className = 'text-xs text-gray-400';
    time.textContent = new Date(chat.id).toLocaleDateString();

    left.appendChild(title);
    left.appendChild(time);

    var del = document.createElement('button');
    del.textContent = '✕';
    del.className = 'text-red-400 text-xs hover:text-red-600';

    del.onclick = (e) => {
      e.stopPropagation();
      chats = chats.filter(c => c.id !== chat.id);
      renderHistory();
      messages.innerHTML = '';
      emptyState.style.display = 'block';
    };

    item.appendChild(left);
    item.appendChild(del);
    item.onclick = () => loadChat(chat.id);

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
function showLoading() {
  typingIndicator.classList.remove('hidden');
  autoScroll();
}

function hideLoading() {
  typingIndicator.classList.add('hidden');
}

function autoScroll() {
  messages.scrollTop = messages.scrollHeight;
}

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
  const API_KEY = "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";
  const MODEL = "deepseek/deepseek-r1-0528:free";

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

// ----------------------secondary API KEY-------------------------
// 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