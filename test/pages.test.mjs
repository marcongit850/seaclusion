import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

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
  {
    file: "guides/index.html",
    path: "/guides/",
    h1: "What to sort out before you book a house that has to hold a real group on this stretch of the gulf.",
    title: "Large Gulf-Front Rentals near Destin",
    image: "/images/gallery/29.jpg",
  },
  {
    file: "guides/large-beach-house/index.html",
    path: "/guides/large-beach-house/",
    h1: "What to check before you book a large Destin-area beach house",
    title: "Choosing a Large Miramar Beach House",
    image: "/images/gallery/43.jpg",
  },
  {
    file: "guides/private-beach-access/index.html",
    path: "/guides/private-beach-access/",
    h1: "Why a private beach changes a gulf-front week",
    title: "Why Private Beach Access Matters",
    image: "/images/gallery/12.jpg",
  },
  {
    file: "guides/miramar-beach-vs-destin/index.html",
    path: "/guides/miramar-beach-vs-destin/",
    h1: "Miramar Beach or the busier beaches of Destin",
    title: "Miramar Beach vs Destin",
    image: "/images/gallery/26.jpg",
  },
  {
    file: "guides/things-to-do-nearby/index.html",
    path: "/guides/things-to-do-nearby/",
    h1: "What a group actually does around this house",
    title: "Things to Do Near a Miramar Beach",
    image: "/images/gallery/02.jpg",
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
  const canonical = `https://seaclusion.house${page.path}`;
  assert.match(html, new RegExp(`rel="canonical" href="${canonical.replaceAll("/", "\\/")}"`));
  assert.match(html, new RegExp(`property="og:url" content="${canonical.replaceAll("/", "\\/")}"`));
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  const imagePath = page.image || "/images/og.jpg";
  const imageUrl = `https://seaclusion.house${imagePath}`.replaceAll("/", "\\/");
  assert.match(html, new RegExp(`property="og:image" content="${imageUrl}"`));
  if (page.image) {
    assert.equal(existsSync(page.image.slice(1)), true, page.image);
  }
  assert.match(html, /330 Tango Mar Drive/);
  const footerStart = html.indexOf("<footer");
  assert.ok(footerStart >= 0, page.file);
  const footer = html.slice(footerStart);
  assert.equal(footer.includes("330 Tango Mar Drive"), false, page.file);
  assert.equal(footer.includes(">Seaclusion Beach Home<"), false, page.file);
  assert.match(footer, /facebook\.com\/SeaclusionHome/);
  assert.match(footer, /aria-label="Facebook"/);
  assert.match(footer, /aria-label="Instagram"/);
  assert.match(footer, /aria-label="TikTok"/);
  assert.match(footer, /href="\/guides\/"/);
  const headerEnd = html.indexOf("</header>");
  const header = html.slice(html.indexOf("<header"), headerEnd);
  assert.match(header, /href="\/guides\/"/);
  assert.equal((header.match(/Request to Book/g) || []).length, 1, page.file);
  assert.match(header, /header-cta/);
  assert.equal(header.includes("nav-book"), false, page.file);
  assert.equal(/Hulu/i.test(html), false, page.file);
  assert.equal(html.includes("Listed items are the amenities"), false, page.file);
  assert.equal(html.includes("fonts.googleapis.com"), false, page.file);
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
  assert.equal(html.includes("Notes from the house"), false, page.file);
  assert.equal(html.includes("Guides for a large gulf-front rental near Destin"), false, page.file);
  assert.equal(html.includes("Why the private beach is the week"), false, page.file);
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
assert.match(home, /src="\/images\/hero-collage\.jpg"/);
assert.match(home, /width="1916" height="821"/);
assert.equal(home.includes('src="/images/hero.jpg"'), false);
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
assert.equal((gallery.match(/data-shot/g) || []).length, 51);
assert.match(gallery, /images\/gallery\/26\.jpg/);
assert.match(gallery, /images\/gallery\/27\.jpg/);
assert.match(gallery, /images\/gallery\/51\.jpg/);
assert.match(home, /data-filmstrip/);
assert.match(home, /data-film-next/);
assert.equal((home.match(/data-shot/g) || []).length, 51);
assert.match(home, /images\/gallery\/51\.jpg/);
assert.equal(home.includes("/images/gallery/52.jpg"), false);
assert.equal(home.includes("/images/gallery/53.jpg"), false);
assert.equal(home.includes("/images/gallery/54.jpg"), false);
assert.equal(home.includes("/images/gallery/55.jpg"), false);
assert.equal(gallery.includes("/images/gallery/52.jpg"), false);
assert.equal(gallery.includes("/images/gallery/53.jpg"), false);
assert.equal(gallery.includes("/images/gallery/54.jpg"), false);
assert.equal(gallery.includes("/images/gallery/55.jpg"), false);
assert.match(home, /images\/gallery\/26\.jpg/);
const location = read("location/index.html");
const locationMain = location.slice(location.indexOf("<main"), location.indexOf("</main>"));
assert.equal((locationMain.match(/<img\b/g) || []).length, 0);
assert.match(locationMain, /330 Tango Mar Drive/);
assert.match(gallery, /src="\/images\/tour\.mp4"/);
assert.match(home, /src="\/images\/tour\.mp4"/);
assert.equal(gallery.includes("could not be saved"), false);
assert.equal(home.includes("could not be saved"), false);
assert.equal(read("README.md").includes("could not be saved"), false);

const guidesHub = read("guides/index.html");
const guidesHeader = guidesHub.slice(guidesHub.indexOf("<header"), guidesHub.indexOf("</header>"));
assert.match(guidesHeader, /href="\/guides\/" aria-current="page"/);
assert.match(guidesHub, /Why private beach access matters/);
assert.match(guidesHub, /private beach and boardwalk/);
assert.equal(guidesHub.includes("/images/gallery/07.jpg"), false);
assert.equal(guidesHub.includes("/images/gallery/34.jpg"), false);
const beachGuide = read("guides/private-beach-access/index.html");
const beachHeader = beachGuide.slice(beachGuide.indexOf("<header"), beachGuide.indexOf("</header>"));
assert.match(beachHeader, /href="\/guides\/" aria-current="page"/);
assert.match(beachGuide, /Sleeps 24/);
assert.match(beachGuide, /private pool and hot tub/i);
assert.match(beachGuide, /elevator/i);
assert.match(beachGuide, /Request to Book/);
assert.equal(beachGuide.includes("eatingindestin"), false);

const things = read("guides/things-to-do-nearby/index.html");
assert.match(things, /https:\/\/www\.eatingindestin\.com/);
assert.equal((things.match(/eatingindestin\.com/g) || []).length, 1);
const miramar = read("guides/miramar-beach-vs-destin/index.html");
assert.equal((miramar.match(/eatingindestin\.com/g) || []).length, 1);
const choosing = read("guides/large-beach-house/index.html");
assert.equal(choosing.includes("eatingindestin"), false);
assert.match(choosing, /floors 1/);
assert.match(choosing, /does not go to the parking level/);

const sitemap = read("sitemap.xml");
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length);
assert.equal(sitemap.includes("404"), false);
for (const page of pages) {
  assert.match(sitemap, new RegExp(`<loc>https://seaclusion\\.house${page.path.replaceAll("/", "\\/")}</loc>`));
}
const robots = read("robots.txt");
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Allow: \//);
assert.match(robots, /Sitemap: https:\/\/seaclusion\.house\/sitemap\.xml/);
assert.match(home, /"url":"https:\/\/seaclusion\.house\/"/);

console.log(`passed ${pages.length} pages`);
