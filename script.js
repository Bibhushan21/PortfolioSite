function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function setupScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupRevealAnimations() {
  if (prefersReducedMotion) return;

  const candidates = [
    ...document.querySelectorAll("section"),
    ...document.querySelectorAll(".details-container"),
    ...document.querySelectorAll(".color-container"),
  ];

  candidates.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  candidates.forEach((el) => io.observe(el));
}

function setupScrollSpy() {
  const links = [...document.querySelectorAll('nav a[href^="#"]')];
  const linkById = new Map();

  links.forEach((a) => {
    const id = a.getAttribute("href")?.slice(1);
    if (!id) return;
    linkById.set(id, linkById.get(id) ? [...linkById.get(id), a] : [a]);
  });

  const sections = [...document.querySelectorAll("section[id]")];
  if (sections.length === 0 || linkById.size === 0) return;

  const setActive = (id) => {
    links.forEach((a) => a.classList.remove("is-active"));
    const group = linkById.get(id);
    if (!group) return;
    group.forEach((a) => a.classList.add("is-active"));
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    { threshold: [0.25, 0.4, 0.55], rootMargin: "-20% 0px -55% 0px" }
  );

  sections.forEach((s) => io.observe(s));
}

document.addEventListener("DOMContentLoaded", () => {
  setupScrollProgress();
  setupRevealAnimations();
  setupScrollSpy();
});
