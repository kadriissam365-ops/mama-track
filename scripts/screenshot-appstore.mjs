#!/usr/bin/env node
/**
 * Generate App Store screenshots for MamaTrack.
 *
 * Apple requires at least one of:
 *   - 6.7" iPhone (1290×2796 portrait) — current standard
 *   - 6.5" iPhone (1284×2778 or 1242×2688) — accepts 6.7" by default
 *   - 5.5" iPhone (1242×2208 portrait)  — legacy, optional now
 *
 * We capture the public landing page only (no auth needed). Screenshots
 * are saved to ./build/appstore-screenshots/{6.7,5.5}/01-...png etc.
 *
 * Run: node scripts/screenshot-appstore.mjs
 */

import { mkdir, rm } from "node:fs/promises";
import { webkit } from "playwright";

const BASE_URL = process.env.SCREENSHOT_URL ?? "https://mamatrack.fr";

const VIEWPORTS = [
  {
    name: "6.7",
    width: 1290,
    height: 2796,
    deviceScaleFactor: 1,
  },
  {
    name: "5.5",
    width: 1242,
    height: 2208,
    deviceScaleFactor: 1,
  },
];

// Pages we want to capture. Each entry can target a specific anchor on the
// landing page so we get distinct screenshots without needing auth.
const SHOTS = [
  {
    file: "01-hero.png",
    path: "/",
    waitFor: "h1",
    scrollTo: 0,
  },
  {
    file: "02-features.png",
    path: "/",
    waitFor: "h1",
    scrollTo: 1.0,
  },
  {
    file: "03-trackers.png",
    path: "/",
    waitFor: "h1",
    scrollTo: 1.6,
  },
  {
    file: "04-community.png",
    path: "/",
    waitFor: "h1",
    scrollTo: 2.4,
  },
  {
    file: "05-faq.png",
    path: "/",
    waitFor: "h1",
    scrollTo: 3.2,
  },
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
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  for (const shot of SHOTS) {
    const url = `${BASE_URL}${shot.path}?nocache=${Date.now()}`;
    console.log(`  [${vp.name}] → ${shot.file} (${url})`);
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
  console.log(`  ✓ ${vp.name}" → ${outDir}/`);
}

(async () => {
  console.log(`→ Capturing App Store screenshots from ${BASE_URL}`);
  for (const vp of VIEWPORTS) {
    console.log(`\n[${vp.name}" — ${vp.width}×${vp.height}]`);
    await shootViewport(vp);
  }
  console.log(`\n✓ Done. Upload from build/appstore-screenshots/ in App Store Connect.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
