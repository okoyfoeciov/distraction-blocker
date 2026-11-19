# Distraction Blocker

A deliberately minimal Chrome extension for cutting distracting sites out of your browser.

**No popup, no toggle, no badge, no settings. No mercy.**

## What it blocks

- **Substack** — `substack.com` and every subdomain are blocked every day from **10:00 to 05:59 local time** and redirected to a local screen that says **“Substack has been blocked.”** Outside that window, Substack loads normally.
- **Facebook** — `facebook.com` and every subdomain are redirected to a local block screen that says **“Facebook has been blocked.”**
- **voz.vn** — `voz.vn` and every subdomain are redirected to a local block screen that says **“voz.vn has been blocked.”**
- **Hacker News** — `news.ycombinator.com` is blocked every day from **10:00 to 05:59 local time**. Visiting it shows **“Hacker News has been blocked.”**
- **YouTube recommendations** — the entire right-hand column is removed on video watch pages, including recommended videos, playlists, and transcripts.
- **YouTube comments** — the comment section below the video is hidden.
- **YouTube live chat** — live chat messages and the composer are hidden on live streams and premieres. The separate pop-out chat window is fully blanked. In fullscreen, the chat header stays visible so its close button can collapse the chat and let the video fill the screen.

Home pages, search results, subscriptions, and the video player on YouTube are left alone.

## Install

1. Clone or download this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked**.
5. Select the folder containing this README.
6. Open any YouTube video, or try visiting Facebook or voz.vn. Substack and Hacker News are blocked from 10:00 to 05:59.

If a YouTube tab was already open while you installed the extension, refresh that tab once.

## How it works

- `rules.json` contains static `declarativeNetRequest` rules that redirect Facebook and voz.vn navigations to local block screens. The sites themselves never get a chance to render.
- `background.js` mirrors the always-on rules as dynamic rules when the extension starts, so edits take effect as soon as the extension is reloaded. It also maintains dynamic rules for the scheduled sites: Chrome alarms wake at each transition, add or remove rules, and schedule the next transition. Substack and Hacker News both change state at 06:00 and 10:00 local time.
- `schedule.js` defines the local-time block windows shared by the background worker and the cache fallback.
- `block-sites.js` runs at document start on blocked domains and redirects pages that a site's service worker serves from its cache, which network-level rules cannot intercept. It applies the Substack schedule as well.
- `content.css` removes the right-hand sidebar, the comments section, live chat messages, and the chat composer from YouTube, while leaving the chat header's close button reachable in fullscreen.
- `live-chat.css` blanks the standalone pop-out chat window.
- The only scripts that run on the blocked domains are `schedule.js` and `block-sites.js`, which check the hostname and clock. No page content is read.

The Substack and Hacker News schedules use the browser's local time zone. Both are blocked from 10:00 through 05:59 and load normally from 06:00 through 09:59.

## Adding another site

- For an always-blocked site, add a rule to `rules.json` following the Facebook example.
- For a scheduled site, add its block window to `schedule.js` and its rule and schedule entry to `background.js`, following the Hacker News example.
- If a scheduled site was previously always blocked, add an allow rule for the time outside its window, following the Substack example.
- Add the domain and its block page to `block-sites.js`, with its `hours` if the site is scheduled, and make sure that page is listed in `web_accessible_resources` in `manifest.json` so service-worker-cached pages are covered too.
- In both cases, add the domain to `host_permissions` in `manifest.json`.
- Reload the extension on `chrome://extensions`. No browser restart is needed.

The current block screens name their sites specifically. To use another site name, copy `blocked.html` and `blocked.css` or make the message generic.

## Turning it off

There is no in-extension switch. To disable it, use the on/off switch for the extension on `chrome://extensions`, or remove it entirely. That is the only off switch.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Chrome extension manifest (Manifest V3) |
| `rules.json` | Always-on site blocklist (Facebook and voz.vn) |
| `schedule.js` | Local-time block windows shared by the background worker and cache fallback |
| `background.js` | Always-on rule mirror, scheduled rules, and alarms |
| `block-sites.js` | Redirects blocked domains when a page comes from a service-worker cache, including scheduled blocks |
| `blocked.html` / `blocked.css` | The local “Substack has been blocked” screen |
| `blocked-facebook.html` | The local “Facebook has been blocked” screen |
| `blocked-voz.html` | The local “voz.vn has been blocked” screen |
| `blocked-hacker-news.html` | The local “Hacker News has been blocked” screen |
| `content.css` | Removes YouTube's right sidebar, comments, live chat messages, and chat composer |
| `live-chat.css` | Blanks the standalone YouTube pop-out chat window |
| `icons/` | Extension icons |

## Notes

- The extension requests host access to Substack, Facebook, voz.vn, and Hacker News so it can intercept those navigations.
- It collects no data and makes no external requests.
- Some sites, including voz.vn, register a service worker that can serve cached pages without a network request. Network-level redirect rules never see those navigations, so `block-sites.js` handles them and applies the Substack schedule.
- Substack is redirected during its block window and allowed outside it by a higher-priority dynamic rule. The allow rule also overrides any older static redirect Chrome may still serve after an extension reload.
- It does not hide the YouTube home feed, Shorts, or end-screen suggestions; its scope is the right-hand column, comments, and live chat on video pages.
- In fullscreen, YouTube may reserve space for chat even though its messages are hidden. Use the X in the chat header to close it and let the video fill the screen.
- If you edit the files, click the reload button for the extension on `chrome://extensions` and refresh any open tabs. Refresh any tab that was already showing a newly blocked site, since redirects only apply to new navigations.
