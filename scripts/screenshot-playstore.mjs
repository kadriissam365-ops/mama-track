#!/usr/bin/env node
/**
 * Generate Google Play Store screenshots for MamaTrack.
 *
 * Google Play requires:
 *   - Phone: min 2, max 8 — 1080×1920+ portrait (or landscape)
 *   - 7" tablet (optional): min 1, max 8 — 1200×1920+
 *   - 10" tablet (optional): min 1, max 8 — 1920×1200+
 *
 * We capture the public landing page only (no auth needed).
 * Output: build/appstore-screenshots/android-phone/01-...png etc.
 *
 * Run: node scripts/screenshot-playstore.mjs
 */

import { mkdir, rm } from "node:fs/promises";
import { webkit } from "playwright";

const BASE_URL = process.env.SCREENSHOT_URL ?? "https://mamatrack.fr";

const VIEWPORTS = [
  {
    name: "android-phone",
    width: 1080,
    height: 2400,
    deviceScaleFactor: 1,
    description: "Pixel 8-class phone (1080×2400, 20:9)",
  },
  {
    name: "android-tablet-7",
    width: 1200,
    height: 1920,
    deviceScaleFactor: 1,
    description: "7-inch tablet",
  },
];

const SHOTS = [
  { file: "01-hero.png", path: "/", waitFor: "h1", scrollTo: 0 },
  { file: "02-features.png", path: "/", waitFor: "h1", scrollTo: 1.0 },
  { file: "03-trackers.png", path: "/", waitFor: "h1", scrollTo: 1.6 },
  { file: "04-community.png", path: "/", waitFor: "h1", scrollTo: 2.4 },
  { file: "05-faq.png", path: "/", waitFor: "h1", scrollTo: 3.2 },
];

async function shootViewport(vp) {
  const outDir = `build/appstore-screenshots/${vp.name}`;
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const browser = await webkit.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  for (const shot of SHOTS) {
    const url = `${BASE_URL}${shot.path}?nocache=${Date.now()}`;
    console.log(`  [${vp.name}] → ${shot.file}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    if (shot.waitFor) {
      await page.waitForSelector(shot.waitFor, { timeout: 10000 }).catch(() => {});
    }
    if (shot.scrollTo !== undefined) {
      await page.evaluate(({ vh, factor }) => {
        window.scrollTo({ top: vh * factor, behavior: "instant" });
      }, { vh: vp.height, factor: shot.scrollTo });
      await page.waitForTimeout(800);
    }
    await page.screenshot({
      path: `${outDir}/${shot.file}`,
      fullPage: false,
    });
  }

  await browser.close();
  console.log(`  ✓ ${vp.name} (${vp.description}) → ${outDir}/`);
}

(async () => {
  console.log(`→ Capturing Play Store screenshots from ${BASE_URL}`);
  for (const vp of VIEWPORTS) {
    console.log(`\n[${vp.name} — ${vp.width}×${vp.height}]`);
    await shootViewport(vp);
  }
  console.log(`\n✓ Done. Upload from build/appstore-screenshots/ in Play Console.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
