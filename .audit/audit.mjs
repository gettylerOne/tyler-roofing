import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const PAGES = ["/index.html", "/services.html", "/areas.html", "/contact.html", "/reviews.html"];
const WIDTHS = [360, 390, 414, 480, 768];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});

const report = [];
for (const path of PAGES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 250)); // let header/footer inject

    const data = await page.evaluate((vw) => {
      const docW = document.documentElement.scrollWidth;
      const overflow = docW - vw;
      const offenders = [];
      if (overflow > 1) {
        const all = document.querySelectorAll("*");
        for (const elNode of all) {
          const r = elNode.getBoundingClientRect();
          if (r.right > vw + 1 && r.width <= vw + 2 && r.width > 4) {
            offenders.push({
              tag: elNode.tagName.toLowerCase(),
              cls: (elNode.className || "").toString().slice(0, 40),
              right: Math.round(r.right),
              w: Math.round(r.width),
            });
          }
        }
      }
      // header state
      const burger = document.querySelector(".mobile-toggle");
      const burgerShown = burger ? getComputedStyle(burger).display !== "none" : null;
      const burgerR = burger ? burger.getBoundingClientRect() : null;
      const burgerOffscreen = burgerR ? burgerR.right > vw + 1 || burgerR.left < -1 : null;
      const navlinks = document.querySelector(".navlinks");
      const navShown = navlinks ? getComputedStyle(navlinks).display !== "none" : null;
      const full = document.querySelector(".book-label-full");
      const short = document.querySelector(".book-label-short");
      const labelShown = full && getComputedStyle(full).display !== "none" ? "full" : short && getComputedStyle(short).display !== "none" ? "short" : "?";
      return {
        docW, overflow,
        offenders: offenders.slice(0, 6),
        burgerShown, burgerOffscreen, navShown, labelShown,
      };
    }, width);

    report.push({ path, width, ...data });
    await page.close();
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
