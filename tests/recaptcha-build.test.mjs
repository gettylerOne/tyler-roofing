import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformRecaptcha } from '../tools/recaptcha.mjs';
const key = '6LeTestKeyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const html = `<html><head></head><body><form name="booking" netlify netlify-honeypot="bot-field" hidden></form><form name='contact' data-netlify="true"></form><form name="newsletter"></form><form data-name="booking"></form><form name="booking-extra"></form></body></html>`;
test('no key leaves HTML unchanged', () => {
  for (const value of [undefined, '', '  ']) assert.equal(transformRecaptcha(html, value).html, html);
});
test('valid trimmed key enables only booking and contact and preserves attributes', () => {
  const result = transformRecaptcha(html, ` ${key} `);
  assert.equal(result.forms, 2);
  assert.match(result.html, new RegExp(`<meta name="recaptcha-site-key" content="${key}">\\n</head>`));
  assert.match(result.html, /name="booking" netlify netlify-honeypot="bot-field" hidden data-netlify-recaptcha="true"/);
  assert.match(result.html, /name='contact' data-netlify="true" data-netlify-recaptcha="true"/);
  assert.equal((result.html.match(/data-netlify-recaptcha=/g) || []).length, 2);
  assert.equal(transformRecaptcha(result.html, key).html, result.html);
});
test('invalid configured keys throw', () => {
  for (const value of ['short', '<script>bad-key-value</script>', 'A'.repeat(101)]) {
    assert.throws(() => transformRecaptcha(html, value), /Invalid SITE_RECAPTCHA_KEY/);
  }
});
