/* ==========================================================
   Bitloop Lab — site behaviour
   ========================================================== */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const APPS = window.APPS || [];
  const page = document.body.dataset.page || "home";

  const NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "services", label: "Services", href: "services.html" },
    { id: "apps", label: "Our Apps", href: "apps.html" },
    { id: "contact", label: "Contact", href: "contact.html" }
  ];

  const ICONS = {
    sun: '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Theme (runs before render to avoid flash) ---------- */
  function storedTheme() {
    try { return localStorage.getItem("bl-theme"); } catch (e) { return null; }
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("bl-theme", t); } catch (e) { /* storage unavailable */ }
  }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", storedTheme() || (prefersDark ? "dark" : "light"));

  /* ---------- Header ---------- */
  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const links = NAV.map(
      (n) => `<li><a href="${n.href}" class="${n.id === page ? "active" : ""}"${n.id === page ? ' aria-current="page"' : ""}>${n.label}</a></li>`
    ).join("");
    el.outerHTML = `
      <header class="site-header" id="header">
        <nav class="container nav" aria-label="Main">
          <a href="index.html" class="brand" aria-label="${esc(SITE.name)} home">
            <img src="assets/img/logo.svg" alt="" width="38" height="38">
            <span><b>Bitloop</b> <em>Lab</em></span>
          </a>
          <ul class="nav-links" id="navLinks">${links}</ul>
          <div class="nav-actions">
            <button class="icon-btn theme-toggle" id="themeToggle" aria-label="Toggle dark mode">${ICONS.sun}${ICONS.moon}</button>
            <a href="contact.html" class="btn btn-primary">Start a Project</a>
            <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">${ICONS.menu}</button>
          </div>
        </nav>
      </header>`;
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const social = Object.entries(SITE.social || {})
      .filter(([, url]) => url)
      .map(([name, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener">${name[0].toUpperCase() + name.slice(1)}</a></li>`)
      .join("");
    const contact = [
      SITE.email && `<li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>`,
      SITE.phone && `<li><a href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a></li>`,
      SITE.location && `<li><a href="contact.html">${esc(SITE.location)}</a></li>`
    ].filter(Boolean).join("");

    el.outerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="index.html" class="brand"><img src="assets/img/logo.svg" alt="" width="38" height="38"><span><b>Bitloop</b> <em>Lab</em></span></a>
              <p>${esc(SITE.tagline)} We design and build Android apps and websites that people enjoy using.</p>
            </div>
            <div>
              <h4>Pages</h4>
              <ul>${NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("")}</ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>${contact}</ul>
            </div>
            <div>
              <h4>Follow</h4>
              <ul>${social}${SITE.playStoreDeveloperUrl ? `<li><a href="${esc(SITE.playStoreDeveloperUrl)}" target="_blank" rel="noopener">Google Play</a></li>` : ""}</ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</span>
            <span><a href="app-ads.txt">app-ads.txt</a></span>
          </div>
        </div>
      </footer>
      <button class="to-top" id="toTop" aria-label="Back to top">↑</button>`;
  }

  /* ---------- Interactions ---------- */
  function initHeader() {
    const header = document.getElementById("header");
    const toggle = document.getElementById("themeToggle");
    const menuBtn = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    const toTop = document.getElementById("toTop");

    toggle && toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });

    if (menuBtn && links) {
      const setOpen = (open) => {
        links.classList.toggle("open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        menuBtn.innerHTML = open ? ICONS.close : ICONS.menu;
      };
      menuBtn.addEventListener("click", () => setOpen(!links.classList.contains("open")));
      links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    }

    const onScroll = () => {
      const y = window.scrollY;
      header && header.classList.toggle("scrolled", y > 10);
      toTop && toTop.classList.toggle("show", y > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop && toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  function initTyped() {
    const el = document.getElementById("typed");
    const words = window.TYPED_WORDS || [];
    if (!el || !words.length) return;
    let w = 0, i = 0, deleting = false;
    (function tick() {
      const word = words[w];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 45 : 95;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    })();
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    const run = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const dur = 1400;
      (function frame(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    };
    if (!("IntersectionObserver" in window)) return counters.forEach(run);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- Apps ---------- */
  function appCard(app) {
    let action;
    if (app.playStore) {
      action = `<a class="btn btn-primary" href="${esc(app.playStore)}" target="_blank" rel="noopener">Get it on Google Play</a>`;
    } else if (app.website) {
      action = `<a class="btn btn-outline" href="${esc(app.website)}"${/^https?:/.test(app.website) ? ' target="_blank" rel="noopener"' : ""}>Visit website</a>`;
    } else {
      action = `<span class="btn btn-outline" aria-disabled="true">Coming soon</span>`;
    }
    return `
      <article class="card app-card reveal">
        <div class="app-cover" style="background:${esc(app.color)}" aria-hidden="true">${esc(app.icon)}</div>
        <div class="app-body">
          <div class="app-meta">
            <span class="tag">${app.category === "web" ? "Website" : "Android App"}</span>
            <span class="rating">${esc(app.status)}</span>
          </div>
          <h3>${esc(app.name)}</h3>
          <p>${esc(app.description)}</p>
          ${action}
        </div>
      </article>`;
  }

  function initFeaturedApps() {
    const el = document.getElementById("featuredApps");
    if (!el) return;
    el.innerHTML = APPS.filter((a) => a.featured).slice(0, 3).map(appCard).join("");
  }

  function initAppsPage() {
    const grid = document.getElementById("appsGrid");
    if (!grid) return;
    const search = document.getElementById("appSearch");
    const buttons = document.querySelectorAll(".filter-btn");
    const count = document.getElementById("appCount");
    let filter = "all";

    function render() {
      const q = (search && search.value.trim().toLowerCase()) || "";
      const list = APPS.filter((a) =>
        (filter === "all" || a.category === filter) &&
        (!q || (a.name + " " + a.description).toLowerCase().includes(q))
      );
      grid.innerHTML = list.length ? list.map(appCard).join("") : '<p class="empty">No apps match your search.</p>';
      grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      if (count) count.textContent = `${list.length} ${list.length === 1 ? "project" : "projects"}`;
    }

    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        buttons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        filter = btn.dataset.filter;
        render();
      })
    );
    search && search.addEventListener("input", render);
    render();
  }

  /* ---------- Contact ---------- */
  function initContactInfo() {
    const el = document.getElementById("contactInfo");
    if (!el) return;
    const items = [
      SITE.email && { t: "Email", v: `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`, i: '<path d="M4 4h16v16H4z" opacity="0"/><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>' },
      SITE.phone && { t: "Phone", v: `<a href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a>`, i: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>' },
      SITE.location && { t: "Location", v: `<p>${esc(SITE.location)} · Working with clients worldwide</p>`, i: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' },
      { t: "Response time", v: "<p>We usually reply within 24 hours.</p>", i: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>' }
    ].filter(Boolean);
    el.innerHTML = items.map((x) => `
      <div class="info-item">
        <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${x.i}</svg></div>
        <div><h4>${x.t}</h4>${x.v}</div>
      </div>`).join("");
  }

  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("formStatus");

    // Pre-select a service passed as ?service=... (from the Services page)
    const preset = new URLSearchParams(location.search).get("service");
    if (preset && form.service) {
      const opt = Array.from(form.service.options).find((o) => o.value === preset);
      if (opt) form.service.value = preset;
    }

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email."),
      service: (v) => (v ? "" : "Please choose a service."),
      message: (v) => (v.trim().length >= 10 ? "" : "Tell us a little more (at least 10 characters).")
    };

    function check(name) {
      const input = form.elements[name];
      const msg = rules[name](input.value);
      const field = input.closest(".field");
      field.classList.toggle("invalid", !!msg);
      field.querySelector(".error").textContent = msg;
      return !msg;
    }

    Object.keys(rules).forEach((name) => {
      form.elements[name].addEventListener("blur", () => check(name));
      form.elements[name].addEventListener("input", () => {
        if (form.elements[name].closest(".field").classList.contains("invalid")) check(name);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) {
        const first = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        first && first.focus();
        return;
      }
      const d = Object.fromEntries(new FormData(form).entries());
      const subject = `New project enquiry: ${d.service} — ${d.name}`;
      const body = [
        `Name: ${d.name}`,
        `Email: ${d.email}`,
        `Service: ${d.service}`,
        `Budget: ${d.budget || "Not specified"}`,
        "",
        d.message
      ].join("\n");
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Thanks! Your email app should open with the message ready to send. If it doesn't, email us at " + SITE.email + ".";
      status.className = "form-status success show";
      form.reset();
    });
  }

  /* ---------- Boot ---------- */
  renderHeader();
  renderFooter();
  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initFeaturedApps();
    initAppsPage();
    initContactInfo();
    initContactForm();
    initReveal();
    initTyped();
    initCounters();
  });
})();
