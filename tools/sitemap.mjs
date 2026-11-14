import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://tylerroofingandhomesolutions.com";

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort();
}

export function generateSitemap(root = ROOT) {
  const pages = [
    ...htmlFiles(root).sort((a, b) => a === "index.html" ? -1 : b === "index.html" ? 1 : a < b ? -1 : a > b ? 1 : 0),
    ...htmlFiles(join(root, "areas")).map((name) => `areas/${name}`),
    ...htmlFiles(join(root, "materials")).map((name) => `materials/${name}`),
  ];
  const urls = pages.map((page) => `${ORIGIN}/${page === "index.html" ? "" : page.split("/").map(encodeURIComponent).join("/")}`);
  const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
  return { xml, urls };
}

export function writeSitemap(root = ROOT) {
  const sitemap = generateSitemap(root);
  writeFileSync(join(root, "sitemap.xml"), sitemap.xml);
  return sitemap;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { urls } = writeSitemap();
  console.log(`Wrote sitemap.xml with ${urls.length} URLs.`);
}
