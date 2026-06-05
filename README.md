# Tyler Roofing &amp; Home Solutions — Website

Static marketing site for Tyler Roofing &amp; Home Solutions (Columbiana, AL — serving
the Birmingham metro). Plain HTML / CSS / JS, no framework, no build step required
to serve. Rebuilt from a Claude Design prototype.

## Running it

It's a static site — open `index.html` in a browser, or serve the folder:

```
npx serve .
```

(Serving over HTTP rather than `file://` is recommended so the Leaflet map tiles
and Google Fonts load without cross-origin quirks.)

## Structure

```
index.html            Home
services.html          Services + materials overview
about.html             About / company story
storm.html             Storm & insurance resource
reviews.html           Reviews + recent work
faq.html               FAQ (filterable)
contact.html           Contact form + map
financing.html         Financing
privacy.html           Privacy policy
areas.html             Service-area index
materials.html         Materials index
areas/<city>.html      13 per-city landing pages   (generated)
materials/<mat>.html   6 per-material landing pages (generated)

assets/css/styles.css  Design system + all component styles
assets/js/app.js       Shared header/footer + all interactivity
assets/js/data.js      Map coordinates + review-marquee data
assets/img/            Logo and photo assets
tools/generate.mjs     Generator for the city + material pages
```

## Shared header & footer

The nav and footer are injected by `assets/js/app.js` into the `#site-header`
and `#site-footer` placeholders on every page — edit them in one place. Each
page's `<title>`, `<meta description>`, `<h1>`, and body content live in its own
HTML file for SEO.

## City &amp; material pages

The 13 city pages and 6 material pages are data-driven and near-identical, so
they're generated. Edit the data or templates in `tools/generate.mjs`, then:

```
node tools/generate.mjs
```

This rewrites `areas/*.html` and `materials/*.html`. The output is plain static
HTML — no build step is needed to serve the site.

## Notes / things to swap in later

- **Photos** — hero, services, and gallery images are Unsplash placeholders.
  Real Tyler Roofing photos (logo, drone shots, gutter before/after, storm
  damage) are in `assets/img/`. Swap remaining Unsplash URLs as photos come in.
- **Reviews** — Mike Thompson's review is real; the rest are clearly-marked
  placeholders. The scrolling marquee reviews live in `assets/js/data.js`.
- **Contact form** — currently front-end only (validates, shows a confirmation).
  Wire it to an email/CRM endpoint before launch.
- **Booking flow** — the multi-step inspection modal is front-end only; it
  collects details and confirms but doesn't submit anywhere yet.
- **Slots to fill** — AL license number, BBB accreditation, social URLs, and the
  real Google review link are placeholders throughout.
