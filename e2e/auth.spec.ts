import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('page login accessible', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/MamaTrack/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('page signup accessible', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('redirect vers login si non authentifié', async ({ page }) => {
    await page.goto('/tracking');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('formulaire login - validation email invalide', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'pas-un-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    // Le navigateur devrait bloquer avec HTML5 validation
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
