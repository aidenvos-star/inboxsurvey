# InboxSurvey

> **Browser-local email triage with reviewable source code.** InboxSurvey reads Gmail only after a visitor grants the read-only scope, redacts sensitive values before interpretation, runs model inference in the visitor’s browser when WebGPU is available, and presents one in-memory summary per company.

This repository is intended to make the implementation **inspectable**. Public source code is evidence that people can review and test; it is not a substitute for an independent security audit, browser hardening, or a guarantee about every third-party component on a visitor’s device.

## What “local” means in this project

The page requests Gmail’s read-only scope from Google after an explicit user action. Gmail data is fetched directly from Google to the visitor’s browser and is processed in page memory. Before a message reaches the local model prompt, the classifier redacts passwords, one-time codes, financial values, identifiers, email addresses, and sensitive URL-query values. The result ledger receives only the sanitized classification fields and is discarded on refresh.

The preferred model is `Llama-3.2-3B-Instruct-q4f16_1-MLC`. It runs through WebLLM and WebGPU in the browser when both are available; a 1B WebLLM fallback is attempted if the 3B path cannot initialize. If WebGPU or either local model is unavailable, the deterministic, privacy-filtered classifier still operates. WebLLM documents that it is an in-browser inference engine using WebGPU and that model records identify downloadable model weights and the model library. [1]

| Data or artifact | Where it goes | Retained by this page? |
| --- | --- | --- |
| Google sign-in and OAuth consent | Google Identity Services | No application-side persistence. |
| Gmail message metadata and snippets | Directly from Gmail API to the visitor’s browser | Only in active page memory. |
| Sanitized local-model prompt | Browser-local WebLLM/WebGPU runtime | Only in active page memory. |
| Company-level findings | Browser DOM and JavaScript memory | Cleared on refresh. |
| WebLLM module, model library, and model weights | Downloaded to the browser from their published sources when needed | These are model artifacts, not mailbox data; browser caching behavior is controlled by the browser/runtime. |

## Important privacy boundary

**InboxSurvey does not use a remote AI inference endpoint for email classification.** However, the page necessarily communicates with Google for OAuth and Gmail reads, and it downloads the WebLLM runtime and the selected model artifacts for browser execution. A browser extension, a compromised device, modified hosting, or a changed third-party dependency can alter this boundary. Review the source, deploy from a trusted origin, and use the supplied validation commands before relying on the application for sensitive use.

## Minimal GitHub package

The lean GitHub package contains only the files required to run, deploy, and inspect InboxSurvey.

| File | Why it is included |
| --- | --- |
| `index.html` | Static interface, OAuth request, Gmail calls, browser-local scan flow, and metadata. |
| `rounded-interface.css` | The page’s separate rounded visual system. |
| `subscription-ai.js` | The browser-local AI classifier, redaction pipeline, model fallback, safety rules, and company aggregation. |
| `logo-mark-black-lime-transparent-clean.png` | Required in-page brand asset. |
| `favicon-white-background.png` | Required browser-tab icon. |
| `robots.txt` and `sitemap.xml` | Netlify crawl-discovery files for the public site. |
| `README.md` | This architecture, privacy, GitHub, Netlify, and OAuth guide. |
| `LICENSE` | Proprietary all-rights-reserved source terms. |
| `.gitignore` | Prevents local archives, credentials, and sensitive artifacts from being committed. |

The browser-local AI source is **`subscription-ai.js`**. The package intentionally excludes optional validation scripts, detailed publishing notes, local repair scripts, historical assets, and archives.

Do **not** commit Gmail exports, screenshots containing personal email, OAuth access tokens, OAuth client secrets, `.env` files, browser profiles, downloaded model-weight files, or production logs. The OAuth **client ID** in `index.html` is an identifier intended for browser use; it is not an OAuth client secret. Google’s client setup guidance distinguishes the public browser client ID from client-secret handling and requires configuring each production origin. [2]

## Review the local AI path

Inspect these code areas directly:

| Review question | Where to look |
| --- | --- |
| Is a remote AI API used? | `subscription-ai.js`: the WebLLM import, `navigator.gpu` check, and `CreateMLCEngine` initialization. |
| Is sensitive content redacted before prompting? | `redactSensitiveText`, `sanitizeInput`, and the `classifyEmail` prompt construction. |
| Can a local model override phishing or spam rules? | `canModelRefine`, `buildResult`, and deterministic triage functions. |
| Is raw content stored by this page? | Search the source for `localStorage`, `indexedDB`, and network calls; `validate-static.mjs` asserts disallowed persistence and training hooks are absent. |
| Are company rows generated without storing original messages? | `aggregateCompanyResults` accepts only sanitized result fields and produces one in-memory row per company. |
| Are displayed locations genuine Gmail locations? | `OUTPUT_GMAIL_LOCATIONS` accepts only actual system label IDs returned on a message; it does not infer folders from email category or show custom labels. |

## Run and deploy

Serve the folder from an HTTP(S) origin, for example with Visual Studio Code’s **Live Server** extension. Do not open `index.html` with `file://`: the static ES-module import and Google Identity integration require an HTTP(S) origin.

For a deployed site, add every exact HTTPS origin—such as a Netlify subdomain and any custom domain—to the OAuth client’s **Authorized JavaScript origins**. Google documents that an origin contains the scheme and fully qualified hostname only. [2] The only requested Gmail permission is `https://www.googleapis.com/auth/gmail.readonly`; consult Gmail’s scope documentation before altering permissions. [3]

## Publish the lean package

Create an empty GitHub repository, extract `inboxsurvey-github-minimal.zip`, then run:

```bash
git init
git add index.html rounded-interface.css subscription-ai.js \
  logo-mark-black-lime-transparent-clean.png favicon-white-background.png \
  robots.txt sitemap.xml README.md LICENSE .gitignore
git commit -m "Publish InboxSurvey source"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/inboxsurvey.git
git push -u origin main
```

After creating the repository, update the `PUBLIC_SOURCE_URL` constant in `index.html` to your exact GitHub URL. That powers the footer’s **Review local source** link. Deploy the same package root on Netlify with no build command and `.` as the publish directory.

Before making Gmail access available to everyone, complete Google OAuth publication and restricted-scope verification for `gmail.readonly`. The homepage, privacy policy, and OAuth branding must accurately describe the public application. The included `LICENSE` establishes proprietary source terms but cannot technically prevent someone from inspecting code sent to their browser.

## Third-party components

InboxSurvey’s browser-local model path depends on WebLLM and on the published model artifacts referenced by its model registry. The source does not redistribute the Llama model weights. Review and comply with the applicable terms and licenses of every dependency and model before publishing a commercial service.

## References

[1] [WebLLM JavaScript SDK](https://llm.mlc.ai/docs/deploy/webllm.html)

[2] [Google Identity Services: setup a web client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)

[3] [Gmail API authorization scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
