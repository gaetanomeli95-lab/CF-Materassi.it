// CF Materassi V7: brand-first, proof-led, conversion-oriented.
const loadStylesheet = (href) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};
loadStylesheet('/photo-direction-v5.css?v=2');
loadStylesheet('/brand-balance-v6.css?v=1');
loadStylesheet('/conversion-v7.css?v=1');

document.querySelector('#hero-carol-webgl')?.remove();

const hero = document.querySelector('.hero');
const manifesto = document.querySelector('.manifesto');
const worlds = document.querySelector('#worlds');
const oneIm = document.querySelector('#one-im');
const collection = document.querySelector('#catalogo');
const contact = document.querySelector('#contatti');

// Navigation around CF, not one product.
const setNav = (nav) => {
  const links = nav ? [...nav.querySelectorAll('a')] : [];
  const items = [
    ['#gamma', 'Gamma CF'],
    ['#worlds', 'Per chi lavoriamo'],
    ['#inside', 'Tecnologia 3D'],
    ['#one-im', 'Classe 1IM']
  ];
  items.forEach(([href, label], i) => {
    if (!links[i]) return;
    links[i].href = href;
    links[i].textContent = label;
  });
};
setNav(document.querySelector('.desktop-nav'));
setNav(document.querySelector('[data-mobile-menu]'));

// Hero: immediately explain what CF is and what the visitor should do.
const heroEyebrow = hero?.querySelector('.eyebrow');
if (heroEyebrow) heroEyebrow.textContent = 'PALERMO · PRODUZIONE · B2B · HOSPITALITY · CONTRACT';
const heroTitle = hero?.querySelector('h1');
if (heroTitle) heroTitle.innerHTML = `Il riposo,<br><span>fatto per il tuo business.</span>`;
const heroLead = hero?.querySelector('.hero-lead');
if (heroLead) heroLead.textContent = 'Produzione e forniture professionali di materassi e sistemi letto per rivenditori, strutture ricettive e operatori contract.';
const heroPrimary = hero?.querySelector('.hero-actions .btn-light');
if (heroPrimary) {
  heroPrimary.href = '#contatti';
  heroPrimary.textContent = 'Richiedi il listino B2B';
}
const heroSecondary = hero?.querySelector('.hero-actions .text-link');
if (heroSecondary) {
  heroSecondary.href = '#gamma';
  heroSecondary.innerHTML = 'Scopri la gamma <span>↘</span>';
}
const heroCopy = hero?.querySelector('.hero-copy');
if (heroCopy && !heroCopy.querySelector('.hero-proof')) {
  const proof = document.createElement('div');
  proof.className = 'hero-proof';
  proof.innerHTML = '<span>Palermo</span><span>Made in Italy</span><span>Solo professionisti</span><span>Forniture B2B</span>';
  heroCopy.appendChild(proof);
}
const heroScroll = document.querySelector('.scroll-indicator');
if (heroScroll) {
  heroScroll.href = '#gamma';
  heroScroll.setAttribute('aria-label', 'Scorri alla gamma CF Materassi');
  const text = heroScroll.querySelector('span');
  if (text) text.textContent = 'SCOPRI CF';
}

// Compact proof strip directly after hero.
if (hero && !document.querySelector('.cf-trust-strip')) {
  const strip = document.createElement('section');
  strip.className = 'cf-trust-strip';
  strip.setAttribute('aria-label', 'Punti di forza CF Materassi');
  strip.innerHTML = `
    <div><strong>Produzione a Palermo</strong><span>Azienda reale · supporto diretto</span></div>
    <div><strong>Canale professionale</strong><span>Rivenditori · Hospitality · Contract</span></div>
    <div><strong>Gamma completa</strong><span>Molle · Memory · Poliuretano · Supporti</span></div>
    <div><strong>Catalogo B2B 2026</strong><span>Specifiche · modelli · forniture</span></div>`;
  hero.after(strip);
}

// Main product family before the digital twin.
if (hero && manifesto && !document.querySelector('#gamma')) {
  const gamma = document.createElement('section');
  gamma.className = 'cf-gamma';
  gamma.id = 'gamma';
  gamma.innerHTML = `
    <div class="gamma-head">
      <div>
        <p class="eyebrow dark reveal">CF / GAMMA PROFESSIONALE</p>
        <h2 class="reveal">Sistemi diversi.<br><span>Un'unica CF.</span></h2>
      </div>
      <p class="reveal">Non esiste un solo materasso CF. La gamma nasce per esigenze, posizionamenti e mercati differenti: showroom, hospitality e forniture professionali.</p>
    </div>
    <div class="gamma-grid">
      <article class="gamma-card gamma-carol reveal">
        <div class="gamma-media" role="img" aria-label="Carol Plus CF Materassi"></div>
        <div class="gamma-card-copy">
          <span class="gamma-kicker">MICROMOLLE + MEMORY</span><span class="gamma-index">01</span>
          <h3>Carol Plus</h3><span class="gamma-meta">1600 micromolle · H27</span><a href="#inside">Apri il digital twin ↘</a>
        </div>
      </article>
      <article class="gamma-card gamma-marta reveal">
        <div class="gamma-media" role="img" aria-label="Marta Box CF Materassi"></div>
        <div class="gamma-card-copy">
          <span class="gamma-kicker">MOLLE + MEMORY</span><span class="gamma-index">02</span>
          <h3>Marta Box</h3><span class="gamma-meta">Sistema ibrido</span><a href="#catalogo">Scopri la gamma ↘</a>
        </div>
      </article>
      <article class="gamma-card gamma-morfeus reveal">
        <div class="gamma-media" role="img" aria-label="Morfeus 3 Strati CF Materassi"></div>
        <div class="gamma-card-copy">
          <span class="gamma-kicker">MEMORY SYSTEM</span><span class="gamma-index">03</span>
          <h3>Morfeus 3 Strati</h3><span class="gamma-meta">Architettura a 3 strati</span><a href="#catalogo">Scopri la gamma ↘</a>
        </div>
      </article>
    </div>
    <div class="product-rail-wrap reveal">
      <div class="product-rail-head">
        <h3>La gamma continua.</h3>
        <p>Altri modelli reali CF, senza trasformare la homepage in un vecchio catalogo a schede.</p>
      </div>
      <div class="product-rail" aria-label="Altri modelli CF Materassi">
        <article class="product-mini product-king"><div class="product-mini-media"></div><div class="product-mini-copy"><span>MOLLE</span><strong>King Box</strong><small>Ortopedico</small></div></article>
        <article class="product-mini product-andromeda"><div class="product-mini-media"></div><div class="product-mini-copy"><span>POLIURETANO</span><strong>Andromeda H25</strong><small>Gamma professionale</small></div></article>
        <article class="product-mini product-arianna"><div class="product-mini-media"></div><div class="product-mini-copy"><span>POLIURETANO</span><strong>Arianna H20</strong><small>Gamma professionale</small></div></article>
        <article class="product-mini product-marta-mini"><div class="product-mini-media"></div><div class="product-mini-copy"><span>IBRIDO</span><strong>Marta Box</strong><small>Molle + Memory</small></div></article>
        <article class="product-mini product-morfeus-mini"><div class="product-mini-media"></div><div class="product-mini-copy"><span>MEMORY</span><strong>Morfeus</strong><small>2 / 3 Strati</small></div></article>
      </div>
    </div>`;
  manifesto.before(gamma);
}

// Carol Plus as technological proof, not brand identity.
const manifestoEyebrow = manifesto?.querySelector('.eyebrow');
if (manifestoEyebrow) manifestoEyebrow.textContent = 'CASE STUDY 01 · CAROL PLUS · DIGITAL TWIN';
const manifestoTitle = manifesto?.querySelector('h2');
if (manifestoTitle) manifestoTitle.innerHTML = `Un prodotto reale.<br><span>Lo apriamo davvero.</span>`;
const manifestoText = manifesto?.querySelector('.manifesto-grid > p');
if (manifestoText) manifestoText.textContent = 'Carol Plus è il primo modello usato per mostrare in 3D come CF costruisce un sistema letto: comfort package, 1600 micromolle e box perimetrale.';
const insideIndex = document.querySelector('.inside-index');
if (insideIndex) insideIndex.textContent = 'CASE STUDY 01 · CAROL PLUS · H27 · STRUTTURA 3D';
const inside = document.querySelector('[data-inside-section]');
if (inside && !inside.querySelector('.inside-skip')) {
  const skip = document.createElement('a');
  skip.className = 'inside-skip';
  skip.href = '#worlds';
  skip.textContent = 'Salta il 3D ↓';
  inside.querySelector('.inside-sticky')?.appendChild(skip);
}

// Real-company proof section: production beats generic AI polish.
if (worlds && oneIm && !document.querySelector('#azienda-reale')) {
  const proofSection = document.createElement('section');
  proofSection.className = 'cf-proof';
  proofSection.id = 'azienda-reale';
  proofSection.innerHTML = `
    <div class="cf-proof-grid">
      <div class="cf-proof-media" role="img" aria-label="Materasso CF durante la lavorazione in produzione"></div>
      <div class="cf-proof-copy reveal">
        <p class="eyebrow dark">DIETRO IL PRODOTTO</p>
        <h2>Non un render.<br><span>Un'azienda vera.</span></h2>
        <p>La tecnologia sul sito serve a spiegare meglio il prodotto. Dietro, però, ci sono materassi reali, lavorazione, stock e una sede operativa a Palermo.</p>
        <div class="proof-points">
          <div><strong>Produzione e lavorazione</strong><span>Il prodotto prende forma prima di arrivare in showroom o in struttura.</span></div>
          <div><strong>Rapporto diretto</strong><span>Un interlocutore locale per il canale professionale.</span></div>
          <div><strong>Gamma fisica</strong><span>Modelli, materiali e sistemi diversi per esigenze diverse.</span></div>
          <div><strong>Palermo</strong><span>Via Corselli ai Corsari 19A.</span></div>
        </div>
      </div>
    </div>`;
  oneIm.before(proofSection);
}

// 1IM is a concrete hospitality offer.
const oneImEyebrow = oneIm?.querySelector('.eyebrow');
if (oneImEyebrow) oneImEyebrow.textContent = 'HOTEL · B&B · STRUTTURE RICETTIVE';
const oneImTitle = oneIm?.querySelector('h2');
if (oneImTitle) oneImTitle.innerHTML = 'Classe 1IM.<br>Quando la fornitura lo richiede.';
const oneImText = oneIm?.querySelector('.one-im-copy > p:not(.eyebrow)');
if (oneImText) oneImText.textContent = 'Soluzioni ignifughe Classe 1IM per il settore ricettivo e professionale, integrate nella proposta di fornitura CF.';

// Catalog = depth, not repetition.
const collectionEyebrow = collection?.querySelector('.collection-heading .eyebrow');
if (collectionEyebrow) collectionEyebrow.textContent = 'CF / CATALOGO PROFESSIONALE 2026';
const collectionTitle = collection?.querySelector('.collection-heading h2');
if (collectionTitle) collectionTitle.innerHTML = `La homepage mostra il carattere.<br><span>Il catalogo entra nei dettagli.</span>`;
const collectionNames = collection?.querySelector('.collection-names');
if (collectionNames) {
  collectionNames.setAttribute('aria-label', 'Gamma CF Materassi');
  collectionNames.innerHTML = '<span>CAROL</span><i></i><span>CAROL PLUS</span><i></i><span>MARTA BOX</span><i></i><span>MORFEUS</span><i></i><span>KING BOX</span><i></i><span>ANDROMEDA</span><i></i><span>ARIANNA</span><i></i><span>SUPPORTI</span>';
}
const catalogText = collection?.querySelector('.catalog-cta > p');
if (catalogText) catalogText.textContent = 'Specifiche, altezze, costruzioni e disponibilità complete restano raccolte nel catalogo professionale CF 2026.';

// Contact now behaves as a commercial lead form, without inventing backend infrastructure.
if (contact && !contact.querySelector('.b2b-form')) {
  const contactTitle = contact.querySelector('h2');
  if (contactTitle) contactTitle.innerHTML = 'Vuoi lavorare<br><span>con CF?</span>';
  const form = document.createElement('form');
  form.className = 'b2b-form';
  form.innerHTML = `
    <label>Nome<input name="nome" required autocomplete="name" placeholder="Il tuo nome"></label>
    <label>Azienda<input name="azienda" required autocomplete="organization" placeholder="Ragione sociale / attività"></label>
    <label>Provincia<input name="provincia" required placeholder="Es. Palermo"></label>
    <label>Tipologia<select name="tipo" required><option value="">Seleziona</option><option>Rivenditore</option><option>Hotel / B&B</option><option>Casa vacanze</option><option>Contract / progettista</option><option>Altro professionista</option></select></label>
    <label class="form-wide">Telefono<input name="telefono" required autocomplete="tel" placeholder="Numero di contatto"></label>
    <button type="submit">Richiedi il listino B2B su WhatsApp ↗</button>
    <p class="form-note">Il modulo prepara un messaggio WhatsApp con i dati inseriti. Nessun dato viene salvato dal sito.</p>`;
  contact.querySelector('.contact-copy')?.appendChild(form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const text = `Ciao CF Materassi, vorrei ricevere informazioni/listino B2B.%0A%0ANome: ${encodeURIComponent(data.get('nome'))}%0AAzienda: ${encodeURIComponent(data.get('azienda'))}%0AProvincia: ${encodeURIComponent(data.get('provincia'))}%0ATipologia: ${encodeURIComponent(data.get('tipo'))}%0ATelefono: ${encodeURIComponent(data.get('telefono'))}`;
    window.open(`https://wa.me/393450494432?text=${text}`, '_blank', 'noopener');
  });
}

// Persistent CTA: useful, not intrusive.
if (!document.querySelector('.sticky-b2b')) {
  const sticky = document.createElement('a');
  sticky.className = 'sticky-b2b';
  sticky.href = '#contatti';
  sticky.innerHTML = 'Richiedi listino B2B <i>↗</i>';
  document.body.appendChild(sticky);
}

const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const menu = document.querySelector('[data-mobile-menu]');
const progress = document.querySelector('[data-progress]');
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
    window.dispatchEvent(new CustomEvent('cf:inside-progress', { detail: { progress: p, active } }));
  }
}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    requestAnimationFrame(() => { updateScrollUI(); ticking = false; });
    ticking = true;
  }
},{passive:true});
window.addEventListener('resize', updateScrollUI,{passive:true});
updateScrollUI();

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));
