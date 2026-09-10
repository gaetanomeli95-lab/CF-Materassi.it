// Photo-led V5 direction: load the visual refinement before initializing page interactions.
const photoDirection = document.createElement('link');
photoDirection.rel = 'stylesheet';
photoDirection.href = '/photo-direction-v5.css?v=1';
document.head.appendChild(photoDirection);

// The homepage now uses the Higgsfield campaign still as the clear hero image.
// Remove the redundant hero WebGL canvas before its module initializes; the
// interactive Carol Plus 3D remains in the dedicated technical section below.
document.querySelector('#hero-carol-webgl')?.remove();

const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const menu = document.querySelector('[data-mobile-menu]');
const progress = document.querySelector('[data-progress]');
const inside = document.querySelector('[data-inside-section]');
const insideMeter = document.querySelector('[data-inside-meter]');
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

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

  if(inside){
    const rect = inside.getBoundingClientRect();
    const travel = Math.max(1, inside.offsetHeight - window.innerHeight);
    const p = clamp((-rect.top) / travel, 0, 1);
    document.documentElement.style.setProperty('--inside-progress', p.toFixed(4));
    if(insideMeter) insideMeter.style.height = `${p * 100}%`;

    const steps = [...inside.querySelectorAll('[data-step]')];
    const active = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((step, i) => step.classList.toggle('is-active', i === active));

    window.dispatchEvent(new CustomEvent('cf:inside-progress', {
      detail: { progress: p, active }
    }));
  }
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
