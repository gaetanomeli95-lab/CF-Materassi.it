// CF Materassi V6: photo-led brand site + complete-range hierarchy.
const loadStylesheet = (href) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};
loadStylesheet('/photo-direction-v5.css?v=2');
loadStylesheet('/brand-balance-v6.css?v=1');

// Hero is campaign photography; Carol Plus WebGL is reserved for the technical case study.
document.querySelector('#hero-carol-webgl')?.remove();

// Reframe the navigation around CF, not a single mattress.
const setNav = (nav) => {
  const links = nav ? [...nav.querySelectorAll('a')] : [];
  const items = [
    ['#gamma', 'Gamma CF'],
    ['#inside', 'Tecnologia 3D'],
    ['#one-im', 'Classe 1IM'],
    ['#catalogo', 'Catalogo']
  ];
  items.forEach(([href, label], i) => {
    if (!links[i]) return;
    links[i].href = href;
    links[i].textContent = label;
  });
};
setNav(document.querySelector('.desktop-nav'));
setNav(document.querySelector('[data-mobile-menu]'));

// The first action now opens the CF range; the 3D is the next level of product depth.
const heroPrimary = document.querySelector('.hero-actions .btn-light');
if (heroPrimary) {
  heroPrimary.href = '#gamma';
  heroPrimary.textContent = 'Scopri la gamma CF';
}
const heroScroll = document.querySelector('.scroll-indicator');
if (heroScroll) {
  heroScroll.href = '#gamma';
  heroScroll.setAttribute('aria-label', 'Scorri alla gamma CF Materassi');
  const text = heroScroll.querySelector('span');
  if (text) text.textContent = 'SCOPRI LA GAMMA';
}

// Put the brand range before the Carol Plus digital twin.
const hero = document.querySelector('.hero');
const manifesto = document.querySelector('.manifesto');
if (hero && manifesto && !document.querySelector('#gamma')) {
  const gamma = document.createElement('section');
  gamma.className = 'cf-gamma';
  gamma.id = 'gamma';
  gamma.innerHTML = `
    <div class="gamma-head">
      <div>
        <p class="eyebrow dark reveal">CF / GAMMA PROFESSIONALE</p>
        <h2 class="reveal">Tre sistemi.<br><span>Un'unica CF.</span></h2>
      </div>
      <p class="reveal">Il 3D racconta la tecnologia di un modello. La gamma racconta CF Materassi: soluzioni diverse per rivenditori, hospitality e forniture professionali.</p>
    </div>
    <div class="gamma-grid">
      <article class="gamma-card gamma-carol reveal">
        <div class="gamma-media" role="img" aria-label="Carol Plus CF Materassi in ambientazione professionale"></div>
        <div class="gamma-card-copy">
          <span class="gamma-kicker">MICROMOLLE + MEMORY</span>
          <span class="gamma-index">01</span>
          <h3>Carol Plus</h3>
          <span class="gamma-meta">1600 micromolle · H27</span>
          <a href="#inside">Apri il digital twin ↘</a>
        </div>
      </article>
      <article class="gamma-card gamma-marta reveal">
        <div class="gamma-media" role="img" aria-label="Marta Box CF Materassi"></div>
        <div class="gamma-card-copy">
          <span class="gamma-kicker">MOLLE + MEMORY</span>
          <span class="gamma-index">02</span>
          <h3>Marta Box</h3>
          <span class="gamma-meta">Sistema ibrido</span>
          <a href="#catalogo">Scopri nel catalogo ↘</a>
        </div>
      </article>
      <article class="gamma-card gamma-morfeus reveal">
        <div class="gamma-media" role="img" aria-label="Morfeus 3 Strati CF Materassi"></div>
        <div class="gamma-card-copy">
          <span class="gamma-kicker">MEMORY SYSTEM</span>
          <span class="gamma-index">03</span>
          <h3>Morfeus 3 Strati</h3>
          <span class="gamma-meta">Architettura a 3 strati</span>
          <a href="#catalogo">Scopri nel catalogo ↘</a>
        </div>
      </article>
    </div>
    <div class="gamma-more reveal" aria-label="Altri modelli CF Materassi">
      <span>LA GAMMA CONTINUA</span>
      <div class="gamma-more-list">
        <span>Carol</span><span>Morfeus 2 Strati</span><span>King Box</span><span>Andromeda H25</span><span>Arianna H20</span><span>Supporti</span>
      </div>
    </div>`;
  manifesto.before(gamma);
}

// Carol Plus is explicitly a technology case study inside the CF range.
const manifestoEyebrow = manifesto?.querySelector('.eyebrow');
if (manifestoEyebrow) manifestoEyebrow.textContent = 'CASE STUDY 01 · CAROL PLUS · DIGITAL TWIN';
const manifestoTitle = manifesto?.querySelector('h2');
if (manifestoTitle) manifestoTitle.innerHTML = `Un prodotto reale.<br><span>Lo apriamo davvero.</span>`;
const manifestoText = manifesto?.querySelector('.manifesto-grid > p');
if (manifestoText) manifestoText.textContent = 'Carol Plus è il primo modello scelto per mostrare in 3D come CF costruisce un sistema letto: dal comfort package alle 1600 micromolle e al box perimetrale.';
const insideIndex = document.querySelector('.inside-index');
if (insideIndex) insideIndex.textContent = 'CASE STUDY 01 · CAROL PLUS · H27 · STRUTTURA 3D';

// The final collection block completes the brand instead of repeating the same three products.
const collection = document.querySelector('#catalogo');
const collectionEyebrow = collection?.querySelector('.collection-heading .eyebrow');
if (collectionEyebrow) collectionEyebrow.textContent = 'CF / CATALOGO PROFESSIONALE 2026';
const collectionTitle = collection?.querySelector('.collection-heading h2');
if (collectionTitle) collectionTitle.innerHTML = `Oltre i tre protagonisti.<br><span>La gamma continua.</span>`;
const collectionNames = collection?.querySelector('.collection-names');
if (collectionNames) {
  collectionNames.setAttribute('aria-label', 'Gamma CF Materassi');
  collectionNames.innerHTML = '<span>CAROL</span><i></i><span>MORFEUS 2 STRATI</span><i></i><span>KING BOX</span><i></i><span>ANDROMEDA H25</span><i></i><span>ARIANNA H20</span><i></i><span>SUPPORTI</span>';
}
const catalogText = collection?.querySelector('.catalog-cta > p');
if (catalogText) catalogText.textContent = 'Materassi, sistemi letto e supporti per il canale professionale. Specifiche e disponibilità complete restano raccolte nel catalogo CF 2026.';

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
