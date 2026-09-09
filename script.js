const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const menu = document.querySelector('[data-mobile-menu]');
const progress = document.querySelector('[data-progress]');
const inside = document.querySelector('[data-inside-section]');
const insideMeter = document.querySelector('[data-inside-meter]');
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Replace the previous generic inside scene with the dedicated Carol Plus digital twin.
if(inside){
  inside.classList.add('carol-technical');
  const oldCanvas = inside.querySelector('#inside-webgl');
  if(oldCanvas) oldCanvas.id = 'carol-webgl';

  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = 'carol-plus.css?v=2';
  document.head.appendChild(css);

  const copy = inside.querySelector('.inside-copy');
  if(copy){
    copy.innerHTML = `
      <div class="inside-index">CAROL PLUS · H27 · VERIFIED DIGITAL TWIN</div>
      <div class="inside-step is-active" data-step="0">
        <span>01 · CAROL PLUS</span>
        <h3>Un solo modello.<br>Quello vero.</h3>
        <p>Il Carol Plus parte assemblato. Nessuna foto catalogo viene sovrapposta al 3D: da qui in poi il prodotto è un unico digital twin.</p>
      </div>
      <div class="inside-step" data-step="1">
        <span>02 · COMFORT PACKAGE</span>
        <h3>5 cm Memory.<br>3 cm Poliuretano.</h3>
        <p>Lo scroll separa rivestimento stretch, maglina, feltro, poliuretano D25 e lastra Memory Foam D40 secondo la scheda tecnica.</p>
      </div>
      <div class="inside-step" data-step="2">
        <span>03 · CORE</span>
        <h3>1600 micromolle.<br>7 zone.</h3>
        <p>Il cuore tecnico usa 1600 istanze WebGL reali, racchiuse nel box perimetrale anti-affossamento. Le sette zone sono differenziate anche visivamente.</p>
      </div>
      <div class="inside-step" data-step="3">
        <span>04 · EXPLODED SYSTEM</span>
        <h3>Carol Plus.<br>Dall'esterno al cuore.</h3>
        <p>Alla fine l'intero H27 resta aperto nello spazio: strato per strato, con fascia in velluto, fascia 3D traspirante, ZIP e pacchetto inferiore.</p>
      </div>`;
  }

  const sticky = inside.querySelector('.inside-sticky');
  sticky?.insertAdjacentHTML('beforeend', `
    <div class="carol-tech-badge"><i></i><b>CAROL PLUS</b><span>H27 · 3D CUTAWAY</span></div>
    <div class="carol-tech-callouts" aria-hidden="true">
      <div class="carol-callout is-active"><div><strong>Tessuto stretch</strong><span>Fibra poliestere 500 g/m² per lato</span></div></div>
      <div class="carol-callout"><div><strong>Maglina interna</strong><span>Fodera interna</span></div></div>
      <div class="carol-callout"><div><strong>Feltro</strong><span>1,300 kg per lato</span></div></div>
      <div class="carol-callout"><div><strong>Memory Foam</strong><span>5 cm · densità 40</span></div></div>
      <div class="carol-callout"><div><strong>Poliuretano</strong><span>3 cm · densità 25</span></div></div>
      <div class="carol-callout"><div><strong>1600 Micromolle</strong><span>Insacchettate · 7 zone differenziate</span></div></div>
      <div class="carol-callout"><div><strong>Box perimetrale</strong><span>Tamponi 9×14 · densità MK5</span></div></div>
      <div class="carol-callout"><div><strong>Poliuretano</strong><span>3 cm · lato inferiore</span></div></div>
      <div class="carol-callout"><div><strong>Feltro + Maglina</strong><span>Pacchetto inferiore</span></div></div>
      <div class="carol-callout"><div><strong>Fascia perimetrale</strong><span>Velluto · 4 maniglie · 3D · ZIP</span></div></div>
    </div>
    <div class="carol-zone-legend"><span>7 ZONE</span><div class="carol-zone-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="carol-tech-caption"><b>SCROLL</b> · ASSEMBLED → EXPLODED DIGITAL TWIN</div>`);

  import('./carol-plus-3d.js?v=2').catch(err=>console.error('Carol Plus 3D:',err));
}

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
    if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
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
    window.dispatchEvent(new CustomEvent('cf:inside-progress',{detail:{progress:p,active}}));
  }
}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){ requestAnimationFrame(() => { updateScrollUI(); ticking = false; }); ticking = true; }
},{passive:true});
window.addEventListener('resize', updateScrollUI,{passive:true});
updateScrollUI();

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));
