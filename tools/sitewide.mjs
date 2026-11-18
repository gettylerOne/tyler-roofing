const footerPlaceholder = '<div id="site-footer"></div>';
const footerText = 'Tyler Roofing and Home Solutions is a trade name of JD Tyler LLC. Alabama Home Builders Licensure Board License #31643.';
const injectedFooter = `<div id="site-footer"><p class="footer-entity">${footerText}</p></div>`;

const counties = ['Jefferson', 'Shelby', 'Tuscaloosa', 'St. Clair', 'Bibb', 'Talladega', 'Blount', 'Walker', 'Cullman', 'Montgomery', 'Chilton', 'Coosa'];
const cities = ['Birmingham', 'Hoover', 'Vestavia Hills', 'Mountain Brook', 'Homewood', 'Pelham', 'Helena', 'Alabaster', 'Chelsea', 'Calera', 'Columbiana', 'McCalla', 'Leeds'];

const business = {
  '@context': 'https://schema.org',
  '@type': ['RoofingContractor'],
  '@id': 'https://tylerroofingandhomesolutions.com/#business',
  name: 'Tyler Roofing and Home Solutions',
  legalName: 'JD Tyler LLC',
  url: 'https://tylerroofingandhomesolutions.com/',
  telephone: '+1-205-547-0122',
  email: 'tylerroofingandhomesolutions@gmail.com',
  logo: 'https://tylerroofingandhomesolutions.com/assets/img/tyler-logo-green.png',
  founder: { '@type': 'Person', name: 'Jacob Tyler' },
  foundingDate: '2023',
  description: 'Family-run, mobile come-to-you roofing and home services company serving the Birmingham metro and central Alabama, with 24/7 emergency service.',
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
  areaServed: [
    ...counties.map(name => ({ '@type': 'AdministrativeArea', name: `${name} County, AL` })),
    ...cities.map(name => ({ '@type': 'City', name: `${name}, AL` })),
  ],
};

export function transformSitewide(html) {
  const placeholders = html.split(footerPlaceholder).length - 1;
  const injected = html.split(injectedFooter).length - 1;
  if (!((placeholders === 1 && injected === 0) || (placeholders === 0 && injected === 1))) {
    throw new Error('Expected exactly one site-footer placeholder or previously injected footer');
  }
  if (!html.includes('</head>')) throw new Error('Missing </head>');
  if (placeholders) html = html.replace(footerPlaceholder, injectedFooter);
  if (!/<script\b[^>]*\btype\s*=\s*(["'])application\/ld\+json\1/i.test(html)) {
    const json = JSON.stringify(business).replace(/</g, '\\u003c');
    html = html.replace('</head>', `<script type="application/ld+json">${json}</script>\n</head>`);
  }
  return html;
}
