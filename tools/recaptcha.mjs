// Pure build-only transform: source pages never opt forms into reCAPTCHA.
export function recaptchaKey(value = '') {
  const key = value.trim();
  if (key && !/^[A-Za-z0-9_-]{20,100}$/.test(key)) {
    throw new Error('Invalid SITE_RECAPTCHA_KEY: expected 20–100 letters, digits, underscores or hyphens.');
  }
  return key;
}

export function transformRecaptcha(html, value = '') {
  const key = recaptchaKey(value);
  if (!key) return { html, forms: 0 };
  let forms = 0;
  html = html.replace(/<form\b[^>]*>/gi, tag => {
    // Match a real name attribute, not data-name or a name inside another value.
    const attrs = [...tag.matchAll(/([^\s=<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)];
    const name = attrs.find(a => a[1].toLowerCase() === 'name');
    if (!name || !['booking', 'contact'].includes(name[2] ?? name[3] ?? name[4])) return tag;
    forms++;
    return /\sdata-netlify-recaptcha\s*=/i.test(tag) ? tag : tag.replace(/>$/, ' data-netlify-recaptcha="true">');
  });
  if (!/<meta\b[^>]*\bname=["']recaptcha-site-key["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `<meta name="recaptcha-site-key" content="${key}">\n</head>`);
  }
  return { html, forms };
}
