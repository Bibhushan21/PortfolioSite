function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function setupThemeToggle() {
  const desktop = document.getElementById("theme-toggle");
  const mobile = document.getElementById("theme-toggle-mobile");
  const buttons = [desktop, mobile].filter(Boolean);
  if (buttons.length === 0) return;

  const getStored = () => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  };

  const setStored = (value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {
      // ignore
    }
  };

  const systemPrefersLight = () =>
    window.matchMedia?.("(prefers-color-scheme: light)")?.matches ?? false;

  const apply = (theme) => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    const icon = theme === "light" ? "☀" : "☾";
    buttons.forEach((b) => {
      b.querySelector("span")?.replaceChildren(document.createTextNode(icon));
      b.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    });
  };

  const initial = getStored() ?? (systemPrefersLight() ? "light" : "dark");
  apply(initial);

  const toggle = () => {
    const current = document.documentElement.dataset.theme || "dark";
    const next = current === "light" ? "dark" : "light";
    apply(next);
    setStored(next);
  };

  buttons.forEach((b) => b.addEventListener("click", toggle));
}

function setupProjectFilters() {
  const buttons = [...document.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(".project-card[data-tags]")];
  if (buttons.length === 0 || cards.length === 0) return;

  const setActive = (filter) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === filter));
    cards.forEach((card) => {
      const tags = (card.dataset.tags || "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const show = filter === "all" ? true : tags.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  };

  buttons.forEach((b) => {
    b.addEventListener("click", () => setActive(b.dataset.filter || "all"));
  });

  setActive("all");
}

function setupProjectModal() {
  const modal = document.getElementById("project-modal");
  if (!modal) return;

  const titleEl = document.getElementById("modal-title");
  const tagsEl = document.getElementById("modal-tags");
  const descEl = document.getElementById("modal-description");
  const imgEl = document.getElementById("modal-image");
  const githubEl = document.getElementById("modal-github");
  if (!titleEl || !tagsEl || !descEl || !imgEl || !githubEl) return;

  const openers = [...document.querySelectorAll("[data-open-project]")];
  const closers = [...modal.querySelectorAll("[data-close-modal]")];
  let lastFocus = null;

  const open = (data) => {
    lastFocus = document.activeElement;
    titleEl.textContent = data.title || "Projekt";
    descEl.textContent = data.description || "";
    const tags = (data.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    tagsEl.textContent = tags.length ? tags.map((t) => `#${t}`).join(" ") : "";
    githubEl.href = data.github || "#";

    if (data.image) {
      imgEl.src = data.image;
      imgEl.alt = data.title ? `Screenshot: ${data.title}` : "Projekt Screenshot";
    } else {
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    }

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");

    const closeBtn = modal.querySelector("[data-close-modal]");
    closeBtn?.focus?.();
  };

  const close = () => {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
    lastFocus?.focus?.();
  };

  openers.forEach((btn) => {
    btn.addEventListener("click", () => {
      open({
        title: btn.dataset.title,
        tags: btn.dataset.tags,
        github: btn.dataset.github,
        image: btn.dataset.image,
        description: btn.dataset.description,
      });
    });
  });

  closers.forEach((c) => c.addEventListener("click", close));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  modal.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
}

function setupMagneticCTA() {
  if (prefersReducedMotion) return;
  const items = [...document.querySelectorAll("[data-magnetic] .btn-color-1")];
  if (items.length === 0) return;

  items.forEach((el) => {
    let raf = null;
    const strength = 0.18;

    const reset = () => {
      el.style.transform = "";
    };

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    el.addEventListener("blur", reset);
  });
}

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
  setupThemeToggle();
  setupScrollProgress();
  setupRevealAnimations();
  setupScrollSpy();
  setupProjectFilters();
  setupProjectModal();
  setupMagneticCTA();
});
