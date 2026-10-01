# Seaclusion

Marketing site for Seaclusion Beach Home, a gulf-front vacation rental at 330 Tango Mar Drive, Miramar Beach, Florida. The copy and photographs come from the [Seaclusion Wix site](https://marc12345678.wixsite.com/seaclusion). Rates are not listed. Amenities that were not on that site are not listed.

The pages are static HTML, CSS, and JavaScript. A Cloudflare Worker serves them and accepts inquiries at `POST /api/contact`, using the same Resend pattern as Walton Power Lines.

The Worker name is **`seaclusion`**. Leave that name in `wrangler.jsonc`.

## Preview

From the repository root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`. That server shows the pages only. The inquiry form needs the Worker.

```bash
npm install
npm test
npm run dev
```

`npm run dev` starts Wrangler. The form returns HTTP 503 until the secrets below are present. The phone number and reservations email stay on the page either way.

To try a real send locally, create `.dev.vars` (it is gitignored):

```bash
RESEND_API_KEY=re_your_key
CONTACT_EMAIL=you@example.com
```

`onboarding@resend.dev` can deliver only to the address on the Resend account. Use that address as `CONTACT_EMAIL` until a domain is verified.

## Pages

- `/` — hero, highlights, the house, favorite features, floors, gallery, video tour, location, inquiry
- `/amenities/` — home information and the published amenity list
- `/floorplans/` — first, second, and third floors, with the Wix floor-plan drawings
- `/gallery/` — video tour and 25 photographs from the Wix gallery
- `/location/` — address and map
- `/tips/` — elevator, televisions, balcony locks
- `/contact/` — inquiry form

The video tour plays from `images/tour.mp4` on the home page and the gallery.

## Inquiry form

`/contact/` posts to `/api/contact`. With JavaScript it sends JSON. Without JavaScript the browser posts the form and the Worker returns an HTML confirmation.

The page always shows the booking contacts from the Wix site:

- reservations@fivestargulfrentals.com
- (800) 208-2324

Those addresses are not Worker secrets. The form does not mail them unless `CONTACT_EMAIL` is set to that inbox and the From address is allowed to deliver there.

## Deploy

Cloudflare Workers Builds deploys this repository with `npx wrangler deploy`, using `wrangler.jsonc`.

- `"name"` must stay `seaclusion`.
- `assets.directory` is `.`, so `index.html` at the repository root is the home page.
- `main` is `src/worker.js`. `assets.run_worker_first` is only `/api/contact` and `/api/contact/`. Every other path is a static asset.
- An assets-only Worker cannot hold variables. `"main"` is what makes the secrets possible. Do not put secret values in this repository.

After the Worker is deployed, add these in **Workers & Pages → seaclusion → Settings → Variables and Secrets**. Add them for Production, and for Preview if that environment is offered. Then redeploy so the Worker picks them up.

| Name | Required | What to set |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Resend API key. Secret. No `Bearer ` prefix. |
| `CONTACT_EMAIL` | Yes | Inbox that receives inquiries. Secret or variable. |
| `SUBSCRIBE_FROM` | No | Verified Resend sender, for example `Seaclusion <reservations@yourdomain>`. Same secret name as Eating on 30A. |
| `FROM` | No | Used only when `SUBSCRIBE_FROM` is empty. |

If `SUBSCRIBE_FROM` and `FROM` are both unset, the Worker sends from `Seaclusion <onboarding@resend.dev>`. That sender can deliver only to the Resend account’s own address. Keep `CONTACT_EMAIL` set to that same address until a domain is verified. After the domain is verified, set `SUBSCRIBE_FROM` to an address on it and point `CONTACT_EMAIL` at the real inbox (for example `reservations@fivestargulfrentals.com`).

Until `RESEND_API_KEY` and `CONTACT_EMAIL` are both set, `POST /api/contact` returns HTTP 503 and does not call Resend. The form still displays, and the page still shows the phone number and reservations email.

## Canonical URLs

`site.config.json` has `"origin": ""`. Canonical links, Open Graph URLs, and `sitemap.xml` are root-relative until an origin is set, so they follow whatever host serves the site. When the production domain is known, set `origin` to that `https://` URL, run `python3 scripts/build_pages.py`, and commit the regenerated pages, `sitemap.xml`, and `robots.txt`.

## Photos

Gallery images, the logo, and the floor-plan drawings were saved from the Wix site. They live in `images/`.
