// POST /api/contact
//
// Required Worker secrets (set in Cloudflare, never in this repo):
//   RESEND_API_KEY  — Resend API key, without a "Bearer " prefix
//   CONTACT_EMAIL   — inbox that receives Seaclusion inquiries
//
// Optional sender override, same names as the other sites:
//   SUBSCRIBE_FROM  — preferred, a verified Resend From address
//   FROM            — used only when SUBSCRIBE_FROM is unset
//
// When neither sender secret is set, mail is sent from
// "Seaclusion <onboarding@resend.dev>". That free sender can deliver only
// to the email address on the Resend account until a domain is verified.
// Keep CONTACT_EMAIL on that same address until then.
//
// The public reservations address and phone stay on the pages. They are not
// read from these secrets, and this handler does not fall back to them.

const MAX_BODY = 16000;
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 5;
const RESEND_URL = "https://api.resend.com/emails";
export const DEFAULT_FROM = "Seaclusion <onboarding@resend.dev>";
const recentHits = new Map();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function fromAddress(env = {}) {
  const subscribe = typeof env.SUBSCRIBE_FROM === "string" ? env.SUBSCRIBE_FROM.trim() : "";
  if (subscribe) return subscribe;
  const from = typeof env.FROM === "string" ? env.FROM.trim() : "";
  if (from) return from;
  return DEFAULT_FROM;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function html(body, status) {
  const heading = body.ok ? "Inquiry received" : "Inquiry not sent";
  const text = body.ok
    ? "We will get back to you ASAP."
    : body.error || "Could not send that inquiry. Please try again.";
  const extra = body.ok
    ? `<p>You can also call <a href="tel:+18002082324">(800) 208-2324</a> or email <a href="mailto:reservations@fivestargulfrentals.com">reservations@fivestargulfrentals.com</a>. Mention Seaclusion.</p>`
    : `<p>You can still call <a href="tel:+18002082324">(800) 208-2324</a> or email <a href="mailto:reservations@fivestargulfrentals.com">reservations@fivestargulfrentals.com</a>.</p>`;
  const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(heading)} | Seaclusion</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="/favicon.ico" sizes="any">
</head>
<body>
  <main>
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(text)}</p>
    ${extra}
    <p><a href="/contact/">Back to the inquiry form</a></p>
  </main>
</body>
</html>`;
  return new Response(page, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "unknown";
}

function rateLimited(ip) {
  const now = Date.now();
  const stamps = (recentHits.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (stamps.length >= MAX_PER_WINDOW) {
    recentHits.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  recentHits.set(ip, stamps);
  if (recentHits.size > 1000) {
    for (const [key, times] of recentHits) {
      const fresh = times.filter((time) => now - time < WINDOW_MS);
      if (fresh.length) recentHits.set(key, fresh);
      else recentHits.delete(key);
    }
  }
  return false;
}

function singleLine(value) {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function resendApiKey(env) {
  const key = typeof env.RESEND_API_KEY === "string" ? env.RESEND_API_KEY.trim() : "";
  if (!key || /\s/.test(key)) return "";
  return key;
}

function resendFailure(status, result) {
  const name = result && typeof result.name === "string" ? result.name : "";
  const quota = name === "daily_quota_exceeded" || name === "monthly_quota_exceeded";
  const rateLimitedByResend = status === 429 || name === "rate_limit_exceeded" || quota;

  if (rateLimitedByResend) {
    return {
      status: 429,
      error: quota ? "Please try again later." : "Please wait a minute and try again.",
    };
  }

  if (
    status === 401 ||
    status === 403 ||
    name === "missing_api_key" ||
    name === "restricted_api_key" ||
    name === "suspended_api_key"
  ) {
    return { status: 503, error: "The form is not available right now." };
  }

  if (
    status === 400 ||
    status === 422 ||
    name === "validation_error" ||
    name === "invalid_parameter" ||
    name === "missing_required_field"
  ) {
    return {
      status: 400,
      error: "Could not send that inquiry. Please check the form and try again.",
    };
  }

  return { status: 502, error: "Could not send that inquiry. Please try again." };
}

function phoneOk(value) {
  if (!value) return true;
  if (value.length > 40) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function noteText(fields) {
  const lines = [
    "Seaclusion inquiry",
    "",
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
  ];
  if (fields.phone) lines.push(`Phone: ${fields.phone}`);
  if (fields.dates) lines.push(`Travel dates: ${fields.dates}`);
  lines.push(`Seaclusion updates: ${fields.updates ? "yes" : "no"}`);
  lines.push("", fields.message);
  return lines.join("\n");
}

export async function handleContact(request, env = {}) {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  const type = (request.headers.get("content-type") || "").toLowerCase();
  const asJson = type.includes("application/json") || accept.includes("application/json");
  const reply = (body, status) => (asJson ? json(body, status) : html(body, status));

  if (request.method !== "POST") {
    return reply({ ok: false, error: "Use the form to send an inquiry." }, 405);
  }

  const lengthHeader = Number(request.headers.get("content-length") || 0);
  if (lengthHeader > MAX_BODY) {
    return reply({ ok: false, error: "That inquiry is too long." }, 413);
  }

  const isJson = type.includes("application/json");
  const isForm = type.includes("application/x-www-form-urlencoded");
  if (!isJson && !isForm) {
    return reply({ ok: false, error: "Could not read that inquiry." }, 415);
  }

  if (rateLimited(clientIp(request))) {
    return reply({ ok: false, error: "Please wait a minute and try again." }, 429);
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return reply({ ok: false, error: "Could not read that inquiry." }, 400);
  }
  if (!raw.trim()) {
    return reply({ ok: false, error: "Please add your name, email, and message." }, 400);
  }
  if (raw.length > MAX_BODY) {
    return reply({ ok: false, error: "That inquiry is too long." }, 413);
  }

  let data;
  try {
    if (isJson) {
      data = JSON.parse(raw);
    } else {
      const params = new URLSearchParams(raw);
      data = {};
      for (const key of params.keys()) data[key] = params.get(key);
    }
  } catch {
    return reply({ ok: false, error: "Could not read that inquiry." }, 400);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return reply({ ok: false, error: "Could not read that inquiry." }, 400);
  }

  const honeypot = singleLine(data.company || data.hp_field || data.website);
  if (honeypot) {
    return reply({ ok: false, error: "Could not send that inquiry." }, 400);
  }

  const name = singleLine(data.name);
  const email = singleLine(data.email);
  const phone = singleLine(data.phone);
  const dates = singleLine(data.dates);
  const updates = singleLine(data.updates).toLowerCase();
  const wantsUpdates = updates === "yes" || updates === "on" || updates === "true";
  const message = String(data.message ?? "").replace(/\u0000/g, "").trim();

  if (!name || !email) {
    return reply({ ok: false, error: "Please add your name and email." }, 400);
  }
  if (name.length > 80) return reply({ ok: false, error: "That name is too long." }, 400);
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return reply({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  if (!phoneOk(phone)) {
    return reply({ ok: false, error: "Please enter a valid phone number." }, 400);
  }
  if (dates.length > 120) {
    return reply({ ok: false, error: "Those travel dates are too long." }, 400);
  }
  if (!message) {
    return reply({ ok: false, error: "Please add a message." }, 400);
  }
  if (message.length > 4000) return reply({ ok: false, error: "That message is too long." }, 400);

  const to = typeof env.CONTACT_EMAIL === "string" ? env.CONTACT_EMAIL.trim() : "";
  if (!to || !EMAIL_RE.test(to)) {
    return reply({ ok: false, error: "The form is not available right now." }, 503);
  }

  const apiKey = resendApiKey(env);
  if (!apiKey) {
    return reply({ ok: false, error: "The form is not available right now." }, 503);
  }

  const payload = {
    from: fromAddress(env),
    to: [to],
    reply_to: email,
    subject: `Seaclusion inquiry from ${name}`,
    text: noteText({ name, email, phone, dates, updates: wantsUpdates, message }),
  };

  let upstream;
  try {
    upstream = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return reply({ ok: false, error: "Could not send that inquiry. Please try again." }, 502);
  }

  let result = null;
  try {
    result = await upstream.json();
  } catch {
    result = null;
  }

  const delivered =
    upstream.ok && result && typeof result.id === "string" && result.id.trim().length > 0;
  if (!delivered) {
    const failure = resendFailure(upstream.status, result);
    return reply({ ok: false, error: failure.error }, failure.status);
  }

  return reply({ ok: true }, 200);
}
