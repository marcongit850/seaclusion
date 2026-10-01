import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pages = [
  {
    file: "index.html",
    path: "/",
    h1: "Luxury Beachfront Home in Destin",
    title: "Gulf-Front 9-Bedroom Vacation Rental in Miramar Beach",
  },
  {
    file: "amenities/index.html",
    path: "/amenities/",
    h1: "Amenities at this Miramar Beach gulf-front home",
    title: "9-Bedroom Gulf-Front Rental in Miramar Beach",
  },
  {
    file: "floorplans/index.html",
    path: "/floorplans/",
    h1: "Floor plans for this 9-bedroom Destin beach house",
    title: "9-Bedroom Destin Beach House",
  },
  {
    file: "gallery/index.html",
    path: "/gallery/",
    h1: "Photos of the gulf-front home in Miramar Beach",
    title: "Gulf-Front Seaclusion in Miramar Beach",
  },
  {
    file: "location/index.html",
    path: "/location/",
    h1: "A gulf-front address in Miramar Beach",
    title: "330 Tango Mar Drive, Miramar Beach",
  },
  {
    file: "tips/index.html",
    path: "/tips/",
    h1: "House tips for your stay at Seaclusion",
    title: "Seaclusion Vacation Rental in Miramar Beach",
  },
  {
    file: "contact/index.html",
    path: "/contact/",
    h1: "Request to book this Miramar Beach home",
    title: "Seaclusion Gulf-Front Rental, Miramar Beach",
  },
];

function read(file) {
  return readFileSync(file, "utf8");
}

const titles = new Set();
const h1s = new Set();

for (const page of pages) {
  const html = read(page.file);
  assert.match(html, new RegExp(`<title>[^<]*${page.title}[^<]*</title>`));
  assert.match(html, new RegExp(`<h1>${page.h1}</h1>`));
  assert.equal((html.match(/<h1>/g) || []).length, 1, page.file);
  assert.match(html, /<meta name="description" content="[^"]{40,}">/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /330 Tango Mar Drive/);
  assert.match(html, /Miramar Beach/);
  assert.match(html, /Sleeps 24|sleeps 24/);
  assert.match(html, /9 bedroom/i);
  assert.match(html, /pool/i);
  assert.match(html, /hot tub/i);
  assert.match(html, /private beach/i);
  assert.match(html, /gulf/i);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /reservations@fivestargulfrentals\.com/);
  assert.match(html, /\(800\) 208-2324/);
  assert.equal(html.includes("per night"), false, page.file);
  assert.equal(html.includes("nightly"), false, page.file);
  assert.equal(/\$\s?\d/.test(html), false, page.file);
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  const h1 = html.match(/<h1>([^<]*)<\/h1>/)[1];
  assert.equal(titles.has(title), false, title);
  assert.equal(h1s.has(h1), false, h1);
  titles.add(title);
  h1s.add(h1);
}

const home = read("index.html");
assert.match(home, /VacationRental/);
assert.match(home, /LodgingBusiness/);
assert.match(home, /"numberOfBedrooms":9/);
assert.match(home, /"maxValue":24/);
assert.match(home, /"petsAllowed":true/);

const contact = read("contact/index.html");
assert.match(contact, /action="\/api\/contact"/);
assert.match(contact, /name="name"/);
assert.match(contact, /name="email"/);
assert.match(contact, /name="phone"/);
assert.match(contact, /name="dates"/);
assert.match(contact, /name="message"/);
assert.match(contact, /data-contact-form/);
assert.match(contact, /We will get back to you ASAP/);

const gallery = read("gallery/index.html");
assert.equal((gallery.match(/data-shot/g) || []).length, 25);

const sitemap = read("sitemap.xml");
for (const page of pages) {
  assert.match(sitemap, new RegExp(page.path.replaceAll("/", "\\/")));
}
const robots = read("robots.txt");
assert.match(robots, /Sitemap:/);

console.log(`passed ${pages.length} pages`);
