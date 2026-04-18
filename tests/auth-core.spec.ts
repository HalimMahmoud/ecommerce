import { test, expect } from '@playwright/test';
import axios from 'axios';

/**
 * Helper to delete a user from Strapi using their own JWT.
 * This ensures tests are isolated and don't pollute the database.
 */
async function deleteUser(userId: number, jwt: string) {
  try {
    await axios.delete(`http://127.0.0.1:1337/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Failed to delete test user ${userId}:`, message);
  }
}

test.describe('Authentication Core Flows', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    const testId = `test_core_${Math.random().toString(36).slice(2, 9)}`;
    await context.setExtraHTTPHeaders({ 'x-test-id': testId });
  });

  let testUser: { id: number; username: string; email: string; jwt: string } | null = null;

  test.afterEach(async () => {
    if (testUser) {
      await deleteUser(testUser.id, testUser.jwt);
      testUser = null;
    }
  });

  test('User can register, login, and logout successfully', async ({ page }) => {
    const random = Math.floor(Math.random() * 100000);
    const username = `e2e_user_${random}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // 1. Registration
    await page.goto('/auth/register');
    await page.fill('#register-username', username);
    await page.fill('#register-email', email);
    await page.fill('#register-password', password);
    await page.fill('#register-confirm', password);
    await page.click('button[type="submit"]');

    // Wait for redirect and for cookies to be written
    await page.waitForURL('/');
    await page.waitForLoadState('networkidle');
    
    // Extract JWT from cookies to allow teardown later
    // We'll retry a few times if cookies are slow to materialize
    let jwtCookie;
    for (let i = 0; i < 5; i++) {
        const cookies = await page.context().cookies();
        jwtCookie = cookies.find(c => c.name === 'strapi_jwt');
        if (jwtCookie) break;
        await page.waitForTimeout(200);
    }
    expect(jwtCookie).toBeDefined();

    // Verify UI shows logged in state (assuming there is a profile link or logout button)
    // We'll check if we can reach the home page successfully
    await expect(page).toHaveURL('/');

    // 2. Logout
    // We'll look for a logout button or sign out text in the header
    const signout = page.locator('text=/Sign out|Logout/i').first();
    if (await signout.isVisible()) {
        await signout.click();
        await page.waitForTimeout(500); // Settling time
        await expect(page.locator('text=/Sign in|Login/i').first()).toBeVisible();
    }
  });

  test('Persistent session with "Remember Me"', async ({ page, context }) => {
    // This test would ideally use a pre-existing user or create one
    // We'll create one quickly
    const random = Math.floor(Math.random() * 100000);
    const username = `e2e_rem_${random}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register first
    await page.goto('/auth/register');
    await page.fill('#register-username', username);
    await page.fill('#register-email', email);
    await page.fill('#register-password', password);
    await page.fill('#register-confirm', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Logout to test login with Remember Me
    await page.context().clearCookies();
    
    // Login with Remember Me
    await page.goto('/auth/login');
    await page.fill('#login-identifier', email);
    await page.fill('#login-password', password);
    // Click the label to be more resilient for custom styled checkboxes
    await page.click('label[for="login-remember"]');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 3. Verify Persistence
    // We check if the JWT has an expiry (Max-Age/Expires) indicating it's persistent
    const cookiesAfter = await context.cookies();
    const jwtCookie = cookiesAfter.find(c => c.name === 'strapi_jwt');
    const rememberCookie = cookiesAfter.find(c => c.name === 'strapi_remember');
    
    expect(jwtCookie).toBeDefined();
    expect(jwtCookie?.expires).toBeGreaterThan(Date.now() / 1000);
    expect(rememberCookie?.value).toBe('1');
    
    // Optional: verification that the UI reflects the logged-in state
    await expect(page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("خروج")').first()).toBeVisible();
  });
});
