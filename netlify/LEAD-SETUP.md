# Lead processing setup

This change is backend-only. Existing HTML, fields, browser validation, buttons,
and on-screen confirmations are unchanged. Netlify retains original submissions.
The event handler forwards the existing fields to Flint. Insurance is forwarded
once in its dedicated field. Unknown fields and browser metadata are excluded.

## What is ready

- Netlify verified `submission-created` event -> Flint intake, using the existing token.
- Optional customer acknowledgment email, when an email address was supplied.
- Optional internal new-lead alert linking to Flint.
- Optional one-time internal reminder scheduled for 24 hours after submission.
- No marketing, SMS, contact-list subscription, or customer reminder sequence.
- Bounded retries, status-only logging, and email idempotency keys per submission/type.

The reminder is an email to the team, not a native Flint task. It cannot inspect
Flint lead status or cancel itself when the team follows up. Its text says to
ignore it if the inquiry is already handled. It may arrive on weekends.

The local Flint intake code was reviewed read-only. It currently deduplicates by
contact within 30 days or external ID and has no outbound email/task API. A repeat
inquiry may be merged without updating details; Netlify retains the original.
Email acknowledgment is per submission, so a genuinely new submission receives a
new acknowledgment even if Flint merges the contact. No Flint files were changed.

## Configuration needed before activation

All email switches default to off. A Resend adapter is provided; no account has
been created and no live credentials were found or configured. If Flint already
uses another provider, adapt delivery before enabling this one.

The owner confirmed existing Netlify email notifications to the owner and the
business inbox. Keep those notifications in place and leave
`LEAD_TEAM_EMAIL_ENABLED` off to avoid duplicate internal alerts. The reported
business address was incomplete in chat; use the existing Netlify configuration
as the source of truth, without guessing or changing recipients. Customer
acknowledgments and scheduled reminders remain off pending separate setup.

Set these in **Netlify server-side environment variables**, not HTML or git:

| Variable | Value |
| --- | --- |
| `FLINT_INTAKE_URL` | Existing HTTPS `/api/lead-intake/web_form` URL, without query string |
| `FLINT_INTAKE_TOKEN` | Existing client intake token |
| `RESEND_API_KEY` | Restricted sending key from the chosen Resend account |
| `LEAD_EMAIL_FROM` | Bare email address on a domain verified with Resend |
| `LEAD_REPLY_TO` | Monitored business email address for customer replies |
| `LEAD_ALERT_TO` | Confirmed team inbox; a single bare email address |
| `FLINT_DASHBOARD_URL` | HTTPS URL of the Tyler client lead dashboard, without a query string |
| `LEAD_CUSTOMER_EMAIL_ENABLED` | `true` to enable customer acknowledgments |
| `LEAD_TEAM_EMAIL_ENABLED` | `true` to enable new-lead alerts |
| `LEAD_REMINDER_EMAIL_ENABLED` | `true` to enable one-time internal reminders |

Use production-scoped settings. Leave email switches off in deploy previews.
Check existing Netlify/Flint notifications before enabling to avoid duplicate alerts.
Disable open/click tracking in the sending domain's Resend settings; messages use
plain text and do not intentionally add tracking. Verify sender DNS and reply routing.
Review privacy policy/provider disclosure before enabling a new email processor.

## Validation and operations

Run `node --test tests/lead-processing.test.js` for offline tests. They send nothing.
Before live activation, use controlled test addresses and check: one lead in Flint,
one confirmation, one team alert, one scheduled reminder, correct reply routing,
and a replay producing no duplicate emails. Confirm the actual deployed Netlify
event includes `id`, `created_at`, `form_name`, and `data`.

Provider acceptance does not guarantee inbox delivery. Monitor Resend deliveries,
bounces and scheduled emails, and Netlify function status. Do not tell the customer
to submit again because an internal integration failed: recover the stored Netlify
submission instead. Persistent failures return 502, after up to two attempts per
channel. There is no added durable retry queue or guaranteed platform redelivery.

Replay the original, unchanged event within 23 hours to retry partial delivery.
Resend idempotency lasts 24 hours; the handler deliberately blocks automatic email
for events older than 23 hours. For older failures, inspect provider history and
resolve only the missing delivery manually. Do not change the event ID/date or
email configuration/copy while retrying. Scheduled reminders already accepted by
Resend must be cancelled in Resend if needed; disabling the switch stops new ones.

The frontend still collects the existing fields and uses its existing required-field
rules. Backend support for phone-only inquiries does not change those browser rules.
No retention/deletion schedule or revised privacy promise is implemented here.

Provider references:
- https://docs.netlify.com/build/functions/trigger-on-events/
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys

## reCAPTCHA

Create a reCAPTCHA v2 “I'm not a robot” checkbox key at
https://www.google.com/recaptcha/admin for tylerroofingandhomesolutions.com,
www.tylerroofingandhomesolutions.com, and the netlify.app domain if used for previews.
In Netlify set SITE_RECAPTCHA_KEY (scopes: Builds + Runtime + Functions) and
SITE_RECAPTCHA_SECRET (scope: Runtime/Functions), then trigger a redeploy.
The build adds the public key and enables verification on the registered forms
only when SITE_RECAPTCHA_KEY is set and valid. Without the key, forms run without
captcha exactly as before. The secret must never be included in published files.
