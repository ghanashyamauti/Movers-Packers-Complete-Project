// ============================================
// SWIFTMOVE - ADMIN JS
// ============================================

// Sidebar toggle for mobile
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const adminSidebar = document.getElementById('adminSidebar');

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => adminSidebar.classList.toggle('open'));
}
if (sidebarClose) {
  sidebarClose.addEventListener('click', () => adminSidebar.classList.remove('open'));
}

// Flash message auto-dismiss
document.querySelectorAll('.flash').forEach(flash => {
  setTimeout(() => flash.style.display = 'none', 5000);
  const closeBtn = flash.querySelector('.flash-close');
  if (closeBtn) closeBtn.addEventListener('click', () => flash.style.display = 'none');
});
