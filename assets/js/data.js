/* ==========================================================
   Bitloop Lab — site content
   Edit this file to update contact details and the app list.
   Every page reads from here, so you only change things once.
   ========================================================== */

window.SITE = {
  name: "Bitloop Lab",
  domain: "bitlooplab.co.in",
  tagline: "Android apps & websites people come back to.",
  email: "contact@bitlooplab.co.in", // TODO: make sure this mailbox exists (or change it)
  phone: "",                       // e.g. "+91 98765 43210" (leave empty to hide)
  location: "India",
  timeZone: "Asia/Kolkata",        // drives the live studio clock in the header and footer
  timeZoneLabel: "IST",
  playStoreDeveloperUrl: "",       // e.g. "https://play.google.com/store/apps/dev?id=..." (leave empty to hide)
  social: {
    github: "https://github.com/aniket-ghadshi1",
    linkedin: "",
    instagram: "",
    twitter: ""
  }
};

/* Apps / projects shown on the Work page and the home page.
   category:      "android" | "web"
   tone:          poster colour for the app (any CSS colour). Text colour is picked automatically.
   playStore /
   website:       leave "" if not live yet ("Coming soon" is shown)
   privacyPolicy: link to the app's own policy (e.g. your sites.google.com page);
                  it appears on the app's tile and on privacy.html
   featured:      true to show it on the home page
   Each app also gets a unique "loop signature" drawing generated from its name.
   These are starter examples — replace them with your real apps. */
window.APPS = [
  {
    name: "Loop Notes",
    category: "android",
    tone: "#ff4f1f",
    description: "A fast, offline-first notes app with folders, reminders and dark mode.",
    status: "In development",
    playStore: "",
    website: "",
    privacyPolicy: "",
    featured: true
  },
  {
    name: "Bit Habit",
    category: "android",
    tone: "#c4d0bf",
    description: "Build better habits with daily streaks, gentle nudges and progress charts.",
    status: "In development",
    playStore: "",
    website: "",
    privacyPolicy: "",
    featured: true
  },
  {
    name: "Quick Calc Pro",
    category: "android",
    tone: "#1f2a44",
    description: "A clean calculator with unit conversion, history and EMI tools.",
    status: "In development",
    playStore: "",
    website: "",
    privacyPolicy: "",
    featured: false
  },
  {
    name: "Bitloop Lab Website",
    category: "web",
    tone: "#0f0f0d",
    description: "Our own studio website — the one you're looking at.",
    status: "Live",
    playStore: "",
    website: "index.html",
    privacyPolicy: "privacy.html",
    featured: true
  },
  {
    name: "Shop Starter",
    category: "web",
    tone: "#e6c34a",
    description: "A lightweight storefront template with product catalogue and WhatsApp ordering.",
    status: "In development",
    playStore: "",
    website: "",
    privacyPolicy: "",
    featured: false
  },
  {
    name: "Word Loop",
    category: "android",
    tone: "#d8cab5",
    description: "A relaxing daily word puzzle game with hints and offline play.",
    status: "In development",
    playStore: "",
    website: "",
    privacyPolicy: "",
    featured: false
  }
];
