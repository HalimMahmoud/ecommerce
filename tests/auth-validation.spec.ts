import { test, expect } from '@playwright/test';

test.describe('Authentication Validation Errors', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    const testId = `test_val_${Math.random().toString(36).slice(2, 9)}`;
    await context.setExtraHTTPHeaders({ 'x-test-id': testId });
  });

  test('Register form validation errors (frontend)', async ({ page }) => {
    await page.goto('/auth/register');

    // 1. Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for Zod error messages - using .first() to avoid ambiguity with the bottom notes
    await expect(page.locator('text=Username must be at least 3 characters').first()).toBeVisible();
    await expect(page.locator('text=Email is required').first()).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters').first()).toBeVisible();
    await expect(page.locator('text=Confirm your password').first()).toBeVisible();

    // 2. Invalid email format
    await page.fill('#register-email', 'not-an-email');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/enter a valid email/i).first()).toBeVisible();

    // 3. Password too weak
    await page.fill('#register-password', '12345678'); // 8 digits but no letters/symbols
    await page.click('button[type="submit"]');
    await expect(page.getByText(/password is too weak/i).first()).toBeVisible();

    // 4. Passwords do not match
    await page.fill('#register-password', 'Password123!');
    await page.fill('#register-confirm', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/passwords do not match/i).first()).toBeVisible();
  });

  test('Login form validation errors (frontend)', async ({ page }) => {
    await page.goto('/auth/login');

    // 1. Submit empty form
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/Email or username is required/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Password is required/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Login with incorrect credentials (backend)', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#login-identifier', 'nonexistent_user_9999');
    await page.fill('#login-password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // This message can come from Strapi or our local rate limiter
    await expect(page.locator('text=/Invalid identifier or password|Authentication failed|Too many login attempts/').first()).toBeVisible();
  });
});
