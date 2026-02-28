// ============================================
// SWIFTMOVE - MAIN JS
// ============================================

// Mobile Nav Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Flash message auto-dismiss
document.querySelectorAll('.flash').forEach(flash => {
  setTimeout(() => flash.style.display = 'none', 5000);
  const closeBtn = flash.querySelector('.flash-close');
  if (closeBtn) closeBtn.addEventListener('click', () => flash.style.display = 'none');
});

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.feature-card, .service-card, .step, .testimonial-card, .milestone').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
document.querySelectorAll('.visible').forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);
