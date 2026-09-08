const { createHash } = require('node:crypto');
const BUSINESS = 'Tyler Roofing and Home Solutions';
const PHONE = '205-547-0122';
const EMAIL = /^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/;
const HOUR = 3600000;

function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}

function normalize(submission) {
  if (!submission || typeof submission !== 'object' || Array.isArray(submission)) throw new Error('invalid payload');
  if (!['contact', 'booking'].includes(submission.form_name)) return null;
  const data = submission.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid fields');
  if (data['bot-field']) return null;
  if (typeof submission.id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(submission.id)) throw new Error('invalid submission id');
  function field(key, max = 500) {
    const value = data[key];
    if (value == null) return '';
    if (typeof value !== 'string' || value.length > max || value.includes('\0')) throw new Error('invalid field');
    return value.trim();
  }
  const payload = {
    name: field('name', 200), email: field('email', 254), phone: field('phone', 40),
    address: field('address'), city: field('city', 200), state: field('state', 50),
    zip: field('zip', 20), project: field('project', 200), urgency: field('urgency', 200),
    insurance: field('insurance'), externalId: submission.id,
  };
  if (!payload.name || (!payload.email && !payload.phone)) throw new Error('missing contact');
  if (payload.email && !EMAIL.test(payload.email)) throw new Error('invalid email');
  if (payload.phone && !/^1?\d{10}$/.test(payload.phone.replace(/\D/g, ''))) throw new Error('invalid phone');
  const notes = submission.form_name === 'booking'
    ? [field('notes', 10000), field('visit', 200) && `Preferred time: ${field('visit', 200)}`,
      field('property', 200) && `Property: ${field('property', 200)}`]
    : [field('msg', 10000)];
  // Insurance has a dedicated Flint field; do not duplicate it in notes.
  // Unknown fields, IP addresses, cookies and browser data are not forwarded.
  payload.notes = notes.filter(Boolean).join('\n');
  return payload;
}

function emailJobs(payload, submission, env, now) {
  const enabled = ['LEAD_CUSTOMER_EMAIL_ENABLED', 'LEAD_TEAM_EMAIL_ENABLED', 'LEAD_REMINDER_EMAIL_ENABLED'];
  if (!enabled.some(key => env[key] === 'true')) return [];
  if (!env.RESEND_API_KEY || !EMAIL.test(env.LEAD_EMAIL_FROM || '') || !EMAIL.test(env.LEAD_REPLY_TO || '')) {
    throw new Error('email configuration');
  }
  const teamEnabled = env.LEAD_TEAM_EMAIL_ENABLED === 'true' || env.LEAD_REMINDER_EMAIL_ENABLED === 'true';
  if (teamEnabled && (!EMAIL.test(env.LEAD_ALERT_TO || '') || !httpsUrl(env.FLINT_DASHBOARD_URL))) {
    throw new Error('team configuration');
  }
  const created = Date.parse(submission.created_at);
  // Resend retains keys for 24h. Old events need manual reconciliation rather
  // than an automatic replay outside the duplicate-protection window.
  if (!Number.isFinite(created) || created > now + 5 * 60000 || now - created >= 23 * HOUR) {
    throw new Error('email replay needs manual review');
  }
  const base = { from: `${BUSINESS} <${env.LEAD_EMAIL_FROM}>`, reply_to: env.LEAD_REPLY_TO };
  const jobs = [];
  if (env.LEAD_CUSTOMER_EMAIL_ENABLED === 'true' && payload.email) {
    jobs.push({ kind: 'confirmation', body: {
      ...base, to: [payload.email], subject: `We received your request - ${BUSINESS}`,
      // Never echo free-text fields, access codes, or insurance details.
      text: `Thanks for contacting ${BUSINESS}. We received your website request.\n\nOur team will contact you to discuss your project. Your inspection is not scheduled until we confirm it with you.\n\nIf you need to reach us, call ${PHONE} or reply to this email.\n\n${BUSINESS}\nhttps://tylerroofingandhomesolutions.com`,
    } });
  }
  const teamText = `A website inquiry was received.\n\nReference: ${submission.id}\n\nOpen Flint to review the lead and record your follow-up: ${env.FLINT_DASHBOARD_URL}\n\nIf the lead is missing from Flint, check Netlify Forms and the submission-created function status. The original inquiry is retained in Netlify.\n\nContact the customer about their request and confirm any inspection directly. Mark your progress in Flint.`;
  if (env.LEAD_TEAM_EMAIL_ENABLED === 'true') {
    jobs.push({ kind: 'team-alert', body: { ...base, to: [env.LEAD_ALERT_TO], subject: 'New Tyler Roofing website inquiry', text: teamText } });
  }
  if (env.LEAD_REMINDER_EMAIL_ENABLED === 'true') {
    jobs.push({ kind: 'team-reminder', body: {
      ...base, to: [env.LEAD_ALERT_TO], subject: 'Review follow-up for a Tyler Roofing website inquiry',
      text: `Please check whether this inquiry has been followed up in Flint. If it has already been handled, no further action is needed. This is a one-time reminder, not a check of the lead's current status.\n\n${teamText}`,
      scheduled_at: new Date(created + 24 * HOUR).toISOString(),
    } });
  }
  return jobs;
}

function createHandler(options = {}) {
  // Tests inject dependencies: no real leads or emails are sent.
  const env = options.env || process.env;
  const fetcher = options.fetch || globalThis.fetch;
  const now = options.now || Date.now;
  const sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const log = options.log || console;
  async function post(url, headers, body) {
    // Retry transient failures only, with stable external IDs / email keys.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetcher(url, {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(2500),
          headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
        });
        if (response.ok) return true;
        if (response.status !== 429 && response.status < 500) return false;
      } catch { /* Errors may include tokens or personal data; do not log them. */ }
      if (attempt < 1) await sleep(1000);
    }
    return false;
  }
  return async function handler(event) {
    let submission, payload;
    try {
      submission = JSON.parse(event.body).payload;
      payload = normalize(submission);
    } catch { return { statusCode: 400, body: 'invalid submission' }; }
    if (!payload) return { statusCode: 200, body: 'ignored' };
    const status = { flint: 'not_configured', email: {} };
    if (httpsUrl(env.FLINT_INTAKE_URL) && env.FLINT_INTAKE_TOKEN) {
      const forwarded = await post(env.FLINT_INTAKE_URL, { 'x-flint-intake': env.FLINT_INTAKE_TOKEN }, payload);
      status.flint = forwarded ? 'accepted' : 'failed';
    }
    let jobs = [];
    try { jobs = emailJobs(payload, submission, env, now()); }
    catch { status.email.configuration = 'needs_review'; }
    for (const job of jobs) {
      const key = createHash('sha256').update(`tyler:${submission.id}:${job.kind}:v1`).digest('hex');
      const sent = await post('https://api.resend.com/emails', {
        Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Idempotency-Key': key,
      }, job.body);
      status.email[job.kind] = sent ? 'accepted' : 'failed';
    }
    // Acceptance is not inbox delivery. Log statuses only, never provider bodies.
    log.info('lead processing', status);
    const failed = status.flint !== 'accepted' || Object.values(status.email).some(value => value !== 'accepted');
    return { statusCode: failed ? 502 : 200, body: JSON.stringify(status) };
  };
}
module.exports = { createHandler, normalize, emailJobs };
