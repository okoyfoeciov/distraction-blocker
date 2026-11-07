"use strict";

// Keep these in sync with the redirects in rules.json.
const BLOCK_PAGES = [
  { domain: "substack.com", page: "blocked.html" },
  { domain: "facebook.com", page: "blocked-facebook.html" },
  { domain: "voz.vn", page: "blocked-voz.html" },
];

function blockPageForHostname(hostname) {
  const match = BLOCK_PAGES.find(
    ({ domain }) => hostname === domain || hostname.endsWith(`.${domain}`),
  );

  return match ? match.page : null;
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
