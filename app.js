
// ---------------------- ELEMENTS ----------------------
var sidebar = document.querySelector('#sidebar');
var overlay = document.querySelector('#overlay');
var menuBtn = document.querySelector('#menu-btn');
var closeBtn = document.querySelector('#close-sidebar');

var input = document.querySelector('#user-input');
var sendBtn = document.querySelector('#send-btn');
var messages = document.querySelector('#messages');
var loading = document.querySelector('#loading');
var emptyState = document.querySelector('#empty-state');

var newChatBtn = document.querySelector('#new-chat-btn');
var chatHistoryDiv = document.querySelector('#chat-history');

// ---------------------- SETTINGS ----------------------
var MAX_LENGTH = 200;
var chatHistory = [];
var currentChatId = null;

// ---------------------- API & MODEL ----------------------
const apiKey = "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";       // <<< ===== Yahan apni API key likho
const modelName = "tngtech/deepseek-r1t2-chimera:free"; // <<< ===== Yahan apna model name likho, jaise: tngtech/deepseek-r1t2-chimera:free

// ---------------------- SIDEBAR TOGGLE ----------------------
menuBtn.onclick = () => { sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); };
closeBtn.onclick = overlay.onclick = () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); };

// ---------------------- INPUT CHECK ----------------------
input.oninput = () => { sendBtn.disabled = input.value.trim() === ''; };

// ---------------------- SEND MESSAGE ----------------------
sendBtn.onclick = () => {
  var text = input.value.trim();
  if (!text) return;
  if (text.length > MAX_LENGTH) return; // alert removed

  emptyState.style.display = 'none';
  messages.classList.remove('hidden');

  addMessage(text, 'user');
  input.value = '';
  sendBtn.disabled = true;

  var loadingMsg = addMessage('AI is typing...', 'ai', true);
  loading.classList.remove('hidden');

  callAI(text, reply => {
    loadingMsg.innerHTML = `<div>${reply}</div><div class="text-xs opacity-50 mt-1">${getTime()}</div>`;
    saveChatHistory();
    sendBtn.disabled = false;
    loading.classList.add('hidden');
  });
};

// ---------------------- ADD MESSAGE ----------------------
function addMessage(text, type, isLoading=false){
  var msg = document.createElement('div');
  msg.className = 'max-w-[70%] px-4 py-2 rounded-lg text-sm animate-fade mb-2';
  if(type==='user') msg.classList.add('bg-black','text-white','ml-auto','text-right');
  else msg.classList.add('bg-gray-100','text-black','mr-auto');
  msg.innerHTML = `<div>${text}</div>${!isLoading?`<div class="text-xs opacity-50 mt-1">${getTime()}</div>`:''}`;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}

// ---------------------- HELPERS ----------------------
function getTime() { let d=new Date(); let h=d.getHours(); let m=d.getMinutes(); if(m<10)m='0'+m; return h+':'+m; }

// ---------------------- NEW CHAT ----------------------
function createNewChat() { currentChatId=null; messages.innerHTML=''; messages.classList.add('hidden'); emptyState.style.display='block'; }
newChatBtn.onclick = createNewChat;

// ---------------------- AI CALL ----------------------
function callAI(userText, callback){
  loading.classList.remove('hidden');
  fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST",
    headers:{ "Authorization": `Bearer ${apiKey}`, "Content-Type":"application/json" },
    body:JSON.stringify({ model: modelName, messages:[{role:"user",content:userText}] })
  })
  .then(res=>res.json())
  .then(data=>{
    let reply = "";
    if(data?.error){
      reply = "⚠️ API Error: " + (data.error.message || "Unknown error");
      console.error("API Error:", data.error);
    } else if(data?.choices && data.choices.length>0){
      reply = data.choices[0].message?.content || data.choices[0].text || "⚠️ No response";
    } else {
      reply = "⚠️ No response from AI";
      console.log("Response data:", data);
    }
    callback(reply);
  })
  .catch(err=>{
    console.error("Fetch Error:", err);
    callback("⚠️ Error: Unable to get AI response. Check console for details.");
  })
  .finally(()=>loading.classList.add('hidden'));
}

// ---------------------- CHAT HISTORY ----------------------
function saveChatHistory(){
  if(!currentChatId) currentChatId = Date.now().toString();
  var chat = { id:currentChatId, messages:Array.from(messages.children).map(msg=>({text:msg.querySelector('div').innerText,type:msg.classList.contains('ml-auto')?'user':'ai',time:msg.querySelector('.text-xs')?.innerText||getTime()})), timestamp:new Date().toISOString() };
  var existingIndex = chatHistory.findIndex(c=>c.id===currentChatId);
  if(existingIndex>=0) chatHistory[existingIndex]=chat; else chatHistory.push(chat);
  localStorage.setItem('chatHistory',JSON.stringify(chatHistory));
  displayChatHistory();
}

function loadChatHistory(){
  var stored = localStorage.getItem('chatHistory');
  if(stored) chatHistory=JSON.parse(stored);
  displayChatHistory();
}

function displayChatHistory(){
  chatHistoryDiv.innerHTML='';
  chatHistory.forEach(chat=>{
    var chatItem=document.createElement('div');
    chatItem.className='flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded';
    
    var textDiv=document.createElement('span');
    textDiv.innerText = chat.messages[0]?.text.substring(0,30)+'...' || 'New Chat';
    textDiv.onclick=()=>loadChat(chat.id);
    chatItem.appendChild(textDiv);

    var menu=document.createElement('span');
    menu.innerText='⋮';
    menu.className='cursor-pointer px-2';
    menu.onclick=e=>{
      e.stopPropagation();
      chatHistory = chatHistory.filter(c=>c.id!==chat.id);
      localStorage.setItem('chatHistory',JSON.stringify(chatHistory));
      displayChatHistory();
      if(chat.id===currentChatId) createNewChat();
    };
    chatItem.appendChild(menu);

    chatHistoryDiv.appendChild(chatItem);
  });
}

function loadChat(chatId){
  var chat=chatHistory.find(c=>c.id===chatId);
  if(chat){ currentChatId=chatId; messages.innerHTML=''; chat.messages.forEach(msg=>addMessage(msg.text,msg.type)); emptyState.style.display='none'; messages.classList.remove('hidden'); }
}

// ---------------------- LOAD HISTORY ----------------------
window.onload = loadChatHistory;


  // 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