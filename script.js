const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const menu = document.querySelector('[data-mobile-menu]');
const progress = document.querySelector('[data-progress]');

function setMenu(open){
  toggle?.classList.toggle('open', open);
  menu?.classList.toggle('open', open);
  header?.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
}

toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if(e.key === 'Escape') setMenu(false); });

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.12});
reveals.forEach(el => revealObserver.observe(el));

function updateScrollUI(){
  const y = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if(progress) progress.style.width = `${(y / max) * 100}%`;
  header?.classList.toggle('scrolled', y > 30);


}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    requestAnimationFrame(() => {
      updateScrollUI();
      ticking = false;
    });
    ticking = true;
  }
},{passive:true});
window.addEventListener('resize', updateScrollUI,{passive:true});
updateScrollUI();

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));

// Native details stay usable without JavaScript. Focus/hover links each row to
// its numbered location without relying on motion, colour, or scroll position.
const layerRows = document.querySelectorAll('[data-layer]');
function highlightLayer(name) {
  document.querySelectorAll('[data-marker]').forEach(marker => {
    marker.classList.toggle('is-active', marker.dataset.marker === name);
  });
}
layerRows.forEach(row => {
  row.addEventListener('pointerenter', () => highlightLayer(row.dataset.layer));
  row.addEventListener('pointerleave', () => highlightLayer(null));
  row.addEventListener('focusin', () => highlightLayer(row.dataset.layer));
  row.addEventListener('focusout', () => highlightLayer(null));
});
