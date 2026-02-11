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

  var aiBubble = addMessage("AI is typing...", 'ai');

  try {
    var response = await sendToAPI(text);
    aiBubble.innerHTML = formatMarkdown(response);
    saveMessage('ai', response);
  } catch {
    aiBubble.innerHTML = "⚠️ Error";
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

  var wrapper = document.createElement('div');
  wrapper.className = 'flex';

  if (type === 'user') {
    wrapper.classList.add('justify-end');
  } else {
    wrapper.classList.add('justify-start');
  }

  var bubble = document.createElement('div');

  bubble.className =
    'max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed';

  if (type === 'user') {
    bubble.classList.add('bg-black', 'text-white');
  } else {
    bubble.classList.add('bg-gray-100', 'text-gray-800');
  }

  bubble.innerHTML = formatMarkdown(text);

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  autoScroll();

  return bubble;
}

/* =====================
   MARKDOWN FORMATTER
===================== */
function formatMarkdown(text) {

  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, function(match, p1) {
    return `
      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs mt-2">
        <code>${escapeHTML(p1)}</code>
      </pre>
    `;
  });

  // Inline code
  text = text.replace(/`(.*?)`/g,
    '<code class="bg-gray-200 px-1 py-0.5 rounded text-xs">$1</code>');

  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g,
    '<strong class="font-semibold">$1</strong>');

  // Headings
  text = text.replace(/^### (.*$)/gim,
    '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>');
  text = text.replace(/^## (.*$)/gim,
    '<h2 class="font-semibold text-lg mt-3 mb-1">$1</h2>');
  text = text.replace(/^# (.*$)/gim,
    '<h1 class="font-semibold text-xl mt-3 mb-1">$1</h1>');

  // Line breaks
  text = text.replace(/\n/g, "<br>");

  return text;
}

function escapeHTML(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
      'flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition';

    var title = document.createElement('span');
    title.textContent = chat.title.slice(0, 25);

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

    item.appendChild(title);
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
  const MODEL = "openrouter/pony-alpha";

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
        messages: [
          { role: "user", content: userInput }
        ]
      })
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
}


//----------------------- MY API KEY--------------------------
// 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


// --------------------------MY API MODEL-------------------------
// openrouter/pony-alpha

// ----------------------secondary API KEY-------------------------
// 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