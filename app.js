
// Elements ko select karna
  var sidebar = document.querySelector('#sidebar');
  var overlay = document.querySelector('#overlay');
  var menuBtn = document.querySelector('#menu-btn');
  var closeBtn = document.querySelector('#close-sidebar');

  // Menu button click -> sidebar open
  menuBtn.addEventListener('click', function() {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  });

  // Close button click -> sidebar close
  closeBtn.addEventListener('click', function() {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  });

  // Overlay click -> sidebar close
  overlay.addEventListener('click', function() {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  });

    // ------------------------- MAIN LOGIC SECTION -----------------------
 
  //  SELECT ELEMENTS

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

// SETTINGS

var MAX_LENGTH = 200;

  //  SIDEBAR TOGGLE

menuBtn.onclick = function () {
  sidebar.classList.remove('-translate-x-full');
  overlay.classList.remove('hidden');
};

closeBtn.onclick = overlay.onclick = function () {
  sidebar.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
};
// INPUT CHECK
input.oninput = function () {
  sendBtn.disabled = input.value.trim() === '';
};


  //  SEND MESSAGE (USER ONLY)

sendBtn.onclick = function () {
  var text = input.value.trim();
  if (text === '') return;

  if (text.length > MAX_LENGTH) {
    alert('Max ' + MAX_LENGTH + ' characters allowed');
    return;
  }

  emptyState.style.display = 'none';
  messages.classList.remove('hidden');

  addMessage(text, 'user');

  input.value = '';
  sendBtn.disabled = true;
};

