# Distraction Blocker

A deliberately minimal Chrome extension for cutting distracting sites out of your browser.

**No popup, no toggle, no badge, no settings. No mercy.**

## What it blocks

- **Substack** — `substack.com` and every subdomain are redirected to a local block screen that says **“Substack has been blocked.”**
- **Facebook** — `facebook.com` and every subdomain are redirected to a local block screen that says **“Facebook has been blocked.”**
- **Hacker News** — `news.ycombinator.com` is blocked every day from **10:00 to 05:59 local time**. Visiting it shows **“Hacker News has been blocked.”**
- **YouTube recommendations** — the entire right-hand column is removed on video watch pages, including recommended videos, playlists, and transcripts.
- **YouTube live chat** — live chat messages and the composer are hidden on live streams and premieres. The separate pop-out chat window is fully blanked. In fullscreen, the chat header stays visible so its close button can collapse the chat and let the video fill the screen.

Home pages, search results, subscriptions, comments, and the video player on YouTube are left alone.

## Install

1. Clone or download this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked**.
5. Select the folder containing this README.
6. Open any YouTube video, or try visiting Substack, Facebook, or Hacker News.

If a YouTube tab was already open while you installed the extension, refresh that tab once.

## How it works

- `rules.json` contains static `declarativeNetRequest` rules that redirect Substack and Facebook navigations to local block screens. The sites themselves never get a chance to render.
- `background.js` maintains a dynamic `declarativeNetRequest` rule for Hacker News. A Chrome alarm wakes at 10:00 and 06:00 local time, adds or removes the rule, and schedules the next transition.
- `content.css` removes the right-hand sidebar, live chat messages, and the chat composer from YouTube, while leaving the chat header's close button reachable in fullscreen.
- `live-chat.css` blanks the standalone pop-out chat window.
- There is no JavaScript running on blocked sites, and no saved state.

The Hacker News schedule uses the browser's local time zone. The block window is `[10:00, 06:00)`, wrapping past midnight: it is active from 10:00 in the morning all the way through 05:59 the next day and turns off at 06:00. Outside that window, Hacker News loads normally.

## Adding another site

- For an always-blocked site, add a rule to `rules.json` following the Substack example.
- For a scheduled site, add a rule and schedule logic to `background.js`.
- In both cases, add the domain to `host_permissions` in `manifest.json`.
- Reload the extension on `chrome://extensions`.

The current block screens name their sites specifically. To use another site name, copy `blocked.html` and `blocked.css` or make the message generic.

## Turning it off

There is no in-extension switch. To disable it, use the on/off switch for the extension on `chrome://extensions`, or remove it entirely. That is the only off switch.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Chrome extension manifest (Manifest V3) |
| `rules.json` | Always-on site blocklist |
| `background.js` | Hacker News schedule and dynamic redirect rule |
| `blocked.html` / `blocked.css` | The local “Substack has been blocked” screen |
| `blocked-facebook.html` | The local “Facebook has been blocked” screen |
| `blocked-hacker-news.html` | The local “Hacker News has been blocked” screen |
| `content.css` | Removes YouTube's right sidebar, live chat messages, and chat composer |
| `live-chat.css` | Blanks the standalone YouTube pop-out chat window |
| `icons/` | Extension icons |

## Notes

- The extension requests host access to Substack, Facebook, and Hacker News so it can intercept those navigations.
- It collects no data and makes no external requests.
- It does not hide the YouTube home feed, Shorts, or end-screen suggestions; its scope is the right-hand column and live chat on video pages.
- In fullscreen, YouTube may reserve space for chat even though its messages are hidden. Use the X in the chat header to close it and let the video fill the screen.
- If you edit the files, click the reload button for the extension on `chrome://extensions` and refresh any open tabs.
