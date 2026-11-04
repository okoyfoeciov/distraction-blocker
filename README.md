# Distraction Blocker

A deliberately minimal Chrome extension for cutting distracting sites out of your browser.

**Always on. No popup, no toggle, no badge, no settings. No mercy.**

## What it blocks

- **Substack** — `substack.com` and every subdomain are redirected to a local block screen that says **“Substack has been blocked.”**
- **YouTube recommendations** — the entire right-hand column is removed on video watch pages, including recommended videos, live chat, playlists, and transcripts.

Home pages, search results, subscriptions, comments, and the video player on YouTube are left alone.

## Install

1. Clone or download this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked**.
5. Select the folder containing this README.
6. Open any YouTube video, or try visiting Substack.

If a YouTube tab was already open while you installed the extension, refresh that tab once.

## How it works

- `rules.json` contains a `declarativeNetRequest` rule that redirects Substack navigations to the extension's own `blocked.html` page. The site itself never gets a chance to render.
- `content.css` removes the right-hand sidebar from YouTube watch pages.
- There is no JavaScript running on blocked sites, no background worker, and no saved state.

## Adding another site

1. Add another rule to `rules.json`, following the Substack example. Change the `id` and the `urlFilter` (for example, `||example.com^`).
2. Add the domain to `host_permissions` in `manifest.json`.
3. Reload the extension on `chrome://extensions`.

The current block screen names Substack specifically. To use a different site name, copy `blocked.html` and `blocked.css` or make the message generic.

## Turning it off

There is no in-extension switch. To disable it, use the on/off switch for the extension on `chrome://extensions`, or remove it entirely. That is the only off switch.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Chrome extension manifest (Manifest V3) |
| `rules.json` | The site blocklist |
| `blocked.html` / `blocked.css` | The local “Substack has been blocked” screen |
| `content.css` | Removes YouTube's right sidebar |
| `icons/` | Extension icons |

## Notes

- The extension requests host access to Substack so it can intercept those navigations.
- It collects no data and makes no external requests.
- It does not hide the YouTube home feed, Shorts, or end-screen suggestions; its scope is the right-hand column on video pages.
- If you edit the files, click the reload button for the extension on `chrome://extensions` and refresh any open tabs.
