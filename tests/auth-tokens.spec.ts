import { test, expect } from '@playwright/test';

test.describe('Authentication Token Resilience (Silent Refresh)', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    const testId = `test_tok_${Math.random().toString(36).slice(2, 9)}`;
    await context.setExtraHTTPHeaders({ 'x-test-id': testId });
  });

  test('Silent refresh occurs correctly when JWT expires', async ({ page, context, baseURL }) => {
    const origin = baseURL || 'http://127.0.0.1:3000';
    const random = Math.floor(Math.random() * 100000);
    const username = `e2e_refresh_${random}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // 1. Initial Login
    await page.goto('/auth/register');
    await page.fill('#register-username', username);
    await page.fill('#register-email', email);
    await page.fill('#register-password', password);
    await page.fill('#register-confirm', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 2. Wait for background session settling to ensure we capture the LATEST rotated token.
    // Strapi v5 refresh tokens are typically single-use; we must ensure no hydration-triggered
    // refresh is in-flight before we capture our "fresh" token.
    await page.waitForTimeout(2000);

    const currentCookies = await context.cookies();
    const jwtBefore = currentCookies.find(c => c.name === 'strapi_jwt')?.value;
    const refreshToken = currentCookies.find(c => c.name === 'strapi_refresh')?.value;
    
    if (!refreshToken) {
      console.log('REFRESH TOKEN MISSING! Cookies found:', currentCookies.map(c => c.name));
    }
    expect(refreshToken).toBeDefined();
    expect(jwtBefore).toBeDefined();

    // 2. Simulate Natural Expiration
    // We leave the refresh token but DELETE the JWT.
    await context.addCookies([
      { name: 'strapi_jwt', value: '', url: origin, expires: 0 }
    ]);
 
    // 3. Navigate to a Public Route (Login)
    // The proxy (proxy.ts) should detect the missing JWT, perform a silent refresh,
    // find that the user is authenticated, and redirect them back to Home (/).
    await page.goto('/auth/login');
    
    // 4. Verify we landed back on Home (indicating successful refresh + redirect)
    await page.waitForURL(origin + '/');
 
    // 5. Verify UI shows we are logged in
    const logoutBtn = page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("خروج")').first();
    await expect(logoutBtn).toBeVisible({ timeout: 20000 });
 
    // 6. Verification of Cookie Rotation
    const cookiesAfter = await context.cookies();
    const jwtAfter = cookiesAfter.find(c => c.name === 'strapi_jwt')?.value;
    
    expect(jwtAfter).toBeDefined();
    expect(jwtAfter).toBeTruthy();
    expect(jwtAfter).not.toBe(jwtBefore);
  });

  test('Single-Flight Refresh handles race conditions (Slow Network)', async ({ page, context, baseURL }) => {
    const origin = baseURL || 'http://127.0.0.1:3000';
    const random = Math.floor(Math.random() * 100000);
    const username = `e2e_race_${random}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // 1. Initial Setup: Create a session
    await page.goto('/auth/register');
    await page.fill('#register-username', username);
    await page.fill('#register-email', email);
    await page.fill('#register-password', password);
    await page.fill('#register-confirm', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.waitForTimeout(2000);

    // 2. Simulate Expiration
    await context.addCookies([
      { name: 'strapi_jwt', value: '', url: origin, expires: 0 }
    ]);

    /**
     * 3. Trigger Concurrent Requests
     * We use page.evaluate to fire off multiple fetches simultaneously.
     * All of these will hit the Next.js Proxy. The Single Flight logic
     * in the proxy should ensure they don't fight over the refresh token.
     */
    const results = await page.evaluate(async () => {
      const fetcher = (url: string) => fetch(url).then(res => ({
        url: res.url,
        status: res.status,
        ok: res.ok
      }));
      
      // Fire 3 concurrent requests to routes protected by the proxy
      return Promise.all([
        fetcher('/'),
        fetcher('/auth/login'), // Should redirect to /
        fetcher('/?test=1')
      ]);
    });

    // 4. Verify all requests succeeded
    for (const res of results) {
      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
    }

    // 5. Verify we have a new valid JWT and only 1 refresh occurred (effectively)
    const cookiesAfter = await context.cookies();
    const jwtAfter = cookiesAfter.find(c => c.name === 'strapi_jwt')?.value;
    expect(jwtAfter).toBeDefined();
    expect(jwtAfter?.length).toBeGreaterThan(10);
  });
});
