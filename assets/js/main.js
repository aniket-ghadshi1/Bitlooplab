/* ==========================================================
   Bitloop Lab — site engine
   - Shared chrome (header, menu, footer) rendered from data.js
   - Page content (work list, tiles, contact, privacy TOC)
   - Motion system (GSAP + ScrollTrigger + Flip), progressive:
     without GSAP or with reduced motion, everything stays visible.
   Motion language: reveals use expo.out over ~1.1s with small
   staggers; curtains and layout moves use expo.inOut.
   ========================================================== */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const APPS = window.APPS || [];
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gsap = window.gsap;
  const MOTION = !!gsap && !!window.ScrollTrigger && !REDUCED;
  const EASE = "expo.out";
  const EASE_IO = "expo.inOut";

  const NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "services", label: "Services", href: "services.html" },
    { id: "apps", label: "Work", href: "apps.html" },
    { id: "contact", label: "Contact", href: "contact.html" }
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const pad = (n) => String(n).padStart(2, "0");
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };

  if (!MOTION) root.classList.remove("motion", "is-loading", "is-arriving");

  /* ======================================================
     Graphics: logo, service glyphs, app signatures
     ====================================================== */
  const LOGO =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 16c-2.6-3.6-4.6-5.2-7.2-5.2a5.2 5.2 0 0 0 0 10.4c2.6 0 4.6-1.6 7.2-5.2s4.6-5.2 7.2-5.2a5.2 5.2 0 0 1 0 10.4c-2.6 0-4.6-1.6-7.2-5.2z" fill="none" stroke="currentColor" stroke-width="2"/><rect x="25.6" y="8.4" width="3.2" height="3.2" fill="currentColor"/></svg>';

  const GLYPHS = {
    android:
      '<rect x="40" y="14" width="40" height="88" rx="7"/><line x1="54" y1="94" x2="66" y2="94"/><line x1="40" y1="26" x2="80" y2="26"/><path d="M22 66a38 38 0 0 1 8-36"/><path d="M98 54a38 38 0 0 1-8 36"/><rect x="50" y="38" width="20" height="12"/><line x1="50" y1="60" x2="70" y2="60"/><line x1="50" y1="68" x2="64" y2="68"/>',
    web:
      '<rect x="10" y="22" width="100" height="76" rx="3"/><line x1="10" y1="36" x2="110" y2="36"/><circle cx="19" cy="29" r="2"/><circle cx="27" cy="29" r="2"/><rect x="20" y="46" width="34" height="40"/><line x1="64" y1="48" x2="100" y2="48"/><line x1="64" y1="58" x2="94" y2="58"/><line x1="64" y1="68" x2="100" y2="68"/><line x1="64" y1="78" x2="84" y2="78"/>',
    design:
      '<rect x="12" y="12" width="96" height="96"/><path d="M22 94C40 20 82 102 98 26"/><line x1="22" y1="94" x2="44" y2="30"/><line x1="98" y1="26" x2="78" y2="92"/><circle cx="22" cy="94" r="3"/><circle cx="98" cy="26" r="3"/><circle cx="44" cy="30" r="2"/><circle cx="78" cy="92" r="2"/>',
    support:
      '<path d="M30 60a30 30 0 1 1 9 21.2"/><polyline points="25 70 39 81 44 66"/><line x1="60" y1="16" x2="60" y2="24"/><line x1="60" y1="96" x2="60" y2="104"/><line x1="16" y1="60" x2="24" y2="60"/><line x1="96" y1="60" x2="104" y2="60"/><rect x="55" y="55" width="10" height="10"/>'
  };

  function glyph(key) {
    const body = (GLYPHS[key] || "").replace(/<(path|rect|circle|line|polyline)/g, '<$1 pathLength="1"');
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${body}</svg>`;
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Every app gets a Lissajous "loop signature" derived from its name.
  function signature(name) {
    const h = hash(name);
    const pairs = [[1, 2], [2, 3], [3, 4], [3, 2], [1, 3], [4, 5], [5, 4], [2, 5], [3, 5]];
    const [a, b] = pairs[h % pairs.length];
    const delta = (((h >>> 8) % 100) / 100) * Math.PI;
    const steps = 260;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = 50 + 44 * Math.sin(a * t + delta);
      const y = 50 + 44 * Math.sin(b * t);
      d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
    }
    const k = ((h >>> 16) % steps) / steps * Math.PI * 2;
    const cx = 50 + 44 * Math.sin(a * k + delta);
    const cy = 50 + 44 * Math.sin(b * k);
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><path pathLength="1" d="${d}"/><circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="2.6"/></svg>`;
  }

  function onColor(tone) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(tone).trim());
    if (!m) return "var(--paper)";
    const n = parseInt(m[1], 16);
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
    return L > 0.36 ? "var(--ink)" : "var(--paper)";
  }

  function poster(app, i) {
    return `<div class="poster" style="--tone:${esc(app.tone || "#0f0f0d")};--on:${onColor(app.tone || "#0f0f0d")}">
      <div class="poster__top mono"><span>N°${pad(i + 1)}</span><span>${app.category === "web" ? "Web" : "Android"}</span></div>
      <div class="poster__sig">${signature(app.name)}</div>
      <div class="poster__name">${esc(app.name)}</div>
    </div>`;
  }

  /* ======================================================
     Chrome: header, menu, footer, cursor
     ====================================================== */
  function rollLink(n, cls = "") {
    const current = n.id === page ? ' aria-current="page"' : "";
    return `<a class="roll ${cls}" href="${n.href}"${current}><span data-text="${esc(n.label)}">${esc(n.label)}</span></a>`;
  }

  function renderChrome() {
    const header = $("#site-header");
    if (header) {
      header.outerHTML = `
        <a class="skip-link" href="#main">Skip to content</a>
        <div class="progress" aria-hidden="true"></div>
        <header class="site-header" id="header">
          <a class="brand" href="index.html" aria-label="${esc(SITE.name)}, home">${LOGO}<span><b>Bitloop</b> <i>Lab</i></span></a>
          <div class="clock mono" title="Studio local time"><span class="pulse" aria-hidden="true"></span><span data-clock>${esc(SITE.timeZoneLabel || "")} --:--</span></div>
          <nav class="nav-wrap" aria-label="Main"><ul class="nav">${NAV.map((n) => `<li>${rollLink(n)}</li>`).join("")}</ul></nav>
          <button class="menu-btn mono" id="menuBtn" aria-expanded="false" aria-controls="menu"><span>Menu</span><span class="bars" aria-hidden="true"></span></button>
        </header>
        <div class="menu" id="menu" inert>
          <nav aria-label="Mobile"><ol>${NAV.map((n, i) => `<li><a href="${n.href}"${n.id === page ? ' aria-current="page"' : ""}><span class="mono">${pad(i + 1)}</span>${esc(n.label)}</a></li>`).join("")}</ol></nav>
          <div class="menu__foot mono"><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a><span data-clock></span></div>
        </div>`;
    }

    const footer = $("#site-footer");
    if (footer) {
      const social = Object.entries(SITE.social || {})
        .filter(([, url]) => url)
        .map(([name, url]) => `<li>${extRoll(url, name[0].toUpperCase() + name.slice(1))}</li>`);
      if (SITE.playStoreDeveloperUrl) social.push(`<li>${extRoll(SITE.playStoreDeveloperUrl, "Google Play")}</li>`);
      footer.outerHTML = `
        <footer class="site-footer">
          <div class="footer-top">
            <div class="footer-intro">
              <p>An independent studio designing and building Android apps &amp; websites${SITE.location ? ` from ${esc(SITE.location)}` : ""}.</p>
              <div class="clock mono"><span class="pulse" aria-hidden="true"></span><span data-clock></span><span>— studio time</span></div>
            </div>
            <div class="footer-col"><h4 class="mono">Pages</h4><ul>${NAV.map((n) => `<li>${rollLink(n)}</li>`).join("")}</ul></div>
            <div class="footer-col"><h4 class="mono">Contact</h4><ul>
              ${SITE.email ? `<li><a class="u" href="mailto:${esc(SITE.email)}">Email us</a></li>` : ""}
              ${SITE.phone ? `<li><a class="u" href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a></li>` : ""}
              <li>${rollLink({ id: "", label: "Start a project", href: "contact.html" })}</li>
            </ul></div>
            <div class="footer-col"><h4 class="mono">Elsewhere</h4><ul>${social.join("") || "<li>—</li>"}</ul></div>
            <div class="footer-col"><h4 class="mono">Legal</h4><ul>
              <li>${rollLink({ id: "privacy", label: "Privacy Policy", href: "privacy.html" })}</li>
              <li><a class="roll" href="app-ads.txt"><span data-text="app-ads.txt">app-ads.txt</span></a></li>
            </ul></div>
          </div>
          <div class="footer-mark" aria-hidden="true">
            <svg viewBox="0 0 1000 158"><text x="0" y="146" font-size="182" textLength="1000" lengthAdjust="spacingAndGlyphs">BITLOOP LAB<tspan class="dot">.</tspan></text></svg>
          </div>
          <div class="footer-bottom mono">
            <span>&copy; ${new Date().getFullYear()} ${esc(SITE.name)}</span>
            <span>${esc(SITE.domain || "")}</span>
            <a href="#main" data-top>Back to top ↑</a>
          </div>
        </footer>`;
    }

    if (FINE && !REDUCED) {
      const c = document.createElement("div");
      c.className = "cursor";
      c.setAttribute("aria-hidden", "true");
      c.innerHTML = "<span></span>";
      document.body.appendChild(c);
    }
  }

  function extRoll(url, label) {
    return `<a class="roll" href="${esc(url)}" target="_blank" rel="noopener"><span data-text="${esc(label)} ↗">${esc(label)} ↗</span></a>`;
  }

  function initClock() {
    const els = $$("[data-clock]");
    if (!els.length) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { timeZone: SITE.timeZone || "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (e) { return; }
    const tick = () => {
      const t = `${SITE.timeZoneLabel || ""} ${fmt.format(new Date())}`.trim();
      els.forEach((el) => { el.textContent = t; });
    };
    tick();
    setInterval(tick, 15000);
  }

  function initMenu() {
    const btn = $("#menuBtn");
    const menu = $("#menu");
    if (!btn || !menu) return;
    const set = (open) => {
      root.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.firstElementChild.textContent = open ? "Close" : "Menu";
      if (open) { menu.removeAttribute("inert"); setTimeout(() => { const a = $("a", menu); a && a.focus({ preventScroll: true }); }, 300); }
      else menu.setAttribute("inert", "");
    };
    btn.addEventListener("click", () => set(!root.classList.contains("menu-open")));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("menu-open")) { set(false); btn.focus(); }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) set(false); });
  }

  function initScrollChrome() {
    const header = $("#header");
    const bar = $(".progress");
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      if (header && !root.classList.contains("menu-open")) {
        if (y > 160 && y > last + 4) header.classList.add("is-hidden");
        else if (y < last - 4 || y < 160) header.classList.remove("is-hidden");
      }
      last = y;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    header && header.addEventListener("focusin", () => header.classList.remove("is-hidden"));

    $$("[data-top]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
        const main = $("#main");
        main && main.focus({ preventScroll: true });
      })
    );
  }

  /* ======================================================
     Page content
     ====================================================== */
  function injectGlyphs() {
    $$("[data-glyph]").forEach((el) => { el.innerHTML = glyph(el.dataset.glyph); });
  }

  function renderFeaturedWork() {
    const list = $("#workList");
    if (!list) return;
    const featured = APPS.map((a, i) => ({ a, i })).filter((x) => x.a.featured).slice(0, 4);
    list.innerHTML = featured.map(({ a, i }, k) => `
      <li><a class="work-row" href="apps.html#app-${slug(a.name)}" data-index="${k}" data-cursor="View">
        <span class="mono muted">${pad(k + 1)}</span>
        <span class="work-row__name">${esc(a.name)}</span>
        <span class="work-row__thumb" aria-hidden="true">${poster(a, i)}</span>
        <span class="mono work-row__cat">${a.category === "web" ? "Website" : "Android app"}</span>
        <span class="mono work-row__status muted">${esc(a.status)}</span>
        <span class="arr" aria-hidden="true">↗</span>
      </a></li>`).join("");
    const count = $("#workCount");
    if (count) count.textContent = pad(APPS.length);

    const preview = $("#workPreview");
    if (preview) {
      preview.innerHTML = `<div class="work-preview__stack">${featured
        .map(({ a, i }, k) => `<div style="position:absolute;inset:0;transform:translateY(${k * 100}%)">${poster(a, i)}</div>`)
        .join("")}</div>`;
    }
  }

  function appActions(app) {
    const links = [];
    if (app.playStore) links.push(`<a class="u" href="${esc(app.playStore)}" target="_blank" rel="noopener">Google Play ↗</a>`);
    if (app.website) {
      const ext = /^https?:/.test(app.website);
      links.push(`<a class="u" href="${esc(app.website)}"${ext ? ' target="_blank" rel="noopener"' : ""}>Visit${ext ? " ↗" : ""}</a>`);
    }
    if (!links.length) links.push('<span class="soon">Coming soon</span>');
    if (app.privacyPolicy) {
      const ext = /^https?:/.test(app.privacyPolicy);
      links.push(`<a class="u" href="${esc(app.privacyPolicy)}"${ext ? ' target="_blank" rel="noopener"' : ""}>Privacy policy</a>`);
    }
    return links.join("");
  }

  function initWorkPage() {
    const grid = $("#tiles");
    if (!grid) return;
    grid.innerHTML = APPS.map((a, i) => `
      <article class="tile" id="app-${slug(a.name)}" data-cat="${a.category === "web" ? "web" : "android"}" data-text="${esc((a.name + " " + a.description).toLowerCase())}">
        <div class="tile__media" data-reveal="clip">${poster(a, i)}</div>
        <div class="tile__meta">
          <h3>${esc(a.name)}</h3>
          <span class="mono muted">${esc(a.status)}</span>
          <p>${esc(a.description)}</p>
          <div class="tile__actions">${appActions(a)}</div>
        </div>
      </article>`).join("") + '<p class="empty" hidden>Nothing matches that search — yet.</p>';

    const tiles = $$(".tile", grid);
    const empty = $(".empty", grid);
    const buttons = $$(".filter");
    const search = $("#appSearch");
    const counts = { all: APPS.length, android: APPS.filter((a) => a.category !== "web").length, web: APPS.filter((a) => a.category === "web").length };
    buttons.forEach((b) => { const s = $("sup", b); if (s) s.textContent = pad(counts[b.dataset.filter] || 0); });
    const total = $("#appTotal");
    if (total) total.textContent = `(${pad(APPS.length)})`;
    let filter = "all";

    const cols = () => (window.innerWidth <= 640 ? 1 : window.innerWidth <= 1100 ? 2 : 3);
    const offsets = () => {
      const c = cols();
      tiles.filter((t) => !t.hidden).forEach((t, k) => t.classList.toggle("is-offset", c > 1 && k % c === 1));
    };

    function apply(animate) {
      const q = ((search && search.value) || "").trim().toLowerCase();
      const state = animate && MOTION && window.Flip ? window.Flip.getState(tiles) : null;
      tiles.forEach((t) => { t.hidden = !((filter === "all" || t.dataset.cat === filter) && (!q || t.dataset.text.includes(q))); });
      empty.hidden = tiles.some((t) => !t.hidden);
      offsets();
      if (state) {
        window.Flip.from(state, {
          duration: 0.8, ease: EASE_IO, stagger: 0.03, absolute: true, nested: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: EASE }),
          onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
          onComplete: () => window.ScrollTrigger && window.ScrollTrigger.refresh()
        });
      } else if (MOTION) {
        window.ScrollTrigger.refresh();
      }
    }

    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        filter = btn.dataset.filter;
        apply(true);
      })
    );
    let t;
    search && search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => apply(true), 120); });
    let rw;
    window.addEventListener("resize", () => { clearTimeout(rw); rw = setTimeout(offsets, 150); });
    apply(false);

    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) setTimeout(() => target.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" }), 700);
    }
  }

  function initContact() {
    $$("[data-email]").forEach((el) => {
      el.textContent = SITE.email;
      if (el.tagName === "A") el.href = `mailto:${SITE.email}`;
    });

    const copy = $("#copyEmail");
    copy && copy.addEventListener("click", async () => {
      const label = $("span", copy);
      try {
        await navigator.clipboard.writeText(SITE.email);
        label.textContent = "Copied";
      } catch (e) {
        label.textContent = "Press Ctrl+C";
        const sel = window.getSelection(); const r = document.createRange();
        r.selectNodeContents($(".hello__mail a.big")); sel.removeAllRanges(); sel.addRange(r);
      }
      setTimeout(() => { label.textContent = "Copy address"; }, 2200);
    });

    const phone = $("#phoneFact");
    if (phone) {
      if (SITE.phone) phone.querySelector("strong").innerHTML = `<a class="u" href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a>`;
      else phone.remove();
    }

    const form = $("#contactForm");
    if (!form) return;
    const status = $("#formStatus");
    const preset = new URLSearchParams(location.search).get("service");
    if (preset && form.service && Array.from(form.service.options).some((o) => o.value === preset)) form.service.value = preset;

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
      service: (v) => (v ? "" : "Please choose a service."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email."),
      message: (v) => (v.trim().length >= 10 ? "" : "Tell us a little more (at least 10 characters).")
    };
    const check = (name) => {
      const input = form.elements[name];
      const msg = rules[name](input.value);
      const box = input.closest(".blank, .field");
      box.classList.toggle("invalid", !!msg);
      box.querySelector(".error").textContent = msg;
      input.setAttribute("aria-invalid", String(!!msg));
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => check(name));
      input.addEventListener(input.tagName === "SELECT" ? "change" : "input", () => {
        if (input.closest(".blank, .field").classList.contains("invalid")) check(name);
      });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { const bad = $("[aria-invalid='true']", form); bad && bad.focus(); return; }
      const d = Object.fromEntries(new FormData(form).entries());
      const subject = `New project enquiry: ${d.service} — ${d.name}`;
      const body = [`Name: ${d.name}`, `Email: ${d.email}`, `Service: ${d.service}`, `Budget: ${d.budget || "Not specified"}`, "", d.message].join("\n");
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = `Thanks, ${d.name.split(" ")[0]}. Your email app should open with the message ready to send. If it doesn't, write to us at ${SITE.email}.`;
      status.classList.add("show");
      form.reset();
    });
  }

  function initPrivacy() {
    const list = $("#appPolicies");
    if (list) {
      const apps = APPS.filter((a) => /^https?:/.test(a.privacyPolicy || ""));
      list.innerHTML = apps.length
        ? apps.map((a) => `<li><a href="${esc(a.privacyPolicy)}" target="_blank" rel="noopener">${esc(a.name)} — Privacy Policy</a></li>`).join("")
        : "<li>App-specific policies are linked from each app's Google Play listing.</li>";
    }
    $$(".js-email").forEach((el) => { el.innerHTML = `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`; });

    const toc = $("#toc");
    const heads = $$(".legal h2");
    if (!toc || !heads.length) return;
    toc.innerHTML = heads.map((h, i) => {
      h.id = h.id || "s-" + slug(h.textContent);
      return `<li><a href="#${h.id}">${pad(i + 1)} ${esc(h.textContent.replace(/^\s*\d+\.\s*/, ""))}</a></li>`;
    }).join("");
    const links = $$("a", toc);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      heads.forEach((h) => io.observe(h));
    }
  }

  /* ======================================================
     The bit loop — a particle lemniscate in 3D that leans
     toward the pointer and parts around it.
     ====================================================== */
  function bitLoop(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { start() {} };
    const INK = "#0f0f0d";
    const SIG = "#ff4f1f";
    let w = 0, h = 0, dpr = 1, parts = [], raf = 0, visible = true, introAt = null;
    const t0 = performance.now();
    const ptr = { x: -1e4, y: -1e4, nx: 0, ny: 0, sx: 0, sy: 0 };
    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

    function build() {
      const n = Math.round(Math.min(1300, Math.max(420, (w * h) / 750)));
      parts = Array.from({ length: n }, () => ({
        u: Math.random() * Math.PI * 2,
        oy: gauss() * (Math.random() < 0.85 ? 0.022 : 0.08),
        oz: gauss() * 0.045,
        sp: 0.05 + Math.random() * 0.07,
        s: Math.random() < 0.06 ? 3.4 : 1 + Math.random() * 1.6,
        sig: Math.random() < 0.045,
        fx: Math.random(), fy: Math.random(),
        delay: Math.random() * 0.35,
        dx: 0, dy: 0
      }));
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!parts.length) build();
    }
    const easeOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

    function draw(now) {
      const t = (now - t0) / 1000;
      const k = introAt == null ? 0 : (now - introAt) / 2000;
      ptr.sx += (ptr.nx - ptr.sx) * 0.05;
      ptr.sy += (ptr.ny - ptr.sy) * 0.05;
      const ry = Math.sin(t * 0.22) * 0.32 + ptr.sx * 0.42;
      const rx = 0.18 + Math.sin(t * 0.17) * 0.1 + ptr.sy * 0.3;
      const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);
      const scale = Math.min(w * 0.4, h * 1.05);
      const cx = w * 0.5, cy = h * (w > 700 ? 0.44 : 0.5);
      const R = Math.min(w, h) * 0.16, R2 = R * R;

      ctx.clearRect(0, 0, w, h);
      let sigs = [];
      ctx.fillStyle = INK;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const u = p.u + t * p.sp;
        const s = Math.sin(u), c = Math.cos(u), d = 1 + s * s;
        const X = c / d;
        const Y = ((s * c) / d) * 1.3 + p.oy;
        const Z = p.oz + Math.sin(u * 2) * 0.22;
        const x1 = X * cy_ + Z * sy_;
        const z1 = -X * sy_ + Z * cy_;
        const y2 = Y * cx_ - z1 * sx_;
        const z2 = Y * sx_ + z1 * cx_;
        const persp = 2.6 / (2.6 + z2);
        let px = cx + x1 * scale * persp;
        let py = cy + y2 * scale * persp;

        // pointer parts the stream
        const ddx = px + p.dx - ptr.x, ddy = py + p.dy - ptr.y;
        const dist2 = ddx * ddx + ddy * ddy;
        if (dist2 < R2) {
          const dist = Math.sqrt(dist2) || 1;
          const f = (1 - dist / R) * 9;
          p.dx += (ddx / dist) * f; p.dy += (ddy / dist) * f;
        }
        p.dx *= 0.9; p.dy *= 0.9;
        px += p.dx; py += p.dy;

        // intro: scattered bits gather into the loop
        const e = easeOut(Math.max(0, Math.min(1, (k - p.delay) / (1 - p.delay))));
        if (e < 1) { px = p.fx * w + (px - p.fx * w) * e; py = p.fy * h + (py - p.fy * h) * e; }

        const size = p.s * persp;
        if (p.sig) { sigs.push(px, py, size + 0.8); continue; }
        ctx.globalAlpha = Math.max(0.12, Math.min(1, (persp - 0.62) * 1.6)) * (0.35 + 0.65 * e);
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = SIG;
      for (let i = 0; i < sigs.length; i += 3) ctx.fillRect(sigs[i] - sigs[i + 2] / 2, sigs[i + 1] - sigs[i + 2] / 2, sigs[i + 2], sigs[i + 2]);
    }

    function loop(now) { draw(now); raf = visible ? requestAnimationFrame(loop) : 0; }
    function setVisible(v) { visible = v; if (v && !raf && !REDUCED) raf = requestAnimationFrame(loop); }

    resize();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (REDUCED) draw(performance.now()); }, 120); });

    if (REDUCED) {
      introAt = -1e9;
      draw(performance.now());
      return { start() {} };
    }

    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      ptr.nx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ny = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { ptr.x = ptr.y = -1e4; });
    if ("IntersectionObserver" in window) new IntersectionObserver((en) => setVisible(en[0].isIntersecting)).observe(canvas);
    document.addEventListener("visibilitychange", () => setVisible(!document.hidden));

    return {
      start() { if (introAt == null) introAt = performance.now(); setVisible(true); }
    };
  }

  /* ======================================================
     Motion
     ====================================================== */
  function split(el, cls) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            if (cls) {
              const s = document.createElement("span"); s.className = cls; s.textContent = part; frag.appendChild(s);
            } else {
              const w = document.createElement("span"); w.className = "w";
              const i = document.createElement("span"); i.className = "wi"; i.textContent = part;
              w.appendChild(i); frag.appendChild(w);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    el.classList.add("is-split");
    return cls ? $$("." + cls, el) : $$(".wi", el);
  }

  function runLoader() {
    const loader = $(".loader");
    if (!root.classList.contains("is-loading") || !loader) return Promise.resolve();
    store.set("bl-seen", "1");
    const count = $(".loader__count", loader);
    const bar = $(".loader__bar", loader);
    const word = $(".loader__word", loader);
    const o = { v: 0 };
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: () => { root.classList.remove("is-loading"); gsap.set(loader, { clearProps: "all" }); } });
      tl.from(word, { yPercent: 40, opacity: 0, duration: 0.9, ease: EASE })
        .to(o, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => { count.textContent = pad(Math.round(o.v)).padStart(3, "0"); } }, 0)
        .to(bar, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
        .fromTo(loader, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: EASE_IO }, "+=0.15")
        .add(resolve, "-=0.55");
    });
  }

  function runArrival() {
    const curtain = $(".curtain");
    store.del("bl-nav");
    if (!root.classList.contains("is-arriving") || !curtain) return Promise.resolve();
    return new Promise((resolve) => {
      gsap.to(curtain, {
        yPercent: -100, duration: 0.9, ease: EASE_IO, delay: 0.05,
        onComplete: () => { root.classList.remove("is-arriving"); gsap.set(curtain, { clearProps: "all" }); }
      });
      setTimeout(resolve, 450);
    });
  }

  function initTransitions() {
    const curtain = $(".curtain");
    if (!curtain) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // same page (incl. hash links)
      e.preventDefault();
      root.classList.remove("menu-open");
      const label = $(".mono", curtain);
      const nav = NAV.find((n) => url.pathname.endsWith("/" + n.href)) || (url.pathname.endsWith("/") ? NAV[0] : null);
      if (label) label.textContent = nav ? `→ ${nav.label}` : "→";
      store.set("bl-nav", "1");
      gsap.fromTo(curtain, { yPercent: 100, visibility: "visible" }, {
        yPercent: 0, duration: 0.75, ease: EASE_IO,
        onComplete: () => { window.location.href = url.href; }
      });
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) { root.classList.remove("is-arriving", "menu-open"); gsap.set(curtain, { clearProps: "all" }); }
    });
  }

  function intro(loop) {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    const heroLines = $$(".hero__title .line > span, .hello__title .line > span");
    if (heroLines.length) tl.to(heroLines, { y: 0, duration: 1.3, stagger: 0.09 }, 0);
    const canvas = $(".hero__canvas");
    if (canvas) {
      tl.to(canvas, { opacity: 1, duration: 1.2 }, 0.1);
      tl.add(() => loop && loop.start(), 0.1);
    }
    const introSplits = $$('[data-split="intro"]');
    introSplits.forEach((el, i) => tl.to(split(el), { y: 0, duration: 1.2, stagger: 0.05 }, 0.05 + i * 0.1));
    const fades = $$(".hero__aside > *, .hero__meta > *, [data-reveal='intro']");
    if (fades.length) tl.to(fades, { opacity: 1, y: 0, duration: 1, stagger: 0.06 }, 0.5);
    return tl;
  }

  function scrollMotion() {
    const ST = window.ScrollTrigger;

    // word-mask reveals
    $$('[data-split]:not([data-split="intro"])').forEach((el) => {
      const words = split(el);
      gsap.to(words, { y: 0, duration: 1.1, ease: EASE, stagger: 0.035, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });

    // big two-line call-to-action headlines
    $$(".cta__title").forEach((el) => {
      gsap.to($$(".line > span", el), { y: 0, duration: 1.3, ease: EASE, stagger: 0.12, scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    });

    // simple fades
    ST.batch("[data-reveal='']", {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08 })
    });
    $$("[data-reveal]:not([data-reveal='']):not([data-reveal='clip']):not([data-reveal='intro'])").forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    // clip reveals (posters, media)
    ST.batch("[data-reveal='clip']", {
      start: "top 88%", once: true,
      onEnter: (els) => gsap.to(els, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: EASE_IO, stagger: 0.1 })
    });

    // service glyphs draw themselves (horizontal ones are handled with the pin)
    $$(".glyph").filter((g) => !g.closest(".svc-h")).forEach((g) => {
      gsap.to($$("[pathLength]", g), { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.08, scrollTrigger: { trigger: g, start: "top 85%", once: true } });
    });

    // manifesto: words light up as you read
    $$("[data-scrub]").forEach((el) => {
      const words = split(el, "sw");
      gsap.fromTo(words, { opacity: 0.14 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 50%", scrub: true } });
    });

    // counters
    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const o = { v: 0 };
      el.textContent = "0" + suffix;
      gsap.to(o, { v: target, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } });
    });

    // paper → ink: the dark panel opens up as it arrives
    $$("[data-ink-reveal]").forEach((panel) => {
      gsap.fromTo(panel, { clipPath: "inset(7% 5% 0% 5%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "top top", scrub: true } });
    });

    // parallax
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(el, { yPercent: amt * 100 }, { yPercent: -amt * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // hero exits: title drifts up, loop sinks back
    const hero = $(".hero");
    if (hero && $(".hero__body")) {
      gsap.to(".hero__body", { yPercent: -18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__canvas", { yPercent: 14, scale: 0.92, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }

    // footer wordmark rises
    const mark = $(".footer-mark svg");
    if (mark) gsap.fromTo(mark, { yPercent: 70 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true } });

    servicesHorizontal();
    processStory();
    marquee();
  }

  function servicesHorizontal() {
    const sec = $(".svc-h");
    if (!sec) return;
    const track = $(".svc-h__track", sec);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: sec, pin: true, start: "top top", end: () => "+=" + dist(), scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$(".svc-card", sec).forEach((card) => {
        gsap.to($$("[pathLength]", card), {
          strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.06,
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 85%", once: true }
        });
      });
    });
    mm.add("(max-width: 900px)", () => {
      $$(".svc-card", sec).forEach((card) => {
        gsap.to($$("[pathLength]", card), { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.06, scrollTrigger: { trigger: card, start: "top 80%", once: true } });
      });
    });
  }

  function processStory() {
    const steps = $$(".step");
    if (!steps.length) return;
    const col = $(".odometer__col");
    const fill = $(".odometer__fill");
    const name = $("#odoName");
    steps.forEach((step, i) => {
      window.ScrollTrigger.create({
        trigger: step, start: "top 60%", end: "bottom 60%",
        onToggle: (self) => {
          if (!self.isActive) return;
          steps.forEach((s) => s.classList.toggle("is-active", s === step));
          if (col) col.style.transform = `translateY(${-i}em)`;
          if (name) name.textContent = $("h3", step).textContent;
        }
      });
    });
    steps[0].classList.add("is-active");
    if (fill) gsap.to(fill, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".process__steps", start: "top 60%", end: "bottom 60%", scrub: true } });
  }

  function marquee() {
    $$(".marquee").forEach((m) => {
      const inner = $(".marquee__inner", m);
      const group = $(".marquee__group", m);
      if (!inner || !group) return;
      inner.appendChild(group.cloneNode(true)).setAttribute("aria-hidden", "true");
      let x = 0, boost = 0, dir = -1;
      window.ScrollTrigger.create({
        trigger: m, start: "top bottom", end: "bottom top",
        onUpdate: (self) => { boost = Math.min(Math.abs(self.getVelocity()) / 120, 14); dir = self.direction === 1 ? -1 : 1; }
      });
      gsap.ticker.add((time, dt) => {
        const wGroup = group.offsetWidth;
        if (!wGroup) return;
        boost *= 0.94;
        x += dir * (0.6 + boost) * (dt / 16.67);
        if (x <= -wGroup) x += wGroup;
        if (x > 0) x -= wGroup;
        inner.style.transform = `translate3d(${x}px,0,0)`;
      });
    });
  }

  function microInteractions() {
    if (!FINE) return;

    // custom cursor: follows, and labels the things you can open
    const cursor = $(".cursor");
    if (cursor) {
      const label = $("span", cursor);
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
      window.addEventListener("pointermove", (e) => { cursor.classList.add("is-visible"); xTo(e.clientX); yTo(e.clientY); }, { passive: true });
      document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
      document.addEventListener("pointerover", (e) => {
        const lab = e.target.closest("[data-cursor]");
        const link = e.target.closest("a, button, summary, select, label");
        cursor.classList.toggle("is-label", !!lab);
        cursor.classList.toggle("is-link", !lab && !!link);
        if (lab) label.textContent = lab.dataset.cursor;
      });
    }

    // magnetic: only on the few primary calls to action
    $$("[data-magnetic]").forEach((el) => {
      const inner = el.firstElementChild;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.35); yTo(dy * 0.35);
        if (inner) gsap.to(inner, { x: dx * 0.15, y: dy * 0.15, duration: 0.6, ease: "power3" });
      });
      el.addEventListener("pointerleave", () => {
        xTo(0); yTo(0);
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      });
    });

    // work list: a poster follows the pointer and flips between projects
    const preview = $("#workPreview");
    const list = $("#workList");
    if (preview && list) {
      const stack = $(".work-preview__stack", preview);
      const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3" });
      const rTo = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3" });
      let lastX = 0;
      gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
      list.addEventListener("pointermove", (e) => {
        xTo(e.clientX); yTo(e.clientY);
        rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.6)));
        lastX = e.clientX;
      });
      $$(".work-row", list).forEach((row) => {
        row.addEventListener("pointerenter", () => {
          gsap.to(stack, { yPercent: -100 * Number(row.dataset.index), duration: 0.8, ease: EASE_IO });
          gsap.to(preview, { scale: 1, autoAlpha: 1, duration: 0.6, ease: EASE });
        });
      });
      list.addEventListener("pointerleave", () => gsap.to(preview, { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: EASE }));
    }

    // tiles lean toward the pointer
    $$(".tile__media").forEach((m) => {
      const p = $(".poster", m);
      const rx = gsap.quickTo(p, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(p, "rotationY", { duration: 0.6, ease: "power3" });
      m.addEventListener("pointermove", (e) => {
        const r = m.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 12);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      m.addEventListener("pointerleave", () => { rx(0); ry(0); });
      m.addEventListener("pointerenter", () => gsap.fromTo($(".poster__sig path", m), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }));
    });
  }

  function staticFallback(loop) {
    $$(".step").forEach((s) => s.classList.add("is-active"));
    if (loop) loop.start();
  }

  /* ======================================================
     Boot
     ====================================================== */
  renderChrome();
  initClock();
  initMenu();
  initScrollChrome();
  injectGlyphs();
  renderFeaturedWork();
  initWorkPage();
  initContact();
  initPrivacy();

  const canvas = $(".hero__canvas canvas");
  const loop = canvas ? bitLoop(canvas) : null;

  if (!MOTION) {
    staticFallback(loop);
    return;
  }

  gsap.registerPlugin(window.ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(window.Flip);
  root.classList.add("motion-ok");

  initTransitions();
  scrollMotion();
  microInteractions();

  runLoader()
    .then(runArrival)
    .then(() => intro(loop));

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => window.ScrollTrigger.refresh());
  window.addEventListener("load", () => window.ScrollTrigger.refresh());
})();
