# YouTube Sidebar Blocker

A deliberately minimal Chrome extension that removes the right-hand sidebar from YouTube watch pages.

**Always on. No popup, no toggle, no badge, no settings. No mercy.**

## What it does

- Removes the **entire right-hand column** on YouTube video pages, including:
  - recommended videos / "Up next"
  - live chat
  - the playlist panel
  - transcript and other side panels
- Collapses the empty column and lets the player use the freed space.
- Leaves the home page, search results, subscriptions, comments, and the player untouched.
- Works with YouTube's single-page navigation; no page refresh needed after the first load.

## Install

1. Clone or download this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked**.
5. Select the folder containing this README.
6. Open any YouTube video. The right-hand sidebar will not appear.

If a YouTube tab was already open while you installed the extension, refresh that tab once.

## Updating from the previous version

The toggle and popup have been removed. On `chrome://extensions`, click the reload button on the extension card. The extension is now always active whenever it is enabled in Chrome.

## Turning it off

There is no in-extension switch. To disable it, use **Remove** or the on/off switch for the extension on `chrome://extensions`. That is the only off switch.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Chrome extension manifest (Manifest V3) |
| `content.css` | The selectors that remove the right sidebar |
| `icons/` | Extension icons |

## Notes

- The extension only matches `https://www.youtube.com/*` and `https://youtube.com/*`.
- It requests no permissions, stores no settings, and collects no data.
- It does not hide the YouTube home feed, Shorts, or end-screen suggestions; its scope is the right-hand column on video pages.
- If you edit the files, click the reload button for the extension on `chrome://extensions` and refresh any open YouTube tabs.
