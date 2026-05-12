const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxTitle = document.querySelector("[data-lightbox-title]");
const lightboxCounter = document.querySelector("[data-lightbox-counter]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const galleryButton = document.querySelector("[data-open-gallery]");
const revealItems = document.querySelectorAll(".reveal");
const productCards = document.querySelectorAll("[data-product]");
const catalogPages = [
  { src: "/catalogo-copertina.jpg", title: "Copertina catalogo" },
  { src: "/catalogo-carol.jpg", title: "Carol" },
  { src: "/catalogo-carol-plus.jpg", title: "Carol Plus" },
  { src: "/catalogo-morfeus-3-strati.jpg", title: "Morfeus 3 Strati" },
  { src: "/catalogo-morfeus-2-strati.jpg", title: "Morfeus 2 Strati" },
  { src: "/catalogo-marta-box.jpg", title: "Marta Box" },
  { src: "/catalogo-king-box-ortopedico.jpg", title: "King Box Ortopedico" },
  { src: "/catalogo-andromeda-h25.jpg", title: "Andromeda H25" },
  { src: "/catalogo-arianna-h20.jpg", title: "Arianna H20" },
  { src: "/catalogo-accessori-supporti.jpg", title: "Accessori e supporti" },
  { src: "/catalogo-pagina-finale.jpg", title: "Pagina finale" }
];
let activeLightboxItems = [];
let activeLightboxIndex = 0;

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeNavigation = () => {
  nav.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

const renderLightbox = () => {
  const item = activeLightboxItems[activeLightboxIndex];
  const hasMultipleItems = activeLightboxItems.length > 1;
  lightboxImage.src = item.src;
  lightboxImage.alt = item.title;
  lightboxTitle.textContent = item.title;
  lightboxCounter.textContent = hasMultipleItems ? `Pagina ${activeLightboxIndex + 1} di ${activeLightboxItems.length}` : "";
  lightboxPrev.classList.toggle("is-hidden", !hasMultipleItems);
  lightboxNext.classList.toggle("is-hidden", !hasMultipleItems);
};

const openLightbox = (items, startIndex = 0) => {
  activeLightboxItems = items;
  activeLightboxIndex = startIndex;
  renderLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const changeLightboxPage = (direction) => {
  if (activeLightboxItems.length <= 1) {
    return;
  }
  activeLightboxIndex = (activeLightboxIndex + direction + activeLightboxItems.length) % activeLightboxItems.length;
  renderLightbox();
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16
});

revealItems.forEach((item) => revealObserver.observe(item));

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

productCards.forEach((card) => {
  card.addEventListener("click", () => {
    openLightbox([{ src: card.dataset.image, title: card.dataset.product }]);
  });
});

galleryButton.addEventListener("click", () => {
  openLightbox(catalogPages);
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => changeLightboxPage(-1));
lightboxNext.addEventListener("click", () => changeLightboxPage(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }
  if (event.key === "Escape") {
    closeLightbox();
  }
  if (event.key === "ArrowLeft") {
    changeLightboxPage(-1);
  }
  if (event.key === "ArrowRight") {
    changeLightboxPage(1);
  }
});
