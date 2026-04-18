import { test, expect } from '@playwright/test';

test.describe('Authentication Security & Robustness', () => {
  test.beforeEach(async ({ context }) => {
    // Ensure each test starts with a fresh session and a unique rate limit ID
    await context.clearCookies();
    const testId = `test_sec_${Math.random().toString(36).slice(2, 9)}`;
    await context.setExtraHTTPHeaders({ 'x-test-id': testId });
  });

  test('Redirect logged-in user away from auth pages', async ({ page }) => {
    const random = Math.floor(Math.random() * 100000);
    const username = `e2e_sec_${random}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // 1. Register and stay logged in
    await page.goto('/auth/register');
    await page.fill('#register-username', username);
    await page.fill('#register-email', email);
    await page.fill('#register-password', password);
    await page.fill('#register-confirm', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 2. Try to visit login page while logged in
    await page.goto('/auth/login');
    
    // Victory Condition: Redirected back to home (assuming this logic exists in middleware or component)
    // If it doesn't exist yet, this test will fail and we'll know to add it.
    await expect(page).toHaveURL('/');
  });

  test('URL Parameter Robustness', async ({ page }) => {
    // Visit auth pages with various garbage parameters
    const garbageParams = [
      '/auth/login?exploit=true&script=<script>alert(1)</script>',
      '/auth/register?lang=invalid&theme=unknown',
      '/auth/forgot-password?email=test@example.com&token=fake_token_123',
    ];

    test.slow(); // Triple the default timeout for this robustness check
    for (const url of garbageParams) {
      await page.goto(url);
      // Ensure the page renders and doesn't crash (form or main content should be present)
      await expect(page.locator('form, main').first()).toBeVisible();
    }
  });

  test('Rate Limiting Simulation', async ({ page, context }) => {
    // For this specific test, we REMOVE the x-test-id and e2e_ identifier 
    // to strictly verify the real IP-based rate limiter logic.
    await context.setExtraHTTPHeaders({}); 
    
    await page.goto('/auth/login');
    
    // Fill the form with wrong credentials to avoid frontend-only validation blocking
    await page.fill('#login-identifier', 'spammer_ident');
    await page.fill('#login-password', 'wrong_pass');
    
    for (let i = 0; i < 7; i++) {
        await page.click('button[type="submit"]');
        // Wait for the response so we don't just click 10 times in 1ms
        await page.waitForTimeout(300); 
    }

    await expect(page.locator('text=/Too many login attempts|Too many attempts/').first()).toBeVisible({ timeout: 10000 });
  });
});
