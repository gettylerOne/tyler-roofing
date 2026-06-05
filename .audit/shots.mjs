import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });

// 320 = iPhone SE; 900 = awkward tablet (nav just collapsed); 1024 = nav links tight
const JOBS = [
  ["/index.html", 320, "real-idx-320"],
  ["/index.html", 768, "real-idx-768"],
  ["/index.html", 900, "real-idx-900"],
  ["/index.html", 1024, "real-idx-1024"],
  ["/services.html", 360, "real-svc-360"],
  ["/contact.html", 360, "real-contact-360"],
];
const extra = [];
for (const [path, width, name] of JOBS) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2, isMobile: width < 880, hasTouch: width < 880 });
  await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 300));
  const ov = await page.evaluate((vw) => document.documentElement.scrollWidth - vw, width);
  extra.push({ name, path, width, overflow: ov });
  await page.screenshot({ path: `C:\\AI Projects\\Tyler Roofing\\.audit\\${name}.png`, fullPage: false });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(extra, null, 2));
