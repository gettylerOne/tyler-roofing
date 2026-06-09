/* ============================================================================
   generate.mjs — builds the static per-city and per-material landing pages.

   Run from the project root:   node tools/generate.mjs

   These pages are data-driven and near-identical, so they are generated rather
   than hand-maintained. Edit the data or templates below and re-run to refresh
   /areas/*.html and /materials/*.html. The generated files are plain static
   HTML — no build step is needed to serve the site.
   ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── Data ─────────────────────────────────────────────────────────────────
   Per-city content. Order is the display order on the Areas index. */
const CITIES = {
  columbiana: {
    name: "Columbiana", county: "Shelby County", pop: "~5,000",
    zip: "35051", distance: "Home office",
    pitch: "Columbiana is home. Our office is at 100 N Main Street — county seat of Shelby County, a few minutes from the courthouse. If you're in Columbiana, we're already in the neighborhood.",
    neighborhoods: ["Downtown Columbiana", "Old Town", "Spring Creek", "Mooney Road", "Highway 25 corridor", "Lake Wilson", "Yellowleaf"],
    notes: "Mix of older downtown homes near the courthouse, mid-century ranches on the surrounding streets, and newer subdivisions out toward 25 and Highway 70. We do a lot of repair work on the older stock and full replacements on the newer subdivisions as they age out of their original 25-year shingles.",
    storm: "The Shelby County hail corridor runs through Columbiana every spring. The 2023 events brought weeks of claim work to the area. We respond same-day for active leaks and tarp-ups.",
    jobs: ["Full architectural-shingle replacement, Downtown Columbiana", "Two-story tear-off and Class 4 install, Highway 25 corridor", "Repair-and-recover on a partial loss, Old Town"],
  },
  birmingham: {
    name: "Birmingham", county: "Jefferson County", pop: "~200,000",
    zip: "35203 · 35205 · 35206 · 35209 · 35211 · 35213 · 35214 · 35216", distance: "Home base",
    pitch: "We're a Birmingham roofing company first. Most of our jobs run inside the city or the immediate metro.",
    neighborhoods: ["Forest Park", "Highland Park", "Crestwood", "Avondale", "Norwood", "Glen Iris", "Southside", "West End", "Five Points South", "Roebuck"],
    notes: "Lots of older housing stock here — 1920s-50s bungalows and tudors with original or once-replaced roofs. We do a lot of full tear-offs on these, plus chimney flashing, valley work, and decking repair on homes that haven't seen a new roof in 25+ years.",
    storm: "Birmingham proper takes the same hail and wind events as the rest of Jefferson County. The 2023 spring storms hit the east side (Crestwood, Roebuck, East Lake) particularly hard.",
    jobs: ["Full tear-off and architectural shingle replacement, Forest Park bungalow", "Hail-damage insurance claim, three-tab to architectural, Roebuck", "Chimney flashing and decking repair, Highland Park"],
  },
  hoover: {
    name: "Hoover", county: "Jefferson & Shelby Counties", pop: "~92,000",
    zip: "35226 · 35236 · 35242 · 35244", distance: "~12 miles south",
    pitch: "Hoover is one of our biggest service areas. From Riverchase down through Bluff Park, we're in this part of the metro almost every week.",
    neighborhoods: ["Riverchase", "Bluff Park", "Greystone (west)", "Inverness", "Trace Crossings", "Patton Creek", "Lake Cyrus", "Ross Bridge", "Hoover Country Club"],
    notes: "A lot of Hoover homes are 1980s-2000s construction with original or first-replacement roofs that are aging out. Trace Crossings, Riverchase, and Inverness have had several hail events in the last decade — insurance claim work is common here.",
    storm: "Hoover sat right under the March 2023 hail track. Insurance claims were heavy in Riverchase and Inverness; many of those roofs were replaced through carrier work.",
    jobs: ["Architectural-shingle replacement, Riverchase", "Storm-damage claim, Inverness Country Club area", "Gutter and fascia replacement, Bluff Park"],
  },
  vestavia: {
    name: "Vestavia Hills", county: "Jefferson County", pop: "~38,000",
    zip: "35216 · 35226 · 35243", distance: "~8 miles south",
    pitch: "Vestavia is a mature neighborhood — a lot of 1960s-80s construction over Shades Mountain. We do regular replacement and repair work here.",
    neighborhoods: ["Vestavia East", "Cahaba Heights", "Liberty Park", "Altadena Valley", "Rocky Ridge", "Cahaba River Estates"],
    notes: "Homes here often need decking inspection on tear-off — older OSB and the occasional plank deck. We pull-and-replace on bad spans. Cahaba Heights and Liberty Park lean newer.",
    storm: "Vestavia gets the same Shelby County storm cells. The ridge orientation channels wind down the valleys — wind-only roof loss is more common here than hail in some events.",
    jobs: ["Repair and partial reroof, Liberty Park", "Wind-damage repair and ridge replacement, Cahaba Heights", "Full replacement and skylight reset, Altadena Valley"],
  },
  mountainbrook: {
    name: "Mountain Brook", county: "Jefferson County", pop: "~22,000",
    zip: "35213 · 35216 · 35223", distance: "~6 miles southeast",
    pitch: "Mountain Brook is where craftsmanship matters more than turnaround. We slow down here — slate and cedar-shake work, copper flashing, architectural-grade shingle, and detailed dormer and valley work are common.",
    neighborhoods: ["Crestline Village", "English Village", "Mountain Brook Village", "Cherokee Bend", "Brookwood Forest", "Country Club", "Overbrook"],
    notes: "Older custom homes, complex roof lines, slate and tile, designer shingles, copper accents. These projects take longer and the spec sheet is detailed — that's a feature, not a bug. We staff the right crew, take the photos, and do it once.",
    storm: "Same storm corridor as Vestavia and Homewood. Damage tends to be lower-volume but higher-spec — historic homes have details we can't shortcut.",
    jobs: ["Designer-shingle replacement and copper valley work, Crestline", "Cedar shake repair, English Village", "Slate inspection and selective replacement, Country Club"],
  },
  homewood: {
    name: "Homewood", county: "Jefferson County", pop: "~26,000",
    zip: "35209 · 35229", distance: "~5 miles south",
    pitch: "Homewood — Edgewood, Hollywood, Mayfair — is one of the most consistently busy parts of our schedule. Smaller lots, walkable streets, friendly neighbors, and a lot of houses that need a roof refresh.",
    neighborhoods: ["Edgewood", "Hollywood", "Mayfair", "Rosedale", "West Homewood"],
    notes: "Edgewood and Hollywood bungalows often have intricate roof lines for the size — multiple gables, dormers, low-pitch porch tie-ins. We've gotten quick at these. Tight access is the main challenge — we coordinate carefully with neighbors.",
    storm: "Standard Jefferson storm exposure. Tree fall is the bigger risk in Homewood — mature oaks come down hard on these older roofs.",
    jobs: ["Architectural replacement with multiple dormers, Edgewood", "Tree-impact emergency tarp and repair, Hollywood", "Low-slope porch flashing and shingle, Mayfair"],
  },
  pelham: {
    name: "Pelham", county: "Shelby County", pop: "~24,000",
    zip: "35124", distance: "~18 miles south",
    pitch: "Pelham — off the 119 corridor and Cahaba Valley — is one of our regular Shelby County stops. Newer construction, plenty of insurance claim work, and a fair amount of pre-listing repair.",
    neighborhoods: ["Indian Springs (south side)", "Cahaba Valley", "Oak Mountain area", "Ballantrae Pelham", "Heatherwood"],
    notes: "Mostly 1990s-2010s homes. We see a lot of original 25-yr shingles aging out around now. The storm corridor runs through here — March and April hail events frequently end with Pelham claims.",
    storm: "Pelham, Helena, and Alabaster sit under one of the most active hail corridors in the metro. Spring storms in this band run insurance work for weeks after.",
    jobs: ["Hail claim full replacement, Cahaba Valley", "Pre-listing roof replacement, Ballantrae", "Architectural-shingle replacement with ridge vent, Heatherwood"],
  },
  helena: {
    name: "Helena", county: "Shelby County", pop: "~22,000",
    zip: "35080", distance: "~22 miles south",
    pitch: "Helena — Old Town and the newer subdivisions on the west side — is one of our most active areas. We pull permits with the city of Helena regularly.",
    neighborhoods: ["Old Town Helena", "Hillsboro", "Stone Creek", "Camden Cove", "Riverwoods", "Penhale"],
    notes: "Old Town has older homes with character; the rest is largely 1990s-2010s subdivisions. Storms tend to land hardest here — Helena's roof age distribution and storm exposure means we do a lot of full replacements through insurance.",
    storm: "Helena is squarely in the spring hail corridor. The 2023 events ran weeks of claims through here. Carriers know it.",
    jobs: ["Insurance claim full replacement, Stone Creek", "Two-house storm-claim run, Camden Cove", "Repair-and-recover on a partial loss, Old Town"],
  },
  alabaster: {
    name: "Alabaster", county: "Shelby County", pop: "~33,000",
    zip: "35007", distance: "~25 miles south",
    pitch: "Alabaster — Thompson schools area down through the 31 bypass — runs a lot of insurance claim work for us. We're south Shelby's neighbor, and a meaningful share of our calendar lives here.",
    neighborhoods: ["Old Town Alabaster", "Thompson schools area", "Forest Hills", "Wellington", "Weatherly", "Maylene"],
    notes: "Mix of older homes near Old Town and newer subdivisions on the south end. Architectural asphalt shingles are the budget-friendly standard here; metal roofing is a growing upgrade for homeowners who want 40-70 years of life and better energy efficiency.",
    storm: "Same hail corridor as Helena. A lot of Alabaster roofs got replaced after the 2023 events; we still see lingering supplements and second-storm claims here.",
    jobs: ["Architectural replacement on insurance claim, Thompson", "Architectural-shingle replacement and gutter pack, Wellington", "Decking and shingle repair after wind event, Weatherly"],
  },
  chelsea: {
    name: "Chelsea", county: "Shelby County", pop: "~14,000",
    zip: "35043", distance: "~20 miles southeast",
    pitch: "Chelsea is growing fast — the 280 corridor is full of newer construction and we get calls for first-replacement roofs aging out of their original warranty.",
    neighborhoods: ["Chelsea Park", "Mt Laurel", "Chelsea Crossings", "Foothills"],
    notes: "Mostly 2000s-2020s homes. We do a lot of first-replacement work as builder-grade shingles age into 15-20 years.",
    storm: "Chelsea sits on the east edge of the spring hail corridor. Hits aren't every year, but when they come they're significant.",
    jobs: ["First-replacement on builder-grade 3-tab, Chelsea Park", "Insurance claim with code upgrade, Mt Laurel", "Two-roof rental portfolio replacement, Foothills"],
  },
  calera: {
    name: "Calera", county: "Shelby County", pop: "~17,000",
    zip: "35040", distance: "~30 miles south",
    pitch: "Calera — south of the 31 split — is one of our farther southern stops. Newer construction, a growing community, regular insurance claim work after hail seasons.",
    neighborhoods: ["Camden Lakes", "Timberline", "Waterford", "Holland Lakes"],
    notes: "Almost all 2000s-2020s construction. First-replacement roofs aging out, plus insurance claim work after Shelby hail events. We pull permits here regularly.",
    storm: "Calera sees the southern tail of the Shelby hail corridor. Wind is the bigger consistent issue here than hail.",
    jobs: ["Architectural-shingle first replacement, Camden Lakes", "Wind-damage ridge and starter repair, Timberline", "Insurance-claim full replacement, Holland Lakes"],
  },
  mccalla: {
    name: "McCalla", county: "Jefferson & Tuscaloosa Counties", pop: "~25,000",
    zip: "35111", distance: "~20 miles southwest",
    pitch: "McCalla is on the southwest side of the metro — Tannehill, Bessemer Cutoff, the I-459 spur. Newer subdivisions and a fair amount of repair-and-replace work after spring storms.",
    neighborhoods: ["Tannehill Lakes", "Cherokee Beach", "McAdory area", "Old Tannehill", "Mountain View"],
    notes: "Mix of older country and newer subdivision. Storm patterns here come west — different cell tracks than the I-65 corridor. We adapt the call response accordingly.",
    storm: "Tornado warnings hit here on a different track than the central metro — McCalla can get hit when the I-65 corridor doesn't. We respond either way.",
    jobs: ["Tornado-damage full replacement, Tannehill Lakes", "Tree-impact emergency tarp, McAdory area", "Architectural replacement on builder-grade, Cherokee Beach"],
  },
  leeds: {
    name: "Leeds", county: "Jefferson, St. Clair & Shelby Counties", pop: "~13,000",
    zip: "35094", distance: "~15 miles east",
    pitch: "Leeds sits on the east side of the metro near the I-20 / I-459 split. We do regular work here — older homes downtown, newer subdivisions out toward Moody.",
    neighborhoods: ["Downtown Leeds", "Grand River area", "Cedar Bend", "Crestview"],
    notes: "Mixed housing stock — early 1900s in the historic core, mid-century around downtown, 2000s+ on the outskirts. Each calls for a different roofing conversation.",
    storm: "East-metro storm tracks come through here. Less consistent than the central I-65 corridor but still active in spring.",
    jobs: ["Historic-home shingle replacement with custom flashing, Downtown Leeds", "Wind-damage repair, Grand River area", "Full replacement on mid-century ranch, Crestview"],
  },
};

/* ── Fringe-area cities ─────────────────────────────────────────────────────
   Counties on the edge of the service area. These get a LIGHTER landing page
   (no invented neighborhoods or job history). They are linked from the
   home-page county map and from the "surrounding counties" group in the
   hand-built areas.html index — keep that index in sync when adding cities. */
const FRINGE_CITIES = {
  tuscaloosa:     { name: "Tuscaloosa",   county: "Tuscaloosa County", distance: "~60 mi west" },
  northport:      { name: "Northport",    county: "Tuscaloosa County", distance: "~62 mi west" },
  "pell-city":    { name: "Pell City",    county: "St. Clair County",  distance: "~35 mi east" },
  moody:          { name: "Moody",        county: "St. Clair County",  distance: "~22 mi east" },
  springville:    { name: "Springville",  county: "St. Clair County",  distance: "~30 mi northeast" },
  odenville:      { name: "Odenville",    county: "St. Clair County",  distance: "~30 mi east" },
  centreville:    { name: "Centreville",  county: "Bibb County",       distance: "~45 mi southwest" },
  brent:          { name: "Brent",        county: "Bibb County",       distance: "~46 mi southwest" },
  "west-blocton": { name: "West Blocton", county: "Bibb County",       distance: "~38 mi southwest" },
  talladega:      { name: "Talladega",    county: "Talladega County",  distance: "~55 mi east" },
  sylacauga:      { name: "Sylacauga",    county: "Talladega County",  distance: "~50 mi southeast" },
  childersburg:   { name: "Childersburg", county: "Talladega County",  distance: "~45 mi southeast" },
  lincoln:        { name: "Lincoln",      county: "Talladega County",  distance: "~50 mi east" },
  oneonta:        { name: "Oneonta",      county: "Blount County",     distance: "~40 mi northeast" },
  cleveland:      { name: "Cleveland",    county: "Blount County",     distance: "~38 mi northeast" },
  "locust-fork":  { name: "Locust Fork",  county: "Blount County",     distance: "~35 mi northeast" },
  jasper:         { name: "Jasper",       county: "Walker County",     distance: "~40 mi northwest" },
  sumiton:        { name: "Sumiton",      county: "Walker County",     distance: "~30 mi northwest" },
  cordova:        { name: "Cordova",      county: "Walker County",     distance: "~38 mi northwest" },
  cullman:        { name: "Cullman",      county: "Cullman County",    distance: "~50 mi north" },
  hanceville:     { name: "Hanceville",   county: "Cullman County",    distance: "~45 mi north" },
  "good-hope":    { name: "Good Hope",    county: "Cullman County",    distance: "~48 mi north" },
  montgomery:     { name: "Montgomery",   county: "Montgomery County", distance: "~90 mi south" },
  "pike-road":    { name: "Pike Road",    county: "Montgomery County", distance: "~95 mi south" },
  clanton:        { name: "Clanton",      county: "Chilton County",    distance: "~20 mi south" },
  jemison:        { name: "Jemison",      county: "Chilton County",    distance: "~15 mi south" },
  thorsby:        { name: "Thorsby",      county: "Chilton County",    distance: "~18 mi south" },
  rockford:       { name: "Rockford",     county: "Coosa County",      distance: "~35 mi southeast" },
  goodwater:      { name: "Goodwater",    county: "Coosa County",      distance: "~32 mi southeast" },
};

/* Per-material content. */
const MATERIALS = {
  asphalt: {
    name: "Architectural Shingles", short: "Asphalt",
    intro: "Architectural (dimensional) asphalt shingles are the most common roofing material in Alabama for a reason — strong wind ratings, solid warranties, fair price, and a wide range of looks. About 80% of our installs are architectural shingle.",
    brands: ["GAF Timberline HDZ", "Owens Corning Duration", "CertainTeed Landmark", "Atlas Pinnacle Pristine"],
    pros: ["30-year typical warranty (some lifetime-limited)", "Strong wind ratings — 110-130 mph stock, more with enhanced nailing", "Wide range of colors and looks", "Most common material — easy to source, fair pricing"],
    cons: ["Shorter lifespan than metal or slate", "Granule loss over time — especially in hail-prone areas", "Heat absorption higher than light-colored metal"],
    lifespan: "25-30 yrs", cost: "$", weight: "Medium",
    bestFor: "Most residential homes, full replacements, insurance claim work",
    process: ["Tear off existing shingle and underlayment to the deck", "Inspect decking — replace any soft or rotted spans", "Install ice and water shield at valleys and penetrations", "Synthetic underlayment, 4-nail or 6-nail pattern per spec", "Architectural shingle in the chosen profile and color", "Ridge vent, hip and ridge cap, pipe boots, step flashing", "Magnet sweep yard for nails, final walkthrough"],
  },
  metal: {
    name: "Standing-Seam Metal", short: "Metal",
    intro: "Standing-seam metal is the long-haul play. Higher upfront cost, lower total cost of ownership over 40-50 years. Big in Alabama for outbuildings, modern homes, and porches — and increasingly for whole-home retrofits.",
    brands: ["Galvalume", "ABM Panels", "Painted steel (Kynar 500)", "Copper (custom)"],
    pros: ["40-50+ year lifespan typical", "Class A fire rating, Class 4 impact (most profiles)", "Reflective — measurable energy savings in AL summers", "Wind ratings up to 140 mph", "Looks distinctive — modern or classic farmhouse"],
    cons: ["Higher upfront cost than shingle", "Requires experienced install — fewer crews qualified", "Noisier in heavy rain (mitigated by proper underlayment)", "Can show oil-canning on long flat panels"],
    lifespan: "40-50 yrs", cost: "$$$", weight: "Light",
    bestFor: "Modern homes, farmhouse style, long-term primary residences, low-slope porch tie-ins",
    process: ["Tear off and inspect deck thoroughly — metal is unforgiving of deck issues", "High-temp ice and water shield over the full deck", "Drip edge, valley pans, custom flashing fabricated for the job", "Standing-seam panels run to length — no horizontal seams when avoidable", "Mechanical or snap-lock seam, concealed clips", "Ridge cap, hip flashing, soffit closures", "Final inspection, magnet sweep, customer walkthrough"],
  },
  impact: {
    name: "Impact-Resistant Shingles (Class 4)", short: "Impact-resistant",
    intro: "Class 4 impact-rated shingles are engineered for hail and high-wind regions like Alabama. Most carriers offer a measurable premium discount on Class 4 roofs — sometimes 10-30% on the wind/hail portion. If you've had one hail claim already, this is the conversation to have.",
    brands: ["GAF Armorshield II", "Owens Corning Duration Storm", "CertainTeed NorthGate", "Atlas StormMaster Shake"],
    pros: ["Class 4 UL 2218 impact rating — highest available", "Most AL carriers discount premiums (verify with yours)", "Same install footprint as standard architectural", "Polymer-modified asphalt — more flexibility, less cracking"],
    cons: ["Premium over standard architectural (often 15-25%)", "Discount varies by carrier — not universal", "Same lifespan as architectural in most lines"],
    lifespan: "30-50 yrs", cost: "$$", weight: "Medium",
    bestFor: "Homes with prior hail claims, second-storm risk, anyone wanting an insurance discount",
    process: ["Same tear-off and deck inspection as architectural", "Ice and water shield at valleys and penetrations", "Synthetic underlayment, 6-nail high-wind pattern", "Class 4 shingles per manufacturer install spec", "Manufacturer documentation submitted to carrier for discount", "Ridge, hip, flashings, boots", "Provide Class 4 certificate for your insurance file"],
  },
  cedar: {
    name: "Cedar Shake", short: "Cedar shake",
    intro: "Cedar shake is rare in Alabama but we install and repair it — primarily in Mountain Brook, English Village, and other historic neighborhoods where it's spec'd to match the original architecture. It takes specialized install and ongoing maintenance.",
    brands: ["Western red cedar (premium)", "Alaska yellow cedar", "Pressure-treated cedar shake"],
    pros: ["Distinctive look — nothing else looks like real wood shake", "Natural insulation and breathability", "Patinas beautifully — silver-gray over time", "30-50 year lifespan with maintenance"],
    cons: ["Highest maintenance of any common material", "Fire risk — Class C unless treated", "Expensive, getting more so as good cedar gets harder to source", "Requires a specialist install crew"],
    lifespan: "30-50 yrs", cost: "$$$$", weight: "Medium-heavy",
    bestFor: "Historic homes, architectural matching, Mountain Brook / Vestavia historic districts",
    process: ["Detailed deck inspection — old shake homes often need partial deck replacement", "Skip-sheathing or solid-deck per local building code", "Underlayment per manufacturer spec (some use felt, others synthetic)", "Hand-nailed shake, staggered courses", "Specialist flashing — copper or lead-coated common", "Fire-retardant treatment if required by code or HOA", "Maintenance schedule provided"],
  },
  synthetic: {
    name: "Synthetic Slate & Shake", short: "Synthetic",
    intro: "Polymer composite shake and slate — manufactured to look like the real thing without the weight, fire risk, or maintenance. We're seeing this more in Birmingham as homeowners want a slate or shake look on homes that can't structurally take the real material.",
    brands: ["DaVinci Roofscapes", "Brava synthetic", "F Wave shingle slate"],
    pros: ["Look of slate or shake at ~1/2-1/3 the weight", "Class A fire rating, Class 4 impact (most lines)", "50+ year warranty typical", "No maintenance — won't crack like real slate, won't rot like wood", "Wider color palette than natural materials"],
    cons: ["Higher cost than architectural shingle", "Still niche — fewer installers, longer lead times", "Some HOAs in historic districts won't accept synthetics"],
    lifespan: "50+ yrs", cost: "$$$", weight: "Light-medium",
    bestFor: "Slate / shake look without the weight or maintenance, modern historic-style new builds",
    process: ["Standard tear-off and deck inspection", "Ice and water shield + synthetic underlayment", "Product-specific install per manufacturer rep (we get certified per line)", "Specialty flashing — composite-compatible details", "Ridge, hip, and rake details per the system", "Manufacturer warranty paperwork submitted on your behalf"],
  },
  tpo: {
    name: "Low-Slope & Flat (TPO / Modified)", short: "Low-slope",
    intro: "Flat and low-slope sections don't take shingle — they need a membrane or modified bitumen system. Common on screened porches, room additions, and small commercial. We do TPO membrane, modified bitumen, and EPDM as the job calls for.",
    brands: ["TPO (white membrane)", "Modified bitumen (torch-down)", "EPDM (rubber)"],
    pros: ["Only material that works on flat roofs", "TPO reflects heat — energy savings", "20-30 year typical lifespan with proper install", "Repairable in place — no full tear-off for most leaks"],
    cons: ["Not for high-slope — a different system entirely", "Punctures from foot traffic are the main failure mode", "Requires specialist install (heat-weld for TPO)"],
    lifespan: "20-30 yrs", cost: "$$", weight: "Light",
    bestFor: "Flat porches, room additions, small commercial, low-slope tie-ins on residential",
    process: ["Inspect existing low-slope assembly — tear off or recover per condition", "Inspect substrate, replace any rotted decking", "Cover-board insulation if specified", "TPO membrane heat-welded at all seams, or modified bitumen torch-down", "Flashings and edge details specific to the system", "Pressure-test seams before final sign-off"],
  },
};

/* ── Helpers ──────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const pad = (n) => String(n).padStart(2, "0");

const ARROW = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FONTS = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';

function htmlShell({ title, desc, page, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body data-page="${page}">
<div id="site-header"></div>
<main class="page">
${body}
</main>
<div id="site-footer"></div>
<script src="../assets/js/data.js"></script>
<script src="../assets/js/app.js"></script>
</body>
</html>
`;
}

const closingCta = `
  <section class="closing-cta">
    <div class="container">
      <h2 class="h-display">Free inspection. Written quote. <i>Then it's your call.</i></h2>
      <div class="closing-cta-actions">
        <button class="btn btn-accent" data-quote>Free roof inspection →</button>
        <a class="call-line" href="tel:+12055156968"><span class="lbl mono">or call</span><span class="num h-display">205-515-6968</span></a>
      </div>
    </div>
  </section>`;

/* ── City page ────────────────────────────────────────────────────────── */
function cityPage(slug, c) {
  const nbhds = c.neighborhoods.map((n, i) =>
    `<div class="nbhd"><span class="nn mono">${pad(i + 1)}</span><span class="nv">${esc(n)}</span></div>`).join("\n        ");
  const jobs = c.jobs.map((j, i) =>
    `<div class="job"><div class="n mono">${pad(i + 1)}</div><div class="v">${esc(j)}</div></div>`).join("\n        ");
  const nearby = Object.keys(CITIES).filter((k) => k !== slug).map((k) =>
    `<a class="chip" href="${k}.html">Roofers in ${esc(CITIES[k].name)}</a>`).join("\n        ");

  const body = `
  <section class="city-hero">
    <div class="container">
      <a class="back-link mono" href="../areas.html">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3m3-3-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        All service areas
      </a>
      <div class="city-hero-grid">
        <div>
          <h1 class="h-display">${esc(c.name)}<span class="comma">,</span><br><span class="state">Alabama.</span></h1>
          <p class="pitch">${esc(c.pitch)}</p>
          <div class="actions">
            <button class="btn btn-primary" data-quote>Free roof inspection in ${esc(c.name)} →</button>
            <a class="btn btn-ghost" href="tel:+12055156968">Call 205-515-6968</a>
          </div>
        </div>
        <div class="facts">
          <div class="lbl mono">On the ground</div>
          <div class="fact"><span class="k">County</span><span class="v">${esc(c.county)}</span></div>
          <div class="fact"><span class="k">Population</span><span class="v">${esc(c.pop)}</span></div>
          <div class="fact"><span class="k">Distance</span><span class="v">${esc(c.distance)}</span></div>
          <div class="fact"><span class="k">ZIPs</span><span class="v" style="font-size:12px">${esc(c.zip)}</span></div>
          <div class="scheduling"><span class="dot"></span><span class="mono">Currently scheduling</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-y-lg">
    <div class="container">
      <div class="city-cols">
        <div>
          <div class="section-head">
            <h2>Where we work<br><i>in ${esc(c.name)}.</i></h2>
          </div>
          <p style="margin-top:22px;color:color-mix(in oklab,var(--fg) 70%,transparent);font-size:15.5px;line-height:1.6">Not exhaustive — call if you don't see yours. Inside the metro we'll come out.</p>
        </div>
        <div class="nbhd-grid">
        ${nbhds}
        </div>
      </div>
    </div>
  </section>

  <section class="surface bordered-block pad-y-lg">
    <div class="container">
      <div class="notes-grid">
        <div>
          <div class="lbl mono">What we see on ${esc(c.name)} roofs</div>
          <h3 class="h-display">Local notes.</h3>
          <p>${esc(c.notes)}</p>
        </div>
        <div>
          <div class="lbl mono">Storm corridor</div>
          <h3 class="h-display">After the weather.</h3>
          <p>${esc(c.storm)}</p>
          <a class="btn btn-ghost" href="../storm.html">See storm response →</a>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-y-lg">
    <div class="container">
      <div class="section-head">
        <h2>Jobs in ${esc(c.name)}.</h2>
      </div>
      <div class="jobs-grid" style="grid-template-columns:repeat(${c.jobs.length},1fr)">
        ${jobs}
      </div>
    </div>
  </section>

  <section class="pad-y-lg">
    <div class="container">
      <div class="section-head">
        <h2>Also serving these neighbors.</h2>
      </div>
      <div class="chip-row">
        ${nearby}
      </div>
    </div>
  </section>
${closingCta}`;

  return htmlShell({
    title: `Roofers in ${c.name}, AL — Tyler Roofing & Home Solutions`,
    desc: `Roofing, repairs, and storm/insurance work in ${c.name}, Alabama. ${c.pitch}`,
    page: "areas",
    body,
  });
}

/* ── Fringe-city page (lighter, no invented specifics) ──────────────────── */
function fringeCityPage(slug, c) {
  const pitch = c.pitch || `${c.name} sits in ${c.county}, about ${c.distance} from our Birmingham-metro base. It's on the fringe of where we regularly work, but we still take roofing and home-solutions jobs out this way. Call and we'll give you a straight answer on whether we can get to you and when.`;

  const body = `
  <section class="city-hero">
    <div class="container">
      <a class="back-link mono" href="../areas.html">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3m3-3-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        All service areas
      </a>
      <div class="city-hero-grid">
        <div>
          <h1 class="h-display">${esc(c.name)}<span class="comma">,</span><br><span class="state">Alabama.</span></h1>
          <p class="pitch">${esc(pitch)}</p>
          <div class="actions">
            <button class="btn btn-primary" data-quote>Free roof inspection in ${esc(c.name)} →</button>
            <a class="btn btn-ghost" href="tel:+12055156968">Call 205-515-6968</a>
          </div>
        </div>
        <div class="facts">
          <div class="lbl mono">On the ground</div>
          <div class="fact"><span class="k">County</span><span class="v">${esc(c.county)}</span></div>
          <div class="fact"><span class="k">Distance</span><span class="v">${esc(c.distance)}</span></div>
          <div class="fact"><span class="k">Service area</span><span class="v">Fringe · by schedule</span></div>
          <div class="scheduling"><span class="dot"></span><span class="mono">Call to confirm availability</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="surface bordered-block pad-y-lg">
    <div class="container">
      <div class="notes-grid">
        <div>
          <div class="lbl mono">How fringe coverage works</div>
          <h3 class="h-display">Out your way.</h3>
          <p>${esc(c.name)} is outside our core Birmingham-metro radius, so we batch trips this direction around the work already on the calendar. For a full replacement or an insurance claim it's almost always worth the drive — call and we'll tell you straight on timing.</p>
        </div>
        <div>
          <div class="lbl mono">Storm &amp; insurance</div>
          <h3 class="h-display">After the weather.</h3>
          <p>If a storm came through ${esc(c.county)} and you think you've got damage, we can walk the roof, document it, and coordinate the claim with your carrier — same as we do across the metro.</p>
          <a class="btn btn-ghost" href="../storm.html">See storm response →</a>
        </div>
      </div>
    </div>
  </section>
${closingCta}`;

  return htmlShell({
    title: `Roofers in ${c.name}, AL — Tyler Roofing & Home Solutions`,
    desc: `Roofing, repairs, and storm/insurance work in ${c.name}, ${c.county}, Alabama — fringe coverage from Tyler Roofing & Home Solutions.`,
    page: "areas",
    body,
  });
}

/* ── Material page ────────────────────────────────────────────────────── */
function materialPage(slug, m) {
  const dim = "$$$$".slice(m.cost.length);
  const pros = m.pros.map((p) =>
    `<li><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7l3 3 6-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(p)}</span></li>`).join("\n            ");
  const cons = m.cons.map((p) =>
    `<li><span class="dash"></span><span>${esc(p)}</span></li>`).join("\n            ");
  const brands = m.brands.map((b) =>
    `<div class="brand"><div class="nm h-display">${esc(b)}</div></div>`).join("\n        ");
  const steps = m.process.map((s, i) =>
    `<div class="mat-proc-step"><div class="n mono">${pad(i + 1)}</div><div class="v">${esc(s)}</div></div>`).join("\n          ");
  const others = Object.keys(MATERIALS).filter((k) => k !== slug).map((k) =>
    `<a class="chip" href="${k}.html">${esc(MATERIALS[k].short)}</a>`).join("\n        ");
  const brandCols = Math.min(m.brands.length, 4);

  const body = `
  <section class="mat-hero">
    <div class="container">
      <a class="back-link mono" href="../materials.html">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3m3-3-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        All materials
      </a>
      <div class="mat-hero-grid">
        <div>
          <h1 class="h-display">${esc(m.name)}</h1>
          <p class="intro">${esc(m.intro)}</p>
          <div class="actions">
            <button class="btn btn-primary" data-quote>Quote for ${esc(m.short.toLowerCase())} →</button>
            <a class="btn btn-ghost" href="tel:+12055156968">Or call 205-515-6968</a>
          </div>
        </div>
        <div class="spec">
          <div class="spec-row"><span class="k mono">Lifespan</span><span class="v">${esc(m.lifespan)}</span></div>
          <div class="spec-row"><span class="k mono">Cost tier</span><span class="v"><span class="lit">${esc(m.cost)}</span><span class="dim">${dim}</span></span></div>
          <div class="spec-row"><span class="k mono">Weight</span><span class="v">${esc(m.weight)}</span></div>
          <div class="spec-row"><span class="k mono">Best for</span><span class="v">${esc(m.bestFor)}</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-y-lg">
    <div class="container">
      <div class="pc-grid">
        <div class="pc-card pros">
          <div class="lbl mono">✓ What's good</div>
          <h3>The pros.</h3>
          <ul class="pc-list">
            ${pros}
          </ul>
        </div>
        <div class="pc-card cons">
          <div class="lbl mono">! Honest trade-offs</div>
          <h3>The cons.</h3>
          <ul class="pc-list">
            ${cons}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="surface bordered-block pad-y-lg">
    <div class="container">
      <div class="section-head">
        <h2>Manufacturers for ${esc(m.short.toLowerCase())}.</h2>
        <p class="kicker">The names we trust on the trailer. Have a preference? Tell us and we'll spec it.</p>
      </div>
      <div class="brand-grid" style="grid-template-columns:repeat(${brandCols},1fr)">
        ${brands}
      </div>
    </div>
  </section>

  <section class="pad-y-lg">
    <div class="container">
      <div class="mat-proc-grid">
        <div class="mat-proc-sticky">
          <div class="section-head">
            <h2>How ${esc(m.short.toLowerCase())}<br><i>goes on a Birmingham home.</i></h2>
          </div>
          <p>Step-by-step. Most jobs run 1-3 days on the roof depending on size, pitch, and weather.</p>
        </div>
        <div>
          ${steps}
        </div>
      </div>
    </div>
  </section>

  <section class="surface bordered-top pad-y-lg">
    <div class="container">
      <div class="section-head">
        <h2>Compare with the rest.</h2>
      </div>
      <div class="chip-row">
        ${others}
      </div>
    </div>
  </section>
${closingCta}`;

  return htmlShell({
    title: `${m.name} — Tyler Roofing, Birmingham AL`,
    desc: m.intro,
    page: "services",
    body,
  });
}

/* ── Write ────────────────────────────────────────────────────────────── */
mkdirSync(join(ROOT, "areas"), { recursive: true });
mkdirSync(join(ROOT, "materials"), { recursive: true });

let count = 0;
for (const [slug, c] of Object.entries(CITIES)) {
  writeFileSync(join(ROOT, "areas", `${slug}.html`), cityPage(slug, c));
  count++;
}
for (const [slug, c] of Object.entries(FRINGE_CITIES)) {
  writeFileSync(join(ROOT, "areas", `${slug}.html`), fringeCityPage(slug, c));
  count++;
}
for (const [slug, m] of Object.entries(MATERIALS)) {
  writeFileSync(join(ROOT, "materials", `${slug}.html`), materialPage(slug, m));
  count++;
}
console.log(`Generated ${count} pages — ${Object.keys(CITIES).length} city, ${Object.keys(FRINGE_CITIES).length} fringe-city, ${Object.keys(MATERIALS).length} material.`);
