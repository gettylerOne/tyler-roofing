const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../netlify/lib/lead-processing');
const now = Date.parse('2026-09-08T15:00:00Z');
const base = {
  id: 'submission-123', form_name: 'booking', created_at: new Date(now).toISOString(),
  data: { name: 'Test Customer', email: 'customer@example.com', phone: '(205) 555-0123',
    address: '123 Test Street', city: 'Columbiana', state: 'AL', zip: '35051',
    project: 'Repair', urgency: 'This month', property: 'Owner', visit: 'Tuesday morning',
    insurance: 'Carrier - claim private123', notes: 'Gate code private456',
    ip: '192.0.2.1', cookies: 'tracking123', unknown: 'ignore me' },
};
const settings = {
  FLINT_INTAKE_URL: 'https://flint.example.com/api/lead-intake/web_form', FLINT_INTAKE_TOKEN: 'secret-flint',
  RESEND_API_KEY: 'secret-email', LEAD_EMAIL_FROM: 'requests@example.com',
  LEAD_REPLY_TO: 'office@example.com', LEAD_ALERT_TO: 'team@example.com',
  FLINT_DASHBOARD_URL: 'https://flint.example.com/dashboard',
  LEAD_CUSTOMER_EMAIL_ENABLED: 'true', LEAD_TEAM_EMAIL_ENABLED: 'true', LEAD_REMINDER_EMAIL_ENABLED: 'true',
};
function fixture(env = {}, response = () => ({ ok: true, status: 200 })) {
  const calls = [], logs = [];
  const handler = createHandler({ env: { ...settings, ...env }, now: () => now, sleep: async () => {},
    log: { info: (...args) => logs.push(args) },
    fetch: async (url, init) => {
      const call = { url, ...init, body: JSON.parse(init.body) }; calls.push(call);
      return response(call, calls.length);
    },
  });
  return { calls, logs, run: (submission = base) => handler({ body: JSON.stringify({ payload: submission }) }), handler };
}

test('preserves collected project details in Flint; emails and logs omit sensitive lead data', async () => {
  const f = fixture(); assert.equal((await f.run()).statusCode, 200);
  assert.equal(f.calls.length, 4);
  const lead = f.calls[0].body;
  assert.equal(lead.insurance, base.data.insurance);
  assert.equal(lead.address, base.data.address);
  assert.equal(lead.externalId, base.id);
  assert.match(lead.notes, /Preferred time: Tuesday morning/);
  assert.ok(!lead.notes.includes(base.data.insurance));
  for (const key of ['ip', 'cookies', 'unknown']) assert.ok(!(key in lead));
  const mail = f.calls.slice(1);
  assert.deepEqual(mail[0].body.to, ['customer@example.com']);
  assert.match(mail[0].body.text, /not scheduled until we confirm/);
  assert.equal(mail[0].body.reply_to, 'office@example.com');
  assert.deepEqual(mail[1].body.to, ['team@example.com']);
  assert.equal(mail[2].body.scheduled_at, '2026-09-09T15:00:00.000Z');
  assert.match(mail[2].body.text, /already been handled/);
  for (const value of ['private123', 'private456', '123 Test Street', 'secret-flint']) {
    assert.ok(!JSON.stringify(mail.map(c => c.body)).includes(value));
    assert.ok(!JSON.stringify(f.logs).includes(value));
  }
});

test('contact messages map to Flint notes; phone-only inquiry gets no customer email', async () => {
  const f = fixture();
  await f.run({ ...base, form_name: 'contact', data: { name: 'Test', phone: '2055550123', msg: 'Repair inquiry' } });
  assert.equal(f.calls[0].body.notes, 'Repair inquiry');
  assert.equal(f.calls.length, 3);
  assert.ok(f.calls.slice(1).every(c => c.body.to[0] === 'team@example.com'));
});

test('email-only contact is accepted with an optional empty message', async () => {
  const f = fixture();
  assert.equal((await f.run({ ...base, form_name: 'contact', data: { name: 'Test', email: 'test@example.com' } })).statusCode, 200);
});

test('malformed events are rejected and spam / unrelated forms ignored without network calls', async () => {
  const f = fixture();
  for (const payload of [null, {}, { ...base, id: '' }, { ...base, data: [] },
    { ...base, data: { ...base.data, email: 'test@example.com\r\nBcc: bad@example.com' } },
    { ...base, data: { ...base.data, phone: ['2055550123'] } }]) {
    const result = await f.run(payload);
    assert.ok([200, 400].includes(result.statusCode));
  }
  assert.equal((await f.handler({ body: '{broken' })).statusCode, 400);
  assert.equal((await f.run({ ...base, form_name: 'newsletter' })).body, 'ignored');
  assert.equal((await f.run({ ...base, data: { ...base.data, 'bot-field': 'spam' } })).body, 'ignored');
  assert.equal(f.calls.length, 0);
});

test('disabled email features require no email provider configuration', async () => {
  const f = fixture({ LEAD_CUSTOMER_EMAIL_ENABLED: 'false', LEAD_TEAM_EMAIL_ENABLED: 'false', LEAD_REMINDER_EMAIL_ENABLED: 'false', RESEND_API_KEY: '' });
  assert.equal((await f.run()).statusCode, 200); assert.equal(f.calls.length, 1);
});

test('configuration failures are visible while the independent channel still runs', async () => {
  const f = fixture({ RESEND_API_KEY: '' });
  assert.equal((await f.run()).statusCode, 502); assert.equal(f.calls.length, 1);
  const g = fixture({ FLINT_INTAKE_URL: 'http://unsafe.example.com' });
  assert.equal((await g.run()).statusCode, 502);
  assert.equal(g.calls.length, 3); assert.ok(g.calls.every(c => c.url.includes('resend.com')));
});

test('retries temporary failures with the same key; replay preserves keys and scheduled time', async () => {
  let firstEmail = true;
  const f = fixture({}, call => {
    if (call.url.includes('resend') && firstEmail) { firstEmail = false; return { ok: false, status: 429 }; }
    return { ok: true, status: 200 };
  });
  assert.equal((await f.run()).statusCode, 200);
  assert.equal(f.calls[1].headers['Idempotency-Key'], f.calls[2].headers['Idempotency-Key']);
  const initial = f.calls.slice(2).map(c => [c.headers['Idempotency-Key'], c.body]);
  f.calls.length = 0; await f.run();
  assert.deepEqual(f.calls.slice(1).map(c => [c.headers['Idempotency-Key'], c.body]), initial);
});

test('old replay forwards to Flint but cannot send duplicate email after key expiry', async () => {
  const f = fixture();
  const result = await f.run({ ...base, created_at: new Date(now - 24 * 3600000).toISOString() });
  assert.equal(result.statusCode, 502); assert.equal(f.calls.length, 1);
});

test('Flint outage retries finitely; team still gets notified and failure is visible', async () => {
  const f = fixture({}, call => ({ ok: !call.url.includes('flint.example'), status: call.url.includes('flint.example') ? 503 : 200 }));
  assert.equal((await f.run()).statusCode, 502);
  assert.equal(f.calls.filter(c => c.url.includes('flint.example')).length, 2);
  assert.equal(f.calls.filter(c => c.url.includes('resend.com')).length, 3);
});

test('permanent email rejection is not retried and does not suppress other messages', async () => {
  const f = fixture({}, call => ({ ok: call.body.to?.[0] !== 'customer@example.com', status: call.body.to?.[0] === 'customer@example.com' ? 422 : 200 }));
  assert.equal((await f.run()).statusCode, 502); assert.equal(f.calls.length, 4);
});

test('captcha submission is forwarded without exposing its token in payloads', async () => {
  const f = fixture();
  const token = 'private-captcha-token';
  const result = await f.run({ ...base, data: { ...base.data, 'g-recaptcha-response': token } });
  assert.equal(result.statusCode, 200);
  assert.equal(f.calls[0].body.externalId, base.id);
  assert.ok(!JSON.stringify(f.calls.map(call => call.body)).includes(token));
  assert.ok(!('g-recaptcha-response' in f.calls[0].body));
});
