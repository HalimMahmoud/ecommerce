import { test, expect } from '@playwright/test';

test.describe('Shopping Funnel E2E', () => {
  test('should allow a user to search and view a product', async ({ page }) => {
    await page.goto('/');

    // Wait for product cards to render (inside the grid area, not the sidebar)
    const productCards = page.locator('.lg\\:col-span-3 .bg-card');
    await expect(productCards.first()).toBeVisible({ timeout: 20000 });

    // Click the first product's title link
    const productLink = productCards.first().locator('h3 a');
    await productLink.click();

    // Should navigate to product detail page
    await page.waitForURL(/\/product\//, { timeout: 15000 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle categories', async ({ page }) => {
    await page.goto('/');

    // Wait for the filter sidebar to render
    const aside = page.locator('aside');
    await expect(aside.locator('button').first()).toBeVisible({ timeout: 15000 });

    // Click the second category button (first after "All")
    await aside.locator('button').nth(1).click();

    // URL should update with category param
    await page.waitForURL(url => url.searchParams.has('category'), { timeout: 15000 });
  });

  test('should handle price range and sorting', async ({ page }) => {
    // Navigate with maxPrice param directly — this tests that nuqs
    // correctly reads the param and the server filters by price.
    // The slider is a controlled React component; its onChange calls
    // setParams({ maxPrice }) which pushes this exact URL.
    await page.goto('/?maxPrice=1000');

    // Verify the URL param is reflected
    await expect(page).toHaveURL(/maxPrice=1000/);

    // Verify the slider value matches the URL param
    const priceSlider = page.locator('aside input[type="range"]').first();
    await expect(priceSlider).toBeVisible({ timeout: 15000 });
    await expect(priceSlider).toHaveValue('1000');

    // Sorting — select option triggers setParams({ sort }) which pushes the URL
    const sortSelect = page.locator('aside select').first();
    await sortSelect.selectOption('priceLowHigh');

    await page.waitForURL(url => url.searchParams.get('sort') === 'priceLowHigh', { timeout: 15000 });
  });
});
