import { test, expect } from '@playwright/test';

test.describe('Search Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC013: Search input focus behavior', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    
    // Check initial state
    await expect(searchInput).toBeVisible();
    
    // Focus the input
    await searchInput.focus();
    await page.waitForTimeout(500);
    
    // Check if input expands (width should be larger than initial)
    const boundingBox = await searchInput.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(300);
  });

  test('TC014: Real-time search results', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    const searchResults = page.locator('#searchResults');
    
    // Focus search input
    await searchInput.focus();
    
    // Type search query
    await searchInput.fill('web');
    await page.waitForTimeout(500);
    
    // Check if results appear
    await expect(searchResults).toBeVisible();
    
    // Check if results contain expected content
    const resultItems = searchResults.locator('.search-result-item');
    await expect(resultItems).toHaveCount(1);
    
    // Verify result content
    const resultTitle = resultItems.first().locator('.search-result-title');
    await expect(resultTitle).toContainText('Web Development');
  });

  test('TC015: Search result clickability', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    const searchResults = page.locator('#searchResults');
    
    // Setup dialog handler for alert
    page.on('dialog', dialog => dialog.accept());
    
    // Focus search input and search
    await searchInput.focus();
    await searchInput.fill('web');
    await page.waitForTimeout(500);
    
    // Click on first result
    const firstResult = searchResults.locator('.search-result-item').first();
    await firstResult.click();
    
    // Check if search results are hidden after click
    await expect(searchResults).not.toBeVisible();
    
    // Check if search input is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('TC016: Search results outside click', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    const searchResults = page.locator('#searchResults');
    
    // Focus search input and search
    await searchInput.focus();
    await searchInput.fill('web');
    await page.waitForTimeout(500);
    
    // Verify results are visible
    await expect(searchResults).toBeVisible();
    
    // Click outside search container
    await page.click('body');
    
    // Check if results are hidden
    await expect(searchResults).not.toBeVisible();
  });

  test('TC017: Empty search handling', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    const searchResults = page.locator('#searchResults');
    
    // Focus search input
    await searchInput.focus();
    
    // Type short query (less than 2 characters)
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    
    // Check that no results are shown
    await expect(searchResults).not.toBeVisible();
    
    // Type empty query
    await searchInput.fill('');
    await page.waitForTimeout(500);
    
    // Check that no results are shown
    await expect(searchResults).not.toBeVisible();
  });

  test('TC018: Search result styling', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    const searchResults = page.locator('#searchResults');
    
    // Focus search input and search
    await searchInput.focus();
    await searchInput.fill('web');
    await page.waitForTimeout(500);
    
    // Check if results container has proper styling
    await expect(searchResults).toBeVisible();
    
    // Check if result items have proper structure
    const resultItems = searchResults.locator('.search-result-item');
    await expect(resultItems).toHaveCount(1);
    
    // Check if result has title and description
    const firstResult = resultItems.first();
    await expect(firstResult.locator('.search-result-title')).toBeVisible();
    await expect(firstResult.locator('.search-result-desc')).toBeVisible();
    
    // Test hover effect
    await firstResult.hover();
    await page.waitForTimeout(200);
    
    // Verify hover state (background color change)
    const hoverStyle = await firstResult.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(hoverStyle).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('Search with different queries', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    const searchResults = page.locator('#searchResults');
    
    // Test different search queries
    const testQueries = ['mobile', 'cloud', 'data', 'design'];
    
    for (const query of testQueries) {
      // Focus and search
      await searchInput.focus();
      await searchInput.fill(query);
      await page.waitForTimeout(500);
      
      // Check if results appear
      await expect(searchResults).toBeVisible();
      
      // Verify results contain the search term
      const resultItems = searchResults.locator('.search-result-item');
      if (await resultItems.count() > 0) {
        const resultText = await resultItems.first().textContent();
        expect(resultText?.toLowerCase()).toContain(query.toLowerCase());
      }
      
      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(200);
    }
  });
});
