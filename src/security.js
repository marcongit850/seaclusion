// Canonical host matches site.config.json and the rel=canonical tags.
// www.seaclusion.house is the only host redirected. *.workers.dev stays
// reachable for previews and is marked noindex.

export const CANONICAL_HOST = "seaclusion.house";

// Pages, CSS, scripts, images, and the tour video (/images/tour.mp4) are
// same-origin, except the GA4 tag. style-src allows the inline style
// attributes already in the HTML. The inline gtag bootstrap is allowed by
// its script-src hash, not unsafe-inline. The map iframe is the only
// third-party frame.
//
// SHA-256 of the inline script in scripts/build_pages.py google_tag().
// GA4 also beacons with images, so the same hosts are on img-src.
const GA_ORIGINS = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
].join(" ");
const GA_INLINE_HASH = "'sha256-acZxxLGNVE9dOUSzor1bD4p7dQ2Ji4MnHsej1o8u1ts='";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' ${GA_INLINE_HASH} ${GA_ORIGINS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${GA_ORIGINS}`,
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self' ${GA_ORIGINS}`,
  "form-action 'self'",
  "frame-src 'self' https://www.openstreetmap.org",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "content-security-policy": CONTENT_SECURITY_POLICY,
};

export const PREVIEW_ROBOTS = "noindex";

export function isWorkersDevHost(hostname) {
  return String(hostname || "").toLowerCase().endsWith(".workers.dev");
}

export function canonicalRedirect(url) {
  if (url.hostname !== `www.${CANONICAL_HOST}`) return null;
  const target = new URL(url.href);
  target.protocol = "https:";
  target.hostname = CANONICAL_HOST;
  return new Response(null, {
    status: 301,
    headers: {
      location: target.toString(),
      "cache-control": "public, max-age=86400",
    },
  });
}

function bodyless(status) {
  return status === 204 || status === 205 || status === 304;
}

export function withHardenedHeaders(response, hostname) {
  const headers = new Headers(response.headers);
  let changed = false;
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (headers.get(name) !== value) {
      headers.set(name, value);
      changed = true;
    }
  }
  if (isWorkersDevHost(hostname) && headers.get("x-robots-tag") !== PREVIEW_ROBOTS) {
    headers.set("x-robots-tag", PREVIEW_ROBOTS);
    changed = true;
  }
  if (!changed) return response;
  return new Response(bodyless(response.status) ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
