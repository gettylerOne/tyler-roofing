import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeSitemap } from "./sitemap.mjs";

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
