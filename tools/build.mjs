import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeSitemap } from "./sitemap.mjs";
import { transformSitewide } from "./sitewide.mjs";

import { recaptchaKey, transformRecaptcha } from "./recaptcha.mjs";

const siteKey = recaptchaKey(process.env.SITE_RECAPTCHA_KEY);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const { urls } = writeSitemap(ROOT);
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);

let copied = 0;
function copyPublic(source, destination) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "Thumbs.db" ||
        extname(entry.name).toLowerCase() === ".md" ||
        /^(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml)$/i.test(entry.name)) continue;
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(to);
      copyPublic(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
      copied++;
    }
  }
}

const files = readdirSync(ROOT, { withFileTypes: true })
  .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && entry.name.endsWith(".html"))
  .map((entry) => entry.name);
files.push("llms.txt", "robots.txt", "sitemap.xml");
for (const optional of ["_redirects", "_headers", "favicon.ico"]) {
  if (existsSync(join(ROOT, optional))) files.push(optional);
}
for (const name of files.sort()) {
  copyFileSync(join(ROOT, name), join(DIST, name));
  copied++;
}
for (const name of ["areas", "materials", "assets"]) {
  mkdirSync(join(DIST, name));
  copyPublic(join(ROOT, name), join(DIST, name));
}
console.log(`Built dist/: ${copied} public files copied; sitemap contains ${urls.length} URLs.`);

function applySitewide(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) applySitewide(path);
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".html") {
      try {
        writeFileSync(path, transformSitewide(readFileSync(path, "utf8")));
      } catch (error) {
        throw new Error(`Sitewide transform failed for ${path}: ${error.message}`, { cause: error });
      }
    }
  }
}
applySitewide(DIST);

if (siteKey) {
  let pages = 0, forms = 0;
  function enableRecaptcha(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) enableRecaptcha(path);
      else if (entry.isFile() && extname(entry.name).toLowerCase() === ".html") {
        const result = transformRecaptcha(readFileSync(path, "utf8"), siteKey);
        writeFileSync(path, result.html);
        pages++;
        forms += result.forms;
      }
    }
  }
  enableRecaptcha(DIST);
  console.log(`reCAPTCHA on: ${pages} pages and ${forms} forms updated.`);
} else {
  console.log("reCAPTCHA is off (SITE_RECAPTCHA_KEY not set).");
}
