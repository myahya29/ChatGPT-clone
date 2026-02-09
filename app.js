
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

