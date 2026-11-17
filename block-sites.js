"use strict";

// Keep these in sync with the redirects in rules.json and background.js.
const BLOCK_PAGES = [
  { domain: "substack.com", page: "blocked.html", hours: SUBSTACK_HOURS },
  { domain: "facebook.com", page: "blocked-facebook.html" },
  { domain: "voz.vn", page: "blocked-voz.html" },
];

function blockPageForHostname(hostname, date = new Date()) {
  const match = BLOCK_PAGES.find(
    ({ domain }) => hostname === domain || hostname.endsWith(`.${domain}`),
  );

  if (!match) return null;
  if (match.hours && !isWithinBlockWindow(match.hours, date)) return null;

  return match.page;
}

function redirectToBlockPage() {
  const page = blockPageForHostname(location.hostname);

  if (page) {
    if (document.documentElement) {
      document.documentElement.style.visibility = "hidden";
    }

    location.replace(chrome.runtime.getURL(page));
  }
}

redirectToBlockPage();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    redirectToBlockPage();
  }
});
