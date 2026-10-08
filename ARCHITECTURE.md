# Seaclusion: architecture

Last checked against the code and Cloudflare on Oct 8, 2026.

## What it does

Marketing site for Seaclusion Beach Home, a gulf front vacation rental in Miramar Beach, FL: house, amenities, floor plans, gallery, location, guides, and an inquiry form.

## Domains and Worker

- Worker: `seaclusion`
- Custom domains (attached in the Cloudflare dashboard): `seaclusion.house`, `www.seaclusion.house`. Canonical is https://seaclusion.house; the Worker 301s www to the apex.
- workers.dev host is enabled (kept reachable for previews, marked noindex).

## Data and images

- Pages, photos, and the tour video are static files in this repo. `scripts/build_pages.py` (with `site.config.json`) generates the guide pages.
- Bindings: `ASSETS` (static assets, directory `.`). No D1, R2, or KV.
- External services: Resend (inquiry mail), Google Analytics 4 tag on pages, an OpenStreetMap map embed.

## Secrets and env vars (names only)

- Secrets set: `RESEND_API_KEY`, `CONTACT_EMAIL`
- Optional, read by the code but not set today: `SUBSCRIBE_FROM` (preferred verified From address), `FROM` (used only when `SUBSCRIBE_FROM` is unset).

## Cron and scheduled jobs

None. The Worker has only a fetch handler and no cron trigger.

## How it deploys

- Cloudflare Workers Builds, auto deploy on merge to `main`. Repo `marcongit850/seaclusion`, trigger `902b6bc1-e1b8-4c65-b057-989f35ac05f3`, build command empty, deploy command `npx wrangler deploy`, root `/`.
- If a merge does not deploy: `POST /accounts/f1c59948520f1ec39473238b621c7e24/builds/triggers/902b6bc1-e1b8-4c65-b057-989f35ac05f3/builds` with body `{"branch": "main", "commit_hash": "<full 40 character sha>"}`. Check builds with `GET /accounts/f1c59948520f1ec39473238b621c7e24/builds/workers/e87b0397d7fb435783864716240b877c/builds?per_page=2` and match `commit_hash`.

## Known gotchas

- The build command is empty, so `scripts/build_pages.py` does NOT run on deploy. Run `npm run build` and commit the generated pages.
- `run_worker_first` is `true` so the www to apex redirect and the hardened security headers (CSP in `src/security.js`) apply to every page. Adding a new third party script or frame means updating that CSP.
- Neither `SUBSCRIBE_FROM` nor `FROM` is set, so inquiries go from Resend's onboarding sender (`Seaclusion <onboarding@resend.dev>`), which only delivers to the Resend account email.

TODO: decide on a verified Resend From address and set `SUBSCRIBE_FROM`.

## Standing rule

Any PR that changes architecture (new secret, cron, storage, binding, or deploy change) must update this file in the same PR.
