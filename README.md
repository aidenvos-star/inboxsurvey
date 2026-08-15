# InboxSurvey

A small, free tool that scans your entire Gmail mailbox — including
spam and trash — for signs of subscriptions and sign-ups you might
have forgotten about. Built solo, in the open.

## Files in this repo

- **`index.html`** — the main page (design, Gmail connection, results)
- **`subscription-ai.js`** — the entire AI, kept in its own small file
  on purpose, so it's easy to read and verify independently
- **`architecture.html`** — an interactive diagram showing exactly how
  data flows through the app (open it directly, no setup needed)
- **`logo.png`** — you'll need to add your own logo image here; the
  page expects a file with this exact name in the same folder

## How this actually works (plain English)

1. **You click Connect Gmail.** Google's own sign-in popup opens —
   your password never touches this app's code, only Google sees it.
2. **Google hands back a read-only pass.** This can only look at your
   inbox — it cannot send, delete, or change anything, even if the
   code tried to.
3. **A small AI model loads into your browser tab** (a few hundred MB,
   downloaded once and cached — not an app install). It runs on your
   device's own GPU via WebGPU.
4. **The app searches your whole mailbox** — inbox, archive, spam, and
   trash (`in:anywhere`) — with no keyword guessing. Every email is a
   candidate.
5. **The AI judges each email itself:** does this look like a sign-up,
   subscription, or membership (free or paid)? If so, what's it
   called? Results appear on the page as they're found — nothing is
   batched, nothing is stored.

Because it checks literally everything with no shortcuts, a full scan
of a large mailbox can take a while — the AI reads each email one at a
time, on your own device. That's the honest cost of thoroughness over
speed.

## Privacy, concretely

- **Read-only permission** (`gmail.readonly`), enforced by Google
  itself — not just a promise in this code
- **No backend server** — every request goes straight from your
  browser to Google
- **Nothing is stored** — close the tab and nothing remains, except
  inside your own Google account
- **Revoke access anytime** from your Google Account security settings

## Run it yourself

1. Clone this repo (all files need to stay in the same folder)
2. Create a free Google Cloud project and enable the Gmail API
3. Replace `CLIENT_ID` near the top of the script in `index.html`
   with your own
4. Add your logo as `logo.png` in the same folder
5. Serve it locally (e.g. VS Code's Live Server) — opening the file
   directly won't work, browsers block that for security
6. If publishing via GitHub Pages, add your live GitHub Pages URL to
   "Authorized JavaScript origins" in your Google Cloud OAuth client
   settings — the same step needed for `localhost` during local testing

## Status

Early, actively-developed personal project. Not affiliated with
Google or any company it checks for.
