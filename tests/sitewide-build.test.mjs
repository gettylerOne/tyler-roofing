import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformSitewide } from '../tools/sitewide.mjs';

const source = '<html><head></head><body><div id="site-footer"></div></body></html>';
const legal = 'Tyler Roofing and Home Solutions is a trade name of JD Tyler LLC. Alabama Home Builders Licensure Board License #31643.';

test('injects one static legal line and one valid business JSON-LD', () => {
  const html = transformSitewide(source);
  assert.equal(html.split(legal).length - 1, 1);
  assert.ok(html.includes(`<div id="site-footer"><p class="footer-entity">${legal}</p></div>`));
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const business = JSON.parse(scripts[0][1]);
  assert.equal(business.name, 'Tyler Roofing and Home Solutions');
  assert.equal(business.legalName, 'JD Tyler LLC');
  assert.equal(business.telephone, '+1-205-547-0122');
  assert.deepEqual(business.areaServed.find(area => area.name === 'Montgomery County, AL'), { '@type': 'AdministrativeArea', name: 'Montgomery County, AL' });
  const forbidden = new Set(['address', 'streetAddress', 'postalCode', 'addressLocality', 'geo', 'latitude', 'longitude', 'hasMap', 'aggregateRating', 'review', 'priceRange']);
  function check(value) {
    if (value && typeof value === 'object') for (const [key, nested] of Object.entries(value)) {
      assert.ok(!forbidden.has(key), `Forbidden key: ${key}`);
      check(nested);
    }
  }
  check(business);
});

test('transformation is idempotent and respects existing JSON-LD', () => {
  const html = transformSitewide(source);
  assert.equal(transformSitewide(html), html);
  const existing = source.replace('</head>', '<script type="application/ld+json">{}</script></head>');
  assert.equal((transformSitewide(existing).match(/application\/ld\+json/g) || []).length, 1);
});

test('rejects missing or duplicate footer placeholders and missing head', () => {
  assert.throws(() => transformSitewide(source.replace('<div id="site-footer"></div>', '')), /site-footer/);
  assert.throws(() => transformSitewide(source.replace('</body>', '<div id="site-footer"></div></body>')), /site-footer/);
  assert.throws(() => transformSitewide(source.replace('</head>', '')), /head/);
});
