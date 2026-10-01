import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_FROM } from "../src/contact.js";
import {
  CANONICAL_HOST,
  CONTENT_SECURITY_POLICY,
  PREVIEW_ROBOTS,
  SECURITY_HEADERS,
} from "../src/security.js";
import worker from "../src/worker.js";

const INBOX = "inbox@example.com";
const API_KEY = "re_test_secret";
const realFetch = globalThis.fetch;
let fetchCalls = [];

function installFetch() {
  fetchCalls = [];
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url, init });
    return new Response(JSON.stringify({ id: "email_123" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

function restoreFetch() {
  globalThis.fetch = realFetch;
}

function parseHeaderBlocks(text) {
  const blocks = [];
  let current = null;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = { path: line.trim(), headers: {} };
      blocks.push(current);
      continue;
    }
    const match = line.match(/^\s+([^:]+):\s*(.*)$/);
    assert.ok(match, line);
    current.headers[match[1].toLowerCase()] = match[2].trim();
  }
  return blocks;
}

const valid = {
  name: "Ada Guest",
  email: "ada@example.com",
  phone: "(850) 555-0100",
  dates: "June 6–13",
  message: "We are a group of 18.",
  updates: "yes",
  company: "",
};

function contactRequest(url, body = valid) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "cf-connecting-ip": "203.0.113.80",
    },
    body: JSON.stringify(body),
  });
}

const env = { CONTACT_EMAIL: INBOX, RESEND_API_KEY: API_KEY };

let passed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log("ok", name);
  } catch (error) {
    console.error("FAIL", name);
    console.error(error);
    process.exitCode = 1;
  } finally {
    restoreFetch();
  }
}

await check("static headers keep the existing policy and add HSTS and CSP", () => {
  const blocks = parseHeaderBlocks(readFileSync("_headers", "utf8"));
  const site = blocks.find((block) => block.path === "/*");
  assert.ok(site);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    assert.equal(site.headers[name], value, name);
  }
  assert.equal(site.headers["x-robots-tag"], undefined);
  assert.equal(site.headers["permissions-policy"], "camera=(), microphone=(), geolocation=()");
  assert.match(site.headers["strict-transport-security"], /max-age=31536000;\s*includeSubDomains/);
  assert.equal(site.headers["content-security-policy"], CONTENT_SECURITY_POLICY);
  assert.match(CONTENT_SECURITY_POLICY, /script-src 'self'/);
  assert.equal(CONTENT_SECURITY_POLICY.includes("script-src 'self' 'unsafe-inline'"), false);
  assert.equal(CONTENT_SECURITY_POLICY.includes("unsafe-eval"), false);
  assert.match(CONTENT_SECURITY_POLICY, /style-src 'self' 'unsafe-inline'/);
  assert.match(CONTENT_SECURITY_POLICY, /media-src 'self'/);
  assert.match(CONTENT_SECURITY_POLICY, /frame-src 'self' https:\/\/www\.openstreetmap\.org/);
  assert.match(CONTENT_SECURITY_POLICY, /connect-src 'self'/);
  assert.match(CONTENT_SECURITY_POLICY, /form-action 'self'/);

  const preview = blocks.find((block) => block.path.includes("workers.dev"));
  assert.ok(preview);
  assert.equal(preview.headers["x-robots-tag"], PREVIEW_ROBOTS);
  assert.equal(Object.keys(preview.headers).length, 1);
});

await check("production pages stay indexable on the apex host", () => {
  const config = JSON.parse(readFileSync("site.config.json", "utf8"));
  assert.equal(new URL(config.origin).hostname, CANONICAL_HOST);
  assert.equal(config.origin, `https://${CANONICAL_HOST}`);
  const home = readFileSync("index.html", "utf8");
  assert.match(home, /<meta name="robots" content="index,follow">/);
  assert.match(home, /rel="canonical" href="https:\/\/seaclusion\.house\/"/);
  const robots = readFileSync("robots.txt", "utf8");
  assert.match(robots, /Allow: \//);
  assert.equal(robots.includes("noindex"), false);
  assert.equal(robots.includes("Disallow: /"), false);
});

await check("www redirects to the apex and leaves the path and query", async () => {
  let called = false;
  const response = await worker.fetch(new Request("http://www.seaclusion.house/guides/private-beach-access/?q=1"), {
    ASSETS: {
      fetch: async () => {
        called = true;
        return new Response("should not serve");
      },
    },
  });
  assert.equal(called, false);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://seaclusion.house/guides/private-beach-access/?q=1");
  assert.equal(response.headers.get("x-robots-tag"), null);
  assert.equal(response.headers.get("strict-transport-security"), SECURITY_HEADERS["strict-transport-security"]);
  assert.equal(response.headers.get("permissions-policy"), SECURITY_HEADERS["permissions-policy"]);
});

await check("apex and other hosts are not redirected", async () => {
  for (const url of [
    "https://seaclusion.house/",
    "https://seaclusion.house/contact/",
    "https://preview-seaclusion.example.workers.dev/",
    "https://notwww.seaclusion.house/",
    "https://www.seaclusion.house.evil.com/",
  ]) {
    let seen = "";
    const response = await worker.fetch(new Request(url), {
      ASSETS: {
        fetch: async (request) => {
          seen = request.url;
          return new Response("page", { status: 200, headers: { "content-type": "text/html" } });
        },
      },
    });
    assert.equal(response.status, 200, url);
    assert.equal(seen, url);
    assert.equal(await response.text(), "page");
  }
});

await check("workers.dev is noindex and the apex host is not", async () => {
  const preview = await worker.fetch(new Request("https://abc-seaclusion.sub.workers.dev/gallery/"), {
    ASSETS: {
      fetch: async () => new Response("<html>preview</html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    },
  });
  assert.equal(preview.headers.get("x-robots-tag"), "noindex");
  assert.equal(preview.headers.get("content-security-policy"), CONTENT_SECURITY_POLICY);
  assert.match(await preview.text(), /preview/);

  const production = await worker.fetch(new Request("https://seaclusion.house/gallery/"), {
    ASSETS: {
      fetch: async () => new Response("<html>live</html>", {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          ...Object.fromEntries(Object.entries(SECURITY_HEADERS)),
        },
      }),
    },
  });
  assert.equal(production.headers.get("x-robots-tag"), null);
  assert.equal(production.headers.get("content-security-policy"), CONTENT_SECURITY_POLICY);
  const cspValues = production.headers.get("content-security-policy").split(",").map((part) => part.trim());
  assert.equal(cspValues.length, 1);
  assert.equal(await production.text(), "<html>live</html>");
});

await check("a legitimate inquiry on the apex host is unchanged", async () => {
  installFetch();
  const response = await worker.fetch(
    contactRequest("https://seaclusion.house/api/contact"),
    env,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-robots-tag"), null);
  const json = await response.json();
  assert.equal(json.ok, true);
  assert.equal(fetchCalls.length, 1);
  const payload = JSON.parse(fetchCalls[0].init.body);
  assert.equal(payload.from, DEFAULT_FROM);
  assert.deepEqual(payload.to, [INBOX]);
  assert.equal(payload.reply_to, "ada@example.com");
});

await check("a filled honeypot still does not send", async () => {
  installFetch();
  const response = await worker.fetch(
    contactRequest("https://seaclusion.house/api/contact/", { ...valid, company: "not-a-person" }),
    env,
  );
  assert.equal(response.status, 400);
  assert.equal(fetchCalls.length, 0);
  const json = await response.json();
  assert.equal(json.ok, false);
});

await check("preview inquiries still send and are noindex", async () => {
  installFetch();
  const response = await worker.fetch(
    contactRequest("https://preview-seaclusion.example.workers.dev/api/contact"),
    env,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-robots-tag"), "noindex");
  const json = await response.json();
  assert.equal(json.ok, true);
  assert.equal(fetchCalls.length, 1);
});

await check("www does not accept an inquiry in place of the redirect", async () => {
  installFetch();
  const response = await worker.fetch(
    contactRequest("https://www.seaclusion.house/api/contact"),
    env,
  );
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://seaclusion.house/api/contact");
  assert.equal(fetchCalls.length, 0);
});

if (process.exitCode) {
  console.error("security tests failed");
} else {
  console.log(`passed ${passed}`);
}
