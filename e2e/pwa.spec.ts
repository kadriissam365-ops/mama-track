import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
  test('manifest.json accessible', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('icônes PWA accessibles', async ({ page }) => {
    const manifest = await (await page.request.get('/manifest.json')).json();
    for (const icon of manifest.icons.slice(0, 3)) {
      const response = await page.request.get(icon.src);
      expect(response.status()).toBe(200);
    }
  });

  test('service worker enregistré', async ({ page }) => {
    await page.goto('/');
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(swRegistered).toBe(true);
  });

  test('meta viewport correct', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toContain('user-scalable=no');
  });
});
