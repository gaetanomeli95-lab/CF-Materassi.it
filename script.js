const body = document.body;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const progress = document.querySelector('[data-progress]');
const year = document.querySelector('[data-year]');

if (year) year.textContent = new Date().getFullYear();

const closeMenu = () => {
  if (!navToggle || !mobileMenu) return;
  navToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
};

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('open', !open);
  });

  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
}

const onScroll = () => {
  const y = window.scrollY;
  if (header) header.classList.toggle('scrolled', y > 24);

  if (progress) {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
    progress.style.width = `${pct}%`;
  }
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const products = [
  {
    name: 'Carol Plus',
    kicker: 'TOP COMFORT',
    description: 'La proposta CF con 1600 micromolle, pensata per un’offerta di comfort evoluta.',
    specValue: '1600',
    specLabel: 'MICROMOLLE',
    image: '/catalogo-carol-plus.jpg'
  },
  {
    name: 'Carol',
    kicker: 'COMFORT A MOLLE',
    description: 'Un modello CF con 800 molle, dedicato a chi cerca una soluzione strutturata e facilmente inseribile nell’offerta professionale.',
    specValue: '800',
    specLabel: 'MOLLE',
    image: '/catalogo-carol.jpg'
  },
  {
    name: 'Morfeus 3 Strati',
    kicker: 'STRUTTURA EVOLUTA',
    description: 'Tre strati per una proposta costruita attorno alla stratificazione del comfort.',
    specValue: '3',
    specLabel: 'STRATI',
    image: '/catalogo-morfeus-3-strati.jpg'
  },
  {
    name: 'Morfeus 2 Strati',
    kicker: 'EQUILIBRIO',
    description: 'La versione a due strati della linea Morfeus, presentata nel catalogo professionale CF 2026.',
    specValue: '2',
    specLabel: 'STRATI',
    image: '/catalogo-morfeus-2-strati.jpg'
  },
  {
    name: 'King Box',
    kicker: 'ORTOPEDICO A MOLLE',
    description: 'Una soluzione della collezione CF dedicata al segmento ortopedico a molle.',
    specValue: 'KING',
    specLabel: 'BOX',
    image: '/catalogo-king-box-ortopedico.jpg'
  },
  {
    name: 'Marta Box',
    kicker: 'COLLEZIONE CF',
    description: 'Marta Box completa la gamma professionale con una proposta dedicata al mercato B2B.',
    specValue: 'CF',
    specLabel: 'B2B',
    image: '/catalogo-marta-box.jpg'
  },
  {
    name: 'Andromeda H25',
    kicker: 'COLLEZIONE CF',
    description: 'Andromeda H25, una delle proposte presenti nel catalogo professionale CF Materassi 2026.',
    specValue: 'H25',
    specLabel: 'ANDROMEDA',
    image: '/catalogo-andromeda-h25.jpg'
  },
  {
    name: 'Arianna H20',
    kicker: 'COLLEZIONE CF',
    description: 'Arianna H20, parte della gamma CF dedicata a rivenditori e operatori professionali.',
    specValue: 'H20',
    specLabel: 'ARIANNA',
    image: '/catalogo-arianna-h20.jpg'
  }
];

const visual = document.querySelector('.product-visual');
const productImage = document.querySelector('[data-product-image]');
const productName = document.querySelector('[data-product-name]');
const productKicker = document.querySelector('[data-product-kicker]');
const productDesc = document.querySelector('[data-product-desc]');
const productSpec = document.querySelector('[data-product-spec]');
const productCounter = document.querySelector('[data-product-counter]');
const productButtons = [...document.querySelectorAll('[data-product]')];

let activeProduct = 0;
let swapTimer;

const renderProduct = index => {
  if (!products[index] || index === activeProduct && productImage?.src.includes(products[index].image)) return;
  activeProduct = index;
  const item = products[index];

  if (visual) visual.classList.add('is-switching');
  clearTimeout(swapTimer);

  swapTimer = setTimeout(() => {
    if (productImage) {
      productImage.src = item.image;
      productImage.alt = item.name;
    }
    if (productName) productName.textContent = item.name;
    if (productKicker) productKicker.textContent = item.kicker;
    if (productDesc) productDesc.textContent = item.description;
    if (productSpec) productSpec.innerHTML = `<strong>${item.specValue}</strong><span>${item.specLabel}</span>`;
    if (productCounter) productCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(products.length).padStart(2, '0')}`;

    productButtons.forEach((button, buttonIndex) => {
      button.classList.toggle('active', buttonIndex === index);
      button.setAttribute('aria-selected', String(buttonIndex === index));
    });

    requestAnimationFrame(() => visual?.classList.remove('is-switching'));
  }, 220);
};

productButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (index !== activeProduct) renderProduct(index);
  });
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', String(index === activeProduct));
});

const stage = document.querySelector('[data-hero-stage]');
const parallaxProduct = document.querySelector('[data-parallax-product]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (stage && parallaxProduct && !reduceMotion) {
  stage.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    parallaxProduct.style.transform = `rotate(${-2 + px * 2.3}deg) translate3d(${px * 14}px, ${py * 10}px, 0)`;
  });

  stage.addEventListener('pointerleave', () => {
    parallaxProduct.style.transform = 'rotate(-2deg) translate3d(0,0,0)';
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const offset = header ? header.offsetHeight - 1 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});
