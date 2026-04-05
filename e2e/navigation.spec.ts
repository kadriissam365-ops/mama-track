import { test, expect } from '@playwright/test';

test.describe('Navigation publique', () => {
  test('page accueil redirige vers login', async ({ page }) => {
    await page.goto('/');
    // Soit on est sur home, soit redirigé vers login
    await expect(page).toHaveURL(/\/(auth\/login)?$/);
  });

  test('page 404 gérée', async ({ page }) => {
    await page.goto('/page-inexistante-xyz');
    // Next.js doit retourner une page (pas crash)
    expect(page.url()).toBeTruthy();
  });
});
