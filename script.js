/* Thalari Sony Prashanthi — portfolio interactions */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header ---------- */
  const header = $(".site-header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  const toggle = $("#nav-toggle");
  const menu = $("#nav-menu");

  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
    document.body.style.overflow = "";
  };

  const openMenu = () => {
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      open ? closeMenu() : openMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Active section highlight ---------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-menu a[href^='#']");

  const setActiveNav = () => {
    const y = window.scrollY + 120;
    let current = "";
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href === `#${current}`);
    });
  };
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Experience show more ---------- */
  const expToggle = $("#exp-toggle");
  const expOlder = $("#exp-older");

  if (expToggle && expOlder) {
    expToggle.addEventListener("click", () => {
      const expanded = expToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        expOlder.hidden = true;
        expOlder.classList.remove("is-open");
        expToggle.setAttribute("aria-expanded", "false");
        expToggle.querySelector(".toggle-label").textContent = "Show more experience";
      } else {
        expOlder.hidden = false;
        expOlder.classList.add("is-open");
        expToggle.setAttribute("aria-expanded", "true");
        expToggle.querySelector(".toggle-label").textContent = "Show less";
        // reveal newly shown cards
        expOlder.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      }
    });
  }

  /* ---------- Back to top ---------- */
  const toTop = $("#to-top");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = $$(".stat-num[data-count]");
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent = c.dataset.count || "0";
    });
  }

  /* ---------- Soft 3D tilt on skill cards ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 10;
        const ry = (x - 0.5) * 12;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Photo stage parallax ---------- */
  const stage = $(".photo-stage");
  if (stage && !reduceMotion) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const frame = $(".photo-frame", stage);
      if (frame) {
        frame.style.transform = `rotateY(${-6 + x * 8}deg) rotateX(${3 - y * 6}deg)`;
      }
    });
    stage.addEventListener("pointerleave", () => {
      const frame = $(".photo-frame", stage);
      if (frame) frame.style.transform = "";
    });
  }

  /* ---------- Particle canvas (soft pastel dots) ---------- */
  const canvas = $("#particle-canvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;

    const colors = [
      "rgba(201,182,228,0.55)",
      "rgba(255,212,196,0.55)",
      "rgba(184,224,210,0.5)",
      "rgba(183,212,240,0.5)",
      "rgba(243,196,212,0.45)",
    ];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(48, Math.floor((w * h) / 38000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.8,
        vx: -0.15 + Math.random() * 0.3,
        vy: -0.12 + Math.random() * 0.24,
        c: colors[(Math.random() * colors.length) | 0],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = p.c;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // soft connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(155,126,200,${(1 - d / 110) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  /* ---------- Smooth anchor offset handled by CSS scroll-padding ---------- */
})();
