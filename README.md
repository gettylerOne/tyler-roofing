# Tyler Roofing &amp; Home Solutions — Website

Static marketing site for Tyler Roofing &amp; Home Solutions (mobile, come-to-you roofing and home services serving
the Birmingham metro and central Alabama). Plain HTML / CSS / JS, no framework; `node tools/build.mjs` prepares `dist/` for deployment. Rebuilt from a Claude Design prototype.

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
HTML — `node tools/build.mjs` prepares `dist/` for deployment.

## Notes / things to swap in later

- **Photos** — hero, services, and gallery images are Unsplash placeholders.
  Real Tyler Roofing photos (logo, drone shots, gutter before/after, storm
  damage) are in `assets/img/`. Swap remaining Unsplash URLs as photos come in.
- **Reviews** — Unverified testimonials and rating claims were removed, along
  with invented reviews and placeholder sections. Do not restore invented or
  unsourced reviews. `assets/js/data.js` keeps the additional review pool empty
  until authentic, sourced reviews with permission are supplied.
- **Contact and booking forms** submit to Netlify Forms. The event handler forwards
  leads to Flint and supports configurable confirmation emails, team alerts, and
  one-time team reminders. Email delivery is off until configured; see
  [backend setup](netlify/LEAD-SETUP.md). Existing form UI is unchanged.
- **Slots to fill** — BBB accreditation, social URLs, and the real Google review
  link are still placeholders. The AL roofing license number (# 31643) is filled
  in, in the `app.js` footer and the home-page trust badge.
