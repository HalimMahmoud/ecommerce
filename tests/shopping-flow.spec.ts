import { test, expect } from '@playwright/test';

test.describe('Shopping Funnel E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should allow a user to search, filter, and view a product', async ({ page }) => {
    // 1. Wait for the page to be ready - be specific to the header
    const header = page.locator('header');
    await expect(header.getByText('Halim Store')).toBeVisible();
    await expect(header.getByText('Shop')).toBeVisible();
    
    // Wait for content grid
    await page.waitForSelector('.grid', { state: 'visible', timeout: 15000 });

    // 2. Search Interaction
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('watch');
    
    // Wait for nuqs to sync URL (handle debounce)
    await page.waitForURL(/search=watch/, { timeout: 10000 });

    // 3. Filter Interaction - Categories
    const aside = page.locator('aside');
    const categoryButtons = aside.locator('button');
    // Click a category that isn't the first one ("All")
    const categoryToClick = categoryButtons.nth(1);
    const catName = await categoryToClick.innerText();
    await categoryToClick.click();
    
    await page.waitForURL(new RegExp(`category=${catName.toLowerCase()}`, 'i'), { timeout: 10000 });

    // 4. Navigate to Product Detail
    const firstProduct = page.locator('div.bg-card').first();
    await firstProduct.scrollIntoViewIfNeeded();
    await firstProduct.hover();
    
    // Use a more generic role-based link search
    const viewButton = firstProduct.getByRole('link', { name: /View Details/i });
    await viewButton.click();
    
    await expect(page).toHaveURL(/\/product\//);
  });

  test('should handle price range and sorting', async ({ page }) => {
    // 1. Price Range
    const priceSlider = page.locator('input[type="range"]').first();
    await priceSlider.fill('1000');
    await page.waitForURL(/maxPrice=1000/, { timeout: 10000 });

    // 2. Sorting
    const sortSelect = page.locator('select').first();
    await sortSelect.selectOption({ index: 1 });
    await page.waitForURL(/sort=/, { timeout: 10000 });
  });
});
