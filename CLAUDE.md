# CLAUDE.md — Tyler Roofing &amp; Home Solutions site

Static marketing site for a Birmingham-metro roofing company (Jacob Tyler, owner;
HQ Columbiana, AL). Built 2026-05-22 from a Claude Design prototype. Plain HTML +
CSS + vanilla JS — no framework, no build step required to serve. The user
iterates on the site conversationally with me.

## How to view it while iterating

The site is normally served by `npx serve . -l 3000` (run in the background).
The user opens **http://localhost:3000** and refreshes after each change.
Before starting work, check whether a `serve` is already running; if not, start
one in the background.

## File layout — read this before editing anything

```
*.html                 11 hand-built pages: index, services, about, storm,
                         reviews, faq, contact, financing, privacy, areas,
                         materials
areas/<slug>.html      13 per-city landing pages  ← GENERATED, do not hand-edit
materials/<slug>.html   6 per-material pages       ← GENERATED, do not hand-edit
assets/css/styles.css  Design system + every component
assets/js/app.js       Header/footer injection + ALL interactivity (no other JS)
assets/js/data.js      Map coordinates + scrolling review marquee data
assets/img/            Real assets (logo + Jacob's drone/gutter/storm photos)
tools/generate.mjs     Generator for areas/* and materials/*
```

## Non-obvious rules

- **Header and footer are injected by `assets/js/app.js`** into the
  `#site-header` and `#site-footer` placeholders. Change nav, footer, or social
  links there — not in 30 HTML files.
- **`areas/*.html` and `materials/*.html` are generated.** Edit data or
  templates in `tools/generate.mjs`, then run `node tools/generate.mjs`. Direct
  edits to those files will be overwritten on the next regen.
- **All interactivity is in `app.js`** (quote modal, before/after slider, FAQ
  accordion + filter, work lightbox, review marquee, Leaflet map, contact form,
  storm checklist, review popup). No other JS files exist; no per-page scripts.
- **Subpages compute their own `../` prefix.** `app.js` detects `/areas/` or
  `/materials/` in the URL and prefixes chrome links accordingly. Don't break
  that regex.
- **The design-tool Tweaks panel was intentionally dropped.** The user iterates
  by talking to me, not via a settings UI. Don't add it back. Don't add palette
  switchers, dark mode toggles, or live theme controls without being asked.

## Locked design defaults

Forest green palette (`--accent: #014520`), Newsreader serif display + Manrope
body, full-bleed overlay hero, wordmark logo, headline "A roof you can forget
about." Variables are in `:root` of `styles.css` — palette changes go there.

Readability fixes applied beyond the original design: closing-CTA italic and
storm-band labels use `#5aa687` (the forest *dark*-mode green) so they read on
the dark `--fg` backgrounds. Don't revert these to `var(--accent)`.

## Voice the user cares about

Several rounds of "this reads AI-heavy" feedback in the design chats. The user
strongly prefers plain, direct copy over performative folksy or marketing
voice. When writing or revising copy:

- Specific numbers over vague claims (real: "100+ jobs since 2023" / fake: "we
  do hundreds of jobs"). If a number isn't real, ask before inventing one.
- No "we are committed to excellence" / "your trusted partner" register.
- The strongest existing line in the entire site is Mike Thompson's review:
  *"They took care of me and will take care of you."* Mirror that register.
- Southern but not performatively so. Confident, measured, premium.

## Photo conventions

- Real Tyler Roofing assets live in `assets/img/` — logo, Jacob's drone photo,
  brick home, gutters before/after, storm damage. Use these wherever they fit.
- Everything else is Unsplash placeholders (URLs are inline in the HTML; the
  pattern is `https://images.unsplash.com/photo-<id>?w=...&auto=format&fit=crop`).
- The user expects to swap real photos in over time. When they send a new image,
  drop it in `assets/img/` and update the relevant src.

## Open punch-list (things still placeholder)

1. **Reviews** — only Mike Thompson is real. The marquee on the home page has
   11 invented reviews; the user has decided to keep them until real Google
   reviews come in. Don't add more invented reviews. The placeholder cards on
   reviews/about pages are clearly marked and should stay that way.
2. **Trust badges** — AL license number, BBB accreditation status, and the
   Google review URL are all "pending." Swap when real.
3. **Forms have no backend.** The contact form and the 4-step booking modal
   are front-end only. Submitting validates and shows a confirmation, but
   nothing is sent anywhere. This is the #1 thing to wire before launch.
4. **Social URLs** — Facebook / Instagram / Google / YouTube footer icons are
   `href="#"` with a "launching soon" hover. The user is setting these up.
5. **Photos** — most non-hero photos are Unsplash placeholders. The user is
   sending real photos as they're shot.

## When the user asks for changes

- Run a dev server in the background (or check one is running) so they can
  refresh and watch.
- Match existing CSS class naming and component patterns; don't introduce
  utility libraries or rewrite sections you weren't asked to touch.
- For copy changes, edit the relevant HTML directly (or `generate.mjs` for
  city/material content). Don't refactor adjacent sections.
- Per global guidelines: surface tradeoffs, ask before inventing facts or
  numbers, and don't expand scope past what was asked.
