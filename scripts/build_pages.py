#!/usr/bin/env python3
"""Write the static Seaclusion pages. Facts come from the Wix site only."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "site.config.json").read_text())
ORIGIN = (CONFIG.get("origin") or "").rstrip("/")

PHONE_DISPLAY = "(800) 208-2324"
PHONE_TEL = "+18002082324"
EMAIL = "reservations@fivestargulfrentals.com"
ADDRESS = "330 Tango Mar Drive, Miramar Beach, FL 32550"
FIVE_STAR = "https://www.fivestargulfrentals.com/destin-30a-vacation-rentals/seaclusion"
INSTAGRAM = "https://www.instagram.com/seaclusionhome/"
TIKTOK = "https://www.tiktok.com/@seaclusion_destin"
FACEBOOK = "https://www.facebook.com/SeaclusionHome/"
MAP_EMBED = "https://www.openstreetmap.org/export/embed.html?bbox=-86.356%2C30.365%2C-86.331%2C30.379&amp;layer=mapnik&amp;marker=30.3719874%2C-86.3436691"
MAP_LINK = "https://www.openstreetmap.org/?mlat=30.37199&amp;mlon=-86.34367#map=17/30.37199/-86.34367"
DIRECTIONS = "https://www.google.com/maps/search/?api=1&amp;query=330+Tango+Mar+Drive%2C+Miramar+Beach%2C+FL+32550"

NAV = [
    ("/", "Home"),
    ("/amenities/", "Amenities"),
    ("/floorplans/", "Floor Plans"),
    ("/gallery/", "Gallery"),
    ("/location/", "Location"),
    ("/tips/", "House Tips"),
]

GALLERY = [
    ("01.jpg", "Gulf-front exterior of Seaclusion at dusk in Miramar Beach"),
    ("02.jpg", "Private pool and hot tub on the gulf side of the house"),
    ("03.jpg", "Living room with seating that faces the gulf"),
    ("04.jpg", "Bedroom with a king bed"),
    ("05.jpg", "Bedroom with a king bed and a door to a balcony"),
    ("06.jpg", "Kitchen with gulf-facing windows"),
    ("07.jpg", "Bunk room with twin-over-twin bunk beds"),
    ("08.jpg", "Bathroom with a soaking tub"),
    ("09.jpg", "Living area with a sectional sofa"),
    ("10.jpg", "Living room seating and gulf-facing windows"),
    ("11.jpg", "Kitchen with an island and a view of the gulf"),
    ("12.jpg", "View from a covered deck toward the gulf"),
    ("13.jpg", "Outdoor lounge seating beside the pool"),
    ("14.jpg", "Pool and hot tub with the house behind them"),
    ("15.jpg", "Covered deck with lounge seating"),
    ("16.jpg", "Covered deck set with a dining table"),
    ("17.jpg", "Another view of the private pool and hot tub"),
    ("18.jpg", "Bedroom at Seaclusion"),
    ("19.jpg", "Bathroom with dual sinks"),
    ("20.jpg", "Bedroom with a king bed"),
    ("21.jpg", "Primary bathroom with a soaking tub and a walk-in shower"),
    ("22.jpg", "Bathroom with a glass-enclosed shower"),
    ("23.jpg", "Living room with a fireplace and a gulf view"),
    ("24.jpg", "Outdoor dining on a covered deck"),
    ("25.jpg", "Upper deck looking out over the gulf"),
    ("26.jpg", "Dusk view of the gulf-front house from above"),
    ("27.jpg", "Exterior of the beachfront house"),
]


def abs_url(path):
    if ORIGIN:
        return ORIGIN + path
    return path


def head(page):
    canonical = abs_url(page["path"])
    image = abs_url(page.get("image", "/images/og.jpg"))
    robots = page.get("robots", "index,follow")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{page["title"]}</title>
  <meta name="description" content="{page["description"]}">
  <meta name="robots" content="{robots}">
  <link rel="canonical" href="{canonical}">
  <meta property="og:title" content="{page["title"]}">
  <meta property="og:description" content="{page["description"]}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="Seaclusion">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="{image}">
  <meta property="og:image:alt" content="Gulf-front exterior of Seaclusion, a beach home in Miramar Beach, Florida.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page["title"]}">
  <meta name="twitter:description" content="{page["description"]}">
  <meta name="twitter:image" content="{image}">
  <meta name="theme-color" content="#0e4c56">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/styles.css">
  {page.get("schema", "")}
</head>
"""


def header(current):
    links = []
    for href, label in NAV:
        current_attr = ' aria-current="page"' if href == current else ""
        links.append(f'<a href="{href}"{current_attr}>{label}</a>')
    book_current = ' aria-current="page"' if current == "/contact/" else ""
    return f"""<a class="skip" href="#content">Skip to content</a>
<div class="utility">
  <div class="utility-inner">
    <p>Miramar Beach · Destin, Florida</p>
    <p><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></p>
  </div>
</div>
<header class="site-header">
  <div class="header-inner">
    <a class="logo" href="/">
      <img src="/images/logo.png" alt="Seaclusion" width="1440" height="150">
    </a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" data-nav aria-label="Primary">
      {"".join(links)}
    </nav>
    <a class="btn btn-solid header-cta" href="/contact/"{book_current}>Request to Book</a>
  </div>
</header>
"""


def social_link(href, label, path):
    return (
        f'<li><a href="{href}" aria-label="{label}">'
        f'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
        f'<path fill="currentColor" d="{path}"/></svg></a></li>'
    )


def footer():
    facebook = social_link(
        FACEBOOK,
        "Facebook",
        "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    )
    instagram = social_link(
        INSTAGRAM,
        "Instagram",
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
    )
    tiktok = social_link(
        TIKTOK,
        "TikTok",
        "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    )
    return f"""<footer class="site-footer">
  <div class="wrap-wide footer-grid">
    <div>
      <img src="/images/logo.png" alt="Seaclusion" width="1440" height="150" style="height:34px;width:auto;filter:brightness(0) invert(1)">
    </div>
    <div>
      <h2>Explore</h2>
      <ul>
        <li><a href="/amenities/">Amenities</a></li>
        <li><a href="/floorplans/">Floor plans</a></li>
        <li><a href="/gallery/">Gallery</a></li>
        <li><a href="/location/">Location</a></li>
        <li><a href="/tips/">House tips</a></li>
      </ul>
    </div>
    <div>
      <h2>Reservations</h2>
      <p><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></p>
      <p><a href="mailto:{EMAIL}">{EMAIL}</a></p>
      <p>Mention Seaclusion.</p>
      <p><a href="{FIVE_STAR}">Five Star Gulf Rentals</a></p>
    </div>
    <div>
      <h2>Follow</h2>
      <ul class="socials">
        {facebook}
        {instagram}
        {tiktok}
      </ul>
      <p><a href="/contact/">Request to book</a></p>
    </div>
  </div>
  <div class="wrap-wide legal">
    <p>Seaclusion Beach Home is a gulf-front vacation rental in Miramar Beach. 9 bedrooms, a private pool and hot tub, and a private beach. Sleeps 24.</p>
  </div>
</footer>
<script src="/site.js"></script>
"""


def cta():
    return f"""<section class="cta-band" aria-labelledby="book-heading">
  <div class="wrap">
    <p class="kicker">Plan your next vacation</p>
    <h2 id="book-heading">Request to book Seaclusion</h2>
    <p>Tell us your travel dates. We will get back to you ASAP. Call <a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a> or email <a href="mailto:{EMAIL}">{EMAIL}</a>. Mention Seaclusion.</p>
    <div class="actions">
      <a class="btn btn-solid" href="/contact/">Send an inquiry</a>
      <a class="btn btn-light" href="{FIVE_STAR}">Check availability with Five Star</a>
    </div>
  </div>
</section>
"""


def crumbs(label):
    return f'<p class="crumbs"><a href="/">Home</a> <span aria-hidden="true">/</span> {label}</p>'


def lodging_schema():
    url = abs_url("/")
    data = {
        "@context": "https://schema.org",
        "@type": ["VacationRental", "LodgingBusiness"],
        "name": "Seaclusion Beach Home",
        "description": "Gulf-front vacation rental at 330 Tango Mar Drive, Miramar Beach, Florida. Nine bedrooms, private pool and hot tub, private beach. Sleeps 24.",
        "telephone": "+1-800-208-2324",
        "email": EMAIL,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "330 Tango Mar Drive",
            "addressLocality": "Miramar Beach",
            "addressRegion": "FL",
            "postalCode": "32550",
            "addressCountry": "US",
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 30.3719874,
            "longitude": -86.3436691,
        },
        "petsAllowed": True,
        "numberOfRooms": 9,
        "containsPlace": {
            "@type": "Accommodation",
            "name": "Seaclusion Beach Home",
            "numberOfBedrooms": 9,
            "numberOfBathroomsTotal": 7.5,
            "occupancy": {"@type": "QuantitativeValue", "maxValue": 24, "unitText": "guests"},
            "floorSize": {"@type": "QuantitativeValue", "value": 5700, "unitCode": "FTK"},
        },
        "amenityFeature": [
            {"@type": "LocationFeatureSpecification", "name": "Gulf front", "value": True},
            {"@type": "LocationFeatureSpecification", "name": "Private beach", "value": True},
            {"@type": "LocationFeatureSpecification", "name": "Swimming pool", "value": True},
            {"@type": "LocationFeatureSpecification", "name": "Hot tub", "value": True},
            {"@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": True},
            {"@type": "LocationFeatureSpecification", "name": "Elevator", "value": True},
            {"@type": "LocationFeatureSpecification", "name": "Pet friendly", "value": True},
        ],
        "sameAs": [
            "https://marc12345678.wixsite.com/seaclusion",
            FIVE_STAR,
            INSTAGRAM,
            TIKTOK,
            FACEBOOK,
        ],
    }
    if ORIGIN:
        data["url"] = url
        data["image"] = [abs_url("/images/hero-collage.jpg"), abs_url("/images/gallery/02.jpg"), abs_url("/images/gallery/06.jpg")]
    return '<script type="application/ld+json">' + json.dumps(data, separators=(",", ":")) + "</script>"


def page_shell(page, main):
    html = head(page)
    html += "<body>\n"
    html += header(page["path"] if page["path"] != "/404.html" else "")
    html += f'<main id="content">\n{main}\n</main>\n'
    if page.get("cta", True):
        html += cta()
    if page.get("lightbox"):
        html += """<dialog class="lightbox" data-lightbox aria-label="Photo">
  <img alt="" data-lightbox-img>
  <div class="lightbox-bar">
    <button type="button" data-prev>Previous</button>
    <p data-lightbox-caption></p>
    <button type="button" data-next>Next</button>
    <form method="dialog"><button>Close</button></form>
  </div>
</dialog>
"""
    html += footer()
    html += "</body>\n</html>\n"
    return html


def tour_video():
    return """<figure class="tour">
      <video controls playsinline preload="metadata" width="406" height="720">
        <source src="/images/tour.mp4" type="video/mp4">
      </video>
      <figcaption>Video tour of Seaclusion, the gulf-front home in Miramar Beach.</figcaption>
    </figure>"""


def shot(filename, alt, eager=False):
    loading = "eager" if eager else "lazy"
    return (
        f'<button class="shot" type="button" data-shot>'
        f'<img src="/images/gallery/{filename}" alt="{alt}" width="1600" height="1067" loading="{loading}">'
        f"</button>"
    )


def home():
    strip = "".join(shot(name, alt, eager=(i < 3)) for i, (name, alt) in enumerate(GALLERY))
    main = f"""
<section class="hero">
  <img src="/images/hero-collage.jpg" alt="Collage of the gulf-front Seaclusion house, private pool, beach boardwalk, and decks in Miramar Beach" width="1916" height="821">
</section>
<section class="intro-panel">
  <div class="wrap">
    <div class="intro-card">
      <p class="kicker">Seaclusion Beach Home</p>
      <h1>Luxury Beachfront Home in Destin</h1>
      <p class="address">{ADDRESS}</p>
      <p class="lede">Beachfront · 9 bedrooms · Pool &amp; hot tub · Private beach</p>
      <div class="actions">
        <a class="btn btn-solid" href="/contact/">Request to Book</a>
        <a class="btn btn-line" href="/gallery/">View the gallery</a>
      </div>
    </div>
    <div class="stats" aria-label="Home at a glance">
      <div><strong>24</strong><span>Sleeps</span></div>
      <div><strong>9</strong><span>Bedrooms</span></div>
      <div><strong>7.5</strong><span>Baths</span></div>
      <div><strong>5,700</strong><span>Sq ft</span></div>
      <div><strong>Pool</strong><span>And hot tub</span></div>
      <div><strong>Gulf</strong><span>Front</span></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <figure class="frame">
      <img src="/images/gallery/26.jpg" alt="Dusk view of the gulf-front house from above" width="1600" height="1066">
    </figure>
    <div class="prose">
      <p class="kicker">The house</p>
      <h2>A gulf-front home with room for a full gathering</h2>
      <p>Seaclusion sleeps 24 comfortably. It is a 5,700 square foot beachfront house in Miramar Beach, with an elevator for floors 1–3. The elevator does not go to the parking level.</p>
      <p>The space is suited to large family getaways, corporate retreats, and groups. The house has been remodeled with new furniture, fresh paint, and an updated kitchen, in a casually chic coastal style.</p>
      <p>It sits on the gulf, with a private beach, and away from the busier beaches of Destin.</p>
      <p><a href="/amenities/">See home information and amenities</a></p>
    </div>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="audience">
      <article>
        <h3>Large family getaways</h3>
        <p>Nine bedrooms, two living rooms, and two kitchens give a big family room to spread out, with a private pool, hot tub, and the gulf out front.</p>
      </article>
      <article>
        <h3>Corporate retreats</h3>
        <p>The same gulf-front house works when a group wants everyone under one roof: 5,700 square feet, covered decks, and parking for seven.</p>
      </article>
      <article>
        <h3>Groups of 24</h3>
        <p>Seaclusion sleeps 24. An elevator connects floors 1–3, and the house is pet friendly, with Wi-Fi throughout.</p>
      </article>
    </div>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="rule">
      <div>
        <p class="kicker">Favorite features</p>
        <h2>What the house is known for</h2>
      </div>
    </div>
    <ul class="features">
      <li>Gulf front</li>
      <li>Private beach access</li>
      <li>Private pool and hot tub</li>
      <li>Covered patio with games</li>
      <li>In-home elevator</li>
      <li>4 included bikes</li>
      <li>Complimentary beach chairs, in season</li>
    </ul>
  </div>
</section>
<section class="section" style="background:var(--foam)">
  <div class="wrap">
    <div class="rule">
      <div>
        <p class="kicker">Three living floors</p>
        <h2>How 9 bedrooms are arranged</h2>
        <p>A queen bedroom finishes the first floor. Five bedrooms are on the second floor. The third floor holds the primary suite and two more queen bedrooms.</p>
      </div>
      <a class="btn btn-line" href="/floorplans/">Read the floor plans</a>
    </div>
    <div class="floors">
      <article>
        <h3>First floor</h3>
        <p>Main living area, formal dining room, kitchen and breakfast nook, plus a queen bedroom and a shared bathroom. Patio doors open toward the gulf and a private beach boardwalk.</p>
      </article>
      <article>
        <h3>Second floor</h3>
        <p>A living space with a futon, lounge chairs, and a TV. Two gulf-front king bedrooms with private balconies, another king, a queen, and a bunk room with two twin-over-twin bunks.</p>
      </article>
      <article>
        <h3>Third floor</h3>
        <p>A full kitchen and a primary suite with a king bed, private balcony, and a remodeled bath. Two additional queen bedrooms are on this floor.</p>
      </article>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap-wide">
    <div class="rule">
      <div>
        <p class="kicker">Gallery</p>
        <h2>The gulf, the pool, and the rooms</h2>
        <p>Photographs from the Seaclusion gallery: the beachfront house, private pool and hot tub, kitchens, and bedrooms. Swipe across the row, or use the arrows, to see more.</p>
      </div>
      <a class="btn btn-line" href="/gallery/">Open the full gallery</a>
    </div>
    <div class="filmstrip-wrap">
      <div class="filmstrip" data-filmstrip tabindex="0" aria-label="Seaclusion photos">
        {strip}
      </div>
      <div class="film-nav">
        <p class="note">Swipe for more photos.</p>
        <div class="actions">
          <button class="btn btn-line" type="button" data-film-prev>Previous</button>
          <button class="btn btn-line" type="button" data-film-next>Next</button>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap tour-layout">
    <div class="prose">
      <p class="kicker">Video tour</p>
      <h2>Walk through the gulf-front house</h2>
      <p>This is the Seaclusion video tour: the beachfront home at {ADDRESS}, with the private pool and hot tub, the rooms, and the gulf.</p>
      <p><a href="/gallery/">See the tour with the photo gallery</a></p>
    </div>
    {tour_video()}
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap split">
    <div class="prose">
      <p class="kicker">Location</p>
      <h2>Gulf front in Miramar Beach</h2>
      <p>{ADDRESS}</p>
      <p>The house is gulf front, with private beach access and a private beach boardwalk. The seclusion from the busy beaches of Destin is part of the stay.</p>
      <p><a href="/location/">Map and directions</a></p>
    </div>
    <div class="map-frame">
      <iframe title="Map of Seaclusion at 330 Tango Mar Drive, Miramar Beach" src="{MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>
"""
    return main


def amenities():
    items = [
        ("9 bedrooms", "Nine bedrooms across three living floors, including gulf-front kings, queens, and a bunk room."),
        ("2 living rooms", "A main living room on the first floor and a second living space on the second floor."),
        ("7.5 bathrooms", "Seven and a half baths, including a shared bath on the first floor and a remodeled primary bath."),
        ("Swimming pool", "A private swimming pool on the gulf side of the house."),
        ("Hot tub", "A private hot tub with the pool."),
        ("Parking for 7", "Seven parking places."),
        ("4 covered decks", "Four covered decks, including space that looks out to the gulf."),
        ("Pet friendly", "The house is pet friendly."),
        ("2 laundry rooms", "Two laundry rooms. The primary closet also has a washer and dryer."),
        ("2 kitchens", "A first-floor kitchen with KitchenAid appliances and gulf views, and a full kitchen on the third floor."),
        ("Wi-Fi", "Wi-Fi is available in the house."),
        ("Sleeps 24", "The house sleeps 24 comfortably."),
        ("Gulf front", "The home is gulf front, with a private beach and private beach access."),
        ("In-home elevator", "The elevator serves floors 1–3. It does not go to the parking level."),
        ("4 bikes", "Four bikes are included."),
        ("Beach chairs", "Complimentary beach chairs are available in season."),
        ("Covered patio with games", "A covered patio with games sits with the outdoor space."),
        ("Smart TVs", "The TVs are smart TVs with access to your streaming accounts."),
    ]
    cards = "".join(f"<article><h3>{title}</h3><p>{text}</p></article>" for title, text in items)
    main = f"""
<header class="page-hero">
  <div class="wrap">
    {crumbs("Amenities")}
    <p class="kicker">Home information</p>
    <h1>Amenities at this Miramar Beach gulf-front home</h1>
    <p class="lede">5,700 sq ft · 9 bedrooms · pool and hot tub · private beach · sleeps 24</p>
  </div>
</header>
<section class="section">
  <div class="wrap prose" style="max-width:46rem">
    <p>Seaclusion is a luxury beachfront home at {ADDRESS}. It sleeps 24 comfortably and has an elevator for easy access to floors 1–3. The elevator does not go to the parking level.</p>
    <p>The remodel brought new furniture, fresh paint, and an updated kitchen, with a casually chic coastal feel. The house is a fit for large family getaways, corporate retreats, and groups, set apart from the busier beaches of Destin.</p>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="amenity-grid">{cards}</div>
    <div class="actions">
      <a class="btn btn-solid" href="/contact/">Request to Book</a>
      <a class="btn btn-line" href="/floorplans/">See how the floors are laid out</a>
    </div>
  </div>
</section>
"""
    return main


def floorplans():
    main = f"""
<header class="page-hero">
  <div class="wrap">
    {crumbs("Floor plans")}
    <p class="kicker">9 bedrooms · sleeps 24</p>
    <h1>Floor plans for this 9-bedroom Destin beach house</h1>
    <p class="lede">Three living floors at {ADDRESS}, with two kitchens, gulf-view bedrooms, and a private pool outside.</p>
  </div>
</header>
<section class="section">
  <div class="wrap">
    <article>
      <p class="kicker">Ground level</p>
      <h2>First floor</h2>
      <figure class="plan">
        <img src="/images/floorplans/first-floor.webp" alt="First-floor plan of Seaclusion" width="1800" height="1020">
      </figure>
      <div class="prose" style="max-width:46rem">
        <p>Enter on the ground level and you will find the main living area, formal dining room, and kitchen and breakfast nook. The living room is furnished with a new couch, chairs, and a flat screen TV that hangs above the fireplace. The living room opens to the kitchen, which has the same gulf views.</p>
        <p>The kitchen has KitchenAid appliances. Patio doors lead toward the shore. Seaclusion also has access to a private beach boardwalk. A queen bedroom and a shared bathroom finish the first floor.</p>
      </div>
    </article>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap">
    <article>
      <p class="kicker">Five bedrooms</p>
      <h2>Second floor</h2>
      <figure class="plan">
        <img src="/images/floorplans/second-floor.webp" alt="Second-floor plan of Seaclusion" width="1800" height="1054">
      </figure>
      <div class="prose" style="max-width:46rem">
        <p>On the second floor, a living space is furnished with a futon, lounge chairs, and a flat screen TV. Five bedrooms are placed through the floor. Two have gulf views and a private balcony.</p>
        <p>The beds are two gulf-front kings, one additional king, one queen, and a bunk room with two twin-over-twin bunk beds.</p>
      </div>
    </article>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap">
    <article>
      <p class="kicker">Primary suite</p>
      <h2>Third floor</h2>
      <figure class="plan">
        <img src="/images/floorplans/third-floor.webp" alt="Third-floor plan of Seaclusion" width="1800" height="1066">
      </figure>
      <div class="prose" style="max-width:46rem">
        <p>The third floor has a full kitchen and a primary suite. The room has a king-size bed, a leather lounge chair, and a large flat screen TV with a Sonos sound bar, plus a private balcony.</p>
        <p>The remodeled primary bath has a Roman soaking tub, a dual-headed shower, and two water closets. The walk-in closet has a washer and dryer. Two additional queen bedrooms are on this floor.</p>
        <p>The in-home elevator reaches floors 1–3 and does not serve the parking level.</p>
      </div>
    </article>
  </div>
</section>
"""
    return main


def gallery():
    grid = "".join(shot(name, alt, eager=(i < 3)) for i, (name, alt) in enumerate(GALLERY))
    main = f"""
<header class="page-hero">
  <div class="wrap">
    {crumbs("Gallery")}
    <p class="kicker">Video tour and photographs</p>
    <h1>Photos of the gulf-front home in Miramar Beach</h1>
    <p class="lede">Seaclusion at {ADDRESS}: the beachfront house, private pool and hot tub, kitchens, bedrooms, and decks.</p>
  </div>
</header>
<section class="section">
  <div class="wrap">
    <div class="rule">
      <div>
        <p class="kicker">Video tour</p>
        <h2>Play the walk-through</h2>
      </div>
    </div>
    {tour_video()}
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap-wide">
    <div class="gallery-grid">{grid}</div>
  </div>
</section>
"""
    return main


def location():
    main = f"""
<header class="page-hero">
  <div class="wrap">
    {crumbs("Location")}
    <p class="kicker">Miramar Beach · Destin</p>
    <h1>A gulf-front address in Miramar Beach</h1>
    <p class="lede">{ADDRESS}</p>
  </div>
</header>
<section class="section">
  <div class="wrap split">
    <div class="prose">
      <p>Seaclusion is a gulf-front vacation rental on a private beach in Miramar Beach, Florida, in the Destin area. The house sleeps 24, with 9 bedrooms, a private pool and hot tub, and private beach access.</p>
      <p>A private beach boardwalk leads toward the shore. The setting is removed from the busier beaches of Destin, which is the point of the stay: a quieter stretch of gulf for a large family, a retreat, or a group.</p>
      <p>An elevator serves floors 1–3 inside the house. It does not go to the parking level. There are seven parking places.</p>
      <div class="actions">
        <a class="btn btn-solid" href="{DIRECTIONS}">Directions to 330 Tango Mar Drive</a>
        <a class="btn btn-line" href="{MAP_LINK}">Open the map</a>
      </div>
    </div>
    <div class="map-frame">
      <iframe title="Map of Seaclusion at 330 Tango Mar Drive, Miramar Beach" src="{MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>
"""
    return main


def tips():
    main = f"""
<header class="page-hero">
  <div class="wrap">
    {crumbs("House tips")}
    <p class="kicker">For guests</p>
    <h1>House tips for your stay at Seaclusion</h1>
    <p class="lede">A few notes from the owners of this Miramar Beach gulf-front home.</p>
  </div>
</header>
<section class="section">
  <div class="wrap tips">
    <div>
      <p class="pull">Seaclusion is privately owned and used regularly by the owners. Please help protect the house, the furniture, and the belongings so future guests can enjoy them too.</p>
      <p>The house sleeps 24 at {ADDRESS}. Questions before you arrive can go to <a href="mailto:{EMAIL}">{EMAIL}</a> or <a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a>.</p>
    </div>
    <ol class="tip-list">
      <li>
        <strong>Elevator</strong>
        Both elevator doors must be closed for the elevator to operate. While inside, wait until you hear it click before opening the first door. The elevator serves floors 1–3 and does not go to the parking level.
      </li>
      <li>
        <strong>Televisions</strong>
        The TVs are smart TVs with access to your streaming accounts.
      </li>
      <li>
        <strong>Balcony doors</strong>
        Hurricane locks are on the balcony doors. To lock or unlock, move the handle to the up position before turning the deadbolt.
      </li>
    </ol>
  </div>
</section>
"""
    return main


def contact():
    main = f"""
<header class="page-hero">
  <div class="wrap">
    {crumbs("Request to book")}
    <p class="kicker">Inquiry</p>
    <h1>Request to book this Miramar Beach home</h1>
    <p class="lede">Seaclusion sleeps 24. Nine bedrooms, a private pool and hot tub, and a private beach on the gulf.</p>
  </div>
</header>
<section class="section">
  <div class="wrap contact-grid">
    <form class="form-card" data-contact-form action="/api/contact" method="post">
      <h2>Plan your next vacation</h2>
      <p>We will get back to you ASAP. Mention Seaclusion if you call or email instead.</p>
      <div class="hp" aria-hidden="true">
        <label for="company">Company</label>
        <input id="company" name="company" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="fields">
        <label for="name">Name
          <input id="name" name="name" type="text" autocomplete="name" required maxlength="80">
        </label>
        <label for="phone">Phone
          <input id="phone" name="phone" type="tel" autocomplete="tel" maxlength="40">
        </label>
        <label for="email">Email
          <input id="email" name="email" type="email" autocomplete="email" required maxlength="254">
        </label>
        <label for="dates">Travel dates
          <input id="dates" name="dates" type="text" maxlength="120" autocomplete="off">
        </label>
        <label class="span-2" for="message">Message
          <textarea id="message" name="message" required maxlength="4000"></textarea>
        </label>
        <label class="check span-2">
          <input name="updates" type="checkbox" value="yes">
          <span>Email me Seaclusion updates at this address.</span>
        </label>
      </div>
      <div class="actions">
        <button class="btn btn-solid" type="submit">Submit inquiry</button>
      </div>
      <p class="form-status" data-form-status role="status" aria-live="polite"></p>
    </form>
    <aside class="aside-card">
      <h2>Reservations</h2>
      <p>The inquiry form sends a note to the Seaclusion desk. You can also reach the booking contacts directly.</p>
      <dl>
        <dt>Email</dt>
        <dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd>
        <dt>Phone</dt>
        <dd><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></dd>
        <dt>Address</dt>
        <dd>{ADDRESS}</dd>
        <dt>Availability</dt>
        <dd><a href="{FIVE_STAR}">Five Star Gulf Rentals listing</a></dd>
      </dl>
      <p class="note">Make sure to mention “Seaclusion.” Rates are quoted when you inquire. They are not listed on this site.</p>
    </aside>
  </div>
</section>
"""
    return main


def not_found():
    return """
<header class="page-hero">
  <div class="wrap">
    <p class="kicker">404</p>
    <h1>That page is not on this site</h1>
    <p class="lede">The Seaclusion pages are linked below. The house is still at 330 Tango Mar Drive, Miramar Beach.</p>
    <div class="actions">
      <a class="btn btn-solid" href="/">Back to the home page</a>
      <a class="btn btn-line" href="/contact/">Request to Book</a>
    </div>
  </div>
</header>
"""


PAGES = [
    {
        "path": "/",
        "file": ROOT / "index.html",
        "title": "Seaclusion | Gulf-Front 9-Bedroom Vacation Rental in Miramar Beach",
        "description": "Seaclusion is a 5,700 sq ft gulf-front vacation rental at 330 Tango Mar Drive, Miramar Beach, Florida. Nine bedrooms, a private pool and hot tub, and a private beach. Sleeps 24.",
        "image": "/images/og.jpg",
        "schema": lodging_schema(),
        "lightbox": True,
        "body": home,
    },
    {
        "path": "/amenities/",
        "file": ROOT / "amenities" / "index.html",
        "title": "Amenities | 9-Bedroom Gulf-Front Rental in Miramar Beach | Seaclusion",
        "description": "Pool, hot tub, two kitchens, 7.5 baths, an elevator, and gulf-front decks at Seaclusion, a pet-friendly 9-bedroom rental in Miramar Beach that sleeps 24.",
        "schema": lodging_schema(),
        "body": amenities,
    },
    {
        "path": "/floorplans/",
        "file": ROOT / "floorplans" / "index.html",
        "title": "Floor Plans | 9-Bedroom Destin Beach House | Seaclusion",
        "description": "Floor plans for Seaclusion in Miramar Beach: three living floors, two kitchens, gulf-view king bedrooms, a bunk room, and a primary suite. Sleeps 24.",
        "schema": lodging_schema(),
        "body": floorplans,
    },
    {
        "path": "/gallery/",
        "file": ROOT / "gallery" / "index.html",
        "title": "Photo Gallery | Gulf-Front Seaclusion in Miramar Beach",
        "description": "Photos of Seaclusion, a 9-bedroom gulf-front vacation rental with a private pool, hot tub, and private beach at 330 Tango Mar Drive, Miramar Beach.",
        "schema": lodging_schema(),
        "lightbox": True,
        "body": gallery,
    },
    {
        "path": "/location/",
        "file": ROOT / "location" / "index.html",
        "title": "Location | 330 Tango Mar Drive, Miramar Beach | Seaclusion",
        "description": "Seaclusion is at 330 Tango Mar Drive, Miramar Beach, FL 32550, a gulf-front vacation rental with a private beach near Destin. Nine bedrooms, sleeps 24.",
        "schema": lodging_schema(),
        "body": location,
    },
    {
        "path": "/tips/",
        "file": ROOT / "tips" / "index.html",
        "title": "House Tips | Seaclusion Vacation Rental in Miramar Beach",
        "description": "Guest notes for Seaclusion in Miramar Beach: elevator doors, smart TVs, and hurricane locks on the balcony doors.",
        "schema": lodging_schema(),
        "body": tips,
    },
    {
        "path": "/contact/",
        "file": ROOT / "contact" / "index.html",
        "title": "Request to Book | Seaclusion Gulf-Front Rental, Miramar Beach",
        "description": "Inquire about Seaclusion, a 9-bedroom gulf-front rental at 330 Tango Mar Drive, Miramar Beach that sleeps 24. Call (800) 208-2324 or email reservations@fivestargulfrentals.com.",
        "schema": lodging_schema(),
        "cta": False,
        "body": contact,
    },
    {
        "path": "/404.html",
        "file": ROOT / "404.html",
        "title": "Page not found | Seaclusion Beach Home",
        "description": "That page is not on the Seaclusion site.",
        "robots": "noindex",
        "cta": False,
        "body": not_found,
    },
]


def write_sitemap():
    paths = [page["path"] for page in PAGES if page["path"] != "/404.html"]
    urls = []
    for path in paths:
        loc = abs_url(path)
        urls.append(
            f"  <url><loc>{loc}</loc><lastmod>2026-10-01</lastmod></url>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml)
    robots = (
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {abs_url('/sitemap.xml')}\n"
    )
    (ROOT / "robots.txt").write_text(robots)


def main():
    for page in PAGES:
        page["file"].parent.mkdir(parents=True, exist_ok=True)
        page["file"].write_text(page_shell(page, page["body"]()))
        print("wrote", page["file"].relative_to(ROOT))
    write_sitemap()
    print("wrote sitemap.xml robots.txt")


if __name__ == "__main__":
    main()
