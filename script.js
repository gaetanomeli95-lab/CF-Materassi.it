const header = document.querySelector('[data-header]');
const progress = document.querySelector('[data-progress]');
const navToggle = document.querySelector('[data-nav-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const productVisual = document.querySelector('.product-visual');
const productImage = document.querySelector('[data-product-image]');
const productCounter = document.querySelector('[data-product-counter]');
const productKicker = document.querySelector('[data-product-kicker]');
const productName = document.querySelector('[data-product-name]');
const productDesc = document.querySelector('[data-product-desc]');
const productSpec = document.querySelector('[data-product-spec]');
const productButtons = [...document.querySelectorAll('[data-product]')];
const parallaxProduct = document.querySelector('[data-parallax-product]');
const heroStage = document.querySelector('[data-hero-stage]');
const year = document.querySelector('[data-year]');

const products = [
  {
    name: 'Carol Plus',
    kicker: 'TOP COMFORT',
    image: '/catalogo-carol-plus.jpg',
    alt: 'Materasso Carol Plus CF Materassi',
    description: "La proposta CF con 1600 micromolle, pensata per un'offerta di comfort evoluta.",
    specValue: '1600',
    specLabel: 'MICROMOLLE'
  },
  {
    name: 'Carol',
    kicker: 'COMFORT A MOLLE',
    image: '/catalogo-carol.jpg',
    alt: 'Materasso Carol CF Materassi',
    description: 'Una soluzione a 800 molle per costruire una proposta professionale equilibrata e facilmente presentabile.',
    specValue: '800',
    specLabel: 'MOLLE'
  },
  {
    name: 'Morfeus 3 Strati',
    kicker: 'STRUTTURA EVOLUTA',
    image: '/catalogo-morfeus-3-strati.jpg',
    alt: 'Materasso Morfeus 3 Strati CF Materassi',
    description: 'Tre strati per una proposta costruita intorno a sostegno, comfort e differenziazione della gamma.',
    specValue: '3',
    specLabel: 'STRATI'
  },
  {
    name: 'Morfeus 2 Strati',
    kicker: 'EQUILIBRIO',
    image: '/catalogo-morfeus-2-strati.jpg',
    alt: 'Materasso Morfeus 2 Strati CF Materassi',
    description: 'Una configurazione a due strati pensata per completare la linea Morfeus con una proposta essenziale e versatile.',
    specValue: '2',
    specLabel: 'STRATI'
  },
  {
    name: 'King Box',
    kicker: 'ORTOPEDICO A MOLLE',
    image: '/catalogo-king-box-ortopedico.jpg',
    alt: 'Materasso King Box ortopedico CF Materassi',
    description: 'Il modello ortopedico a molle della collezione CF per il mercato professionale.',
    specValue: 'BOX',
    specLabel: 'ORTOPEDICO'
  },
  {
    name: 'Marta Box',
    kicker: 'COLLEZIONE CF',
    image: '/catalogo-marta-box.jpg',
    alt: 'Materasso Marta Box CF Materassi',
    description: 'Una proposta della collezione CF pensata per ampliare la scelta disponibile a rivenditori e operatori.',
    specValue: 'CF',
    specLabel: 'COLLEZIONE'
  },
  {
    name: 'Andromeda H25',
    kicker: 'ALTEZZA H25',
    image: '/catalogo-andromeda-h25.jpg',
    alt: 'Materasso Andromeda H25 CF Materassi',
    description: 'Andromeda H25 completa la gamma professionale CF con una configurazione dedicata al comfort quotidiano.',
    specValue: 'H25',
    specLabel: 'ALTEZZA'
  },
  {
    name: 'Arianna H20',
    kicker: 'ALTEZZA H20',
    image: '/catalogo-arianna-h20.jpg',
    alt: 'Materasso Arianna H20 CF Materassi',
    description: 'Arianna H20 amplia la collezione con una soluzione compatta pensata per esigenze professionali diverse.',
    specValue: 'H20',
    specLabel: 'ALTEZZA'
  }
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScrollUI() {
  const y = window.scrollY || 0;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const ratio = clamp(y / maxScroll, 0, 1);

  header?.classList.toggle('scrolled', y > 24);

  if (progress) {
    progress.style.width = `${ratio * 100}%`;
  }
}

function setMenu(open) {
  if (!navToggle || !mobileMenu) return;

  navToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('open', open);
  header?.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
}

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  setMenu(open);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980) setMenu(false);
});

function renderProduct(index) {
  const product = products[index];
  if (!product || !productImage || !productVisual) return;

  productVisual.classList.add('is-switching');

  window.setTimeout(() => {
    productImage.src = product.image;
    productImage.alt = product.alt;
    if (productCounter) productCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(products.length).padStart(2, '0')}`;
    if (productKicker) productKicker.textContent = product.kicker;
    if (productName) productName.textContent = product.name;
    if (productDesc) productDesc.textContent = product.description;

    if (productSpec) {
      productSpec.innerHTML = `<strong>${product.specValue}</strong><span>${product.specLabel}</span>`;
    }

    productButtons.forEach((button) => {
      const isActive = Number(button.dataset.product) === index;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    requestAnimationFrame(() => {
      productVisual.classList.remove('is-switching');
    });
  }, 180);
}

productButtons.forEach((button) => {
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
  button.addEventListener('click', () => renderProduct(Number(button.dataset.product)));
});

const revealTargets = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -5% 0px'
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateParallax(event) {
  if (!heroStage || !parallaxProduct || reducedMotion.matches || window.innerWidth < 981) return;

  const rect = heroStage.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
  const y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

  parallaxProduct.style.transform = `rotate(-2deg) translate3d(${x * 16}px, ${y * 10}px, 0) rotateX(${-y * 2.2}deg) rotateY(${x * 2.5}deg)`;
}

function resetParallax() {
  if (!parallaxProduct) return;
  parallaxProduct.style.transform = '';
}

heroStage?.addEventListener('pointermove', updateParallax);
heroStage?.addEventListener('pointerleave', resetParallax);

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);
updateScrollUI();

if (year) {
  year.textContent = new Date().getFullYear();
}
