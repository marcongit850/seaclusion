import { handleContact } from "./contact.js";
import { canonicalRedirect, withHardenedHeaders } from "./security.js";

function isContactPath(pathname) {
  return pathname === "/api/contact" || pathname === "/api/contact/";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const redirect = canonicalRedirect(url);
    if (redirect) return withHardenedHeaders(redirect, url.hostname);

    let response;
    if (isContactPath(url.pathname)) {
      response = await handleContact(request, env);
    } else if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      response = new Response("Not found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    } else {
      response = await env.ASSETS.fetch(request);
    }

    return withHardenedHeaders(response, url.hostname);
  },
};
