/* ==========================================================
   Bitloop Lab — site content
   Edit this file to update contact details and the app list.
   Every page reads from here, so you only change things once.
   ========================================================== */

window.SITE = {
  name: "Bitloop Lab",
  tagline: "Android apps & websites, crafted with care.",
  email: "contact@bitlooplab.com", // TODO: replace with your real email
  phone: "",                       // e.g. "+91 98765 43210" (leave empty to hide)
  location: "India",
  playStoreDeveloperUrl: "",       // e.g. "https://play.google.com/store/apps/dev?id=..." (leave empty to hide)
  social: {
    github: "https://github.com/aniket-ghadshi1",
    linkedin: "",
    instagram: "",
    twitter: ""
  }
};

/* Words cycled in the home page headline */
window.TYPED_WORDS = ["Android Apps", "Websites", "Web Apps", "Digital Products"];

/* Apps / projects shown on the Apps page and the home page.
   category: "android" | "web"
   playStore / website: leave "" if not live yet ("Coming soon" is shown)
   privacyPolicy: link to the app's own policy (e.g. your sites.google.com page);
                  it appears on the app card and on privacy.html
   featured: true to show it on the home page
   These are starter examples — replace them with your real apps. */
window.APPS = [
  {
    name: "Loop Notes",
    category: "android",
    icon: "📝",
    color: "linear-gradient(135deg,#6c5cff,#9a8cff)",
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
    icon: "✅",
    color: "linear-gradient(135deg,#00c2a8,#4be3c9)",
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
    icon: "🧮",
    color: "linear-gradient(135deg,#ff7a59,#ffb26b)",
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
    icon: "🌐",
    color: "linear-gradient(135deg,#3a7bfd,#6c5cff)",
    description: "Our own fast, responsive company website — the one you're looking at.",
    status: "Live",
    playStore: "",
    website: "index.html",
    privacyPolicy: "privacy.html",
    featured: true
  },
  {
    name: "Shop Starter",
    category: "web",
    icon: "🛒",
    color: "linear-gradient(135deg,#e14eca,#ff7ab6)",
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
    icon: "🔤",
    color: "linear-gradient(135deg,#f5a623,#f8d353)",
    description: "A relaxing daily word puzzle game with hints and offline play.",
    status: "In development",
    playStore: "",
    website: "",
    privacyPolicy: "",
    featured: false
  }
];
