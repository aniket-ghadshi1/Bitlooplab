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
   tagline:       a few words on what it does
   packageName:   Android package name; the Google Play link is built from it
   website:       full URL for websites (or an app's own site)
   tone:          poster colour for the project (any hex colour). Text colour is picked automatically.
   privacyPolicy: link to the app's own policy (e.g. your sites.google.com page);
                  it appears on the app's tile and on privacy.html
   featured:      true to show it on the home page (up to 4)
   Each project also gets a unique "loop signature" drawing generated from its name. */
window.APPS = [
  {
    name: "ZeroSnap",
    category: "android",
    tagline: "Auto-delete photos",
    tone: "#ff4f1f",
    description: "Automatically deletes the photos you don't need to keep, so your gallery and storage stay clutter-free.",
    status: "On Google Play",
    packageName: "com.snaptrash.app",
    website: "",
    privacyPolicy: "",
    featured: true
  },
  {
    name: "LinkNook",
    category: "android",
    tagline: "Auto-sort bookmarks",
    tone: "#c4d0bf",
    description: "Save links from anywhere and LinkNook sorts your bookmarks automatically, so you can find them again without the mess.",
    status: "On Google Play",
    packageName: "com.linknook.app",
    website: "",
    privacyPolicy: "",
    featured: true
  },
  {
    name: "IndiBill",
    category: "android",
    tagline: "GST bills & UPI QR",
    tone: "#1f2a44",
    description: "Make GST bills and UPI payment QR codes right from your phone — simple billing for Indian shops and small businesses.",
    status: "On Google Play",
    packageName: "com.indibill",
    website: "",
    privacyPolicy: "",
    featured: true
  },
  {
    name: "Namnamah",
    category: "web",
    tagline: "Clothing store",
    tone: "#d8cab5",
    description: "An online clothing store, designed and built by Bitloop Lab.",
    status: "Live",
    packageName: "",
    website: "https://namnamah.com",
    privacyPolicy: "",
    featured: true
  }
];
