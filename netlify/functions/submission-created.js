// Netlify event function: fires automatically on every successful Netlify Form
// submission (the built-in `submission-created` event). It transforms the
// submission into the Flint Systems lead-intake schema and POSTs it to the
// Flint dashboard, so every contact/booking lead lands in Flint automatically.
//
// Inert until two env vars are set on the Tyler Netlify site:
//   FLINT_INTAKE_URL   e.g. https://<flint-site>.netlify.app/api/lead-intake/web_form
//   FLINT_INTAKE_TOKEN the per-client intake token minted for the Tyler client in Flint
// With either missing it no-ops, so it is safe to deploy before Flint is live.
//
// Node 18+ runtime → global fetch is available, no dependencies.

exports.handler = async (event) => {
  const FLINT_URL = process.env.FLINT_INTAKE_URL;
  const FLINT_TOKEN = process.env.FLINT_INTAKE_TOKEN;
  if (!FLINT_URL || !FLINT_TOKEN) {
    console.log('Flint intake not configured (FLINT_INTAKE_URL / FLINT_INTAKE_TOKEN); skipping.');
    return { statusCode: 200, body: 'skipped: not configured' };
  }

  let submission;
  try {
    submission = JSON.parse(event.body).payload;
  } catch {
    return { statusCode: 400, body: 'invalid event body' };
  }

  const form = submission.form_name || '';
  const d = submission.data || {};

  // Only forward known lead forms; ignore anything else.
  if (form !== 'contact' && form !== 'booking') {
    console.log(`Ignoring non-lead form: ${form}`);
    return { statusCode: 200, body: 'ignored' };
  }

  // Fold fields Flint has no dedicated column for into a readable notes string.
  const noteParts = [];
  if (form === 'booking') {
    if (d.notes) noteParts.push(d.notes);
    if (d.visit) noteParts.push(`Preferred time: ${d.visit}`);
    if (d.property) noteParts.push(`Property: ${d.property}`);
    if (d.insurance) noteParts.push(`Insurance: ${d.insurance}`);
  } else {
    // contact form
    if (d.msg) noteParts.push(d.msg);
  }

  const payload = {
    name: d.name || '',
    email: d.email || '',
    phone: d.phone || '',
    address: d.address || '',
    city: d.city || '',
    state: d.state || '',
    zip: d.zip || '',
    project: d.project || '',
    urgency: d.urgency || '',
    // Combined carrier + claim string, e.g. "State Farm · Claim #ABC123" (booking
    // form only; empty for contact + home-services flows). Sent as its own field so
    // Flint can show it on the Edit Lead modal. Still folded into notes above as a
    // transition safety net — drop that once Flint's dedicated Insurance row is live.
    insurance: d.insurance || '',
    notes: noteParts.join('\n'),
    externalId: submission.id, // Netlify submission id → hard dedup in Flint
  };

  try {
    const res = await fetch(FLINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-flint-intake': FLINT_TOKEN,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`Flint intake rejected (${res.status}): ${text}`);
      return { statusCode: 502, body: `flint error ${res.status}` };
    }
    console.log(`Flint intake ok (${res.status}): ${text}`);
    return { statusCode: 200, body: 'forwarded' };
  } catch (err) {
    console.error('Flint intake POST failed:', err);
    return { statusCode: 502, body: 'forward failed' };
  }
};
