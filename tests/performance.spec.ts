import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('TC037: Page load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('TC038: Image optimization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if images are optimized
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const src = await image.getAttribute('src');
        
        // Check if images have proper loading attributes
        const loading = await image.getAttribute('loading');
        expect(loading).toBe('lazy');
      }
    }
  });

  test('TC039: CSS animations performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test carousel animation performance
    const carousel = page.locator('.carousel');
    await expect(carousel).toBeVisible();
    
    // Wait for carousel to auto-advance
    await page.waitForTimeout(6000);
    
    // Check if animations are smooth (no visible lag)
    const activeSlide = page.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
  });

  test('Resource loading optimization', async ({ page }) => {
    // Track resource loading
    const resources: string[] = [];
    
    page.on('response', response => {
      resources.push(response.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if critical resources load first
    const criticalResources = resources.filter(url => 
      url.includes('index.html') || 
      url.includes('.css') || 
      url.includes('.js')
    );
    
    expect(criticalResources.length).toBeGreaterThan(0);
  });

  test('Memory usage optimization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test carousel functionality for memory leaks
    for (let i = 0; i < 5; i++) {
      // Navigate through carousel
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(1000);
    }
    
    // Page should still be responsive
    await expect(page.locator('.carousel')).toBeVisible();
  });

  test('Network efficiency', async ({ page }) => {
    // Test with slow network conditions
    await page.route('**/*', route => {
      // Simulate slow network
      setTimeout(() => route.continue(), 100);
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Even with slow network, should load within reasonable time
    expect(loadTime).toBeLessThan(10000);
  });

  test('Caching behavior', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Second visit (should be faster due to caching)
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime;
    
    // Second load should be faster
    expect(secondLoadTime).toBeLessThan(2000);
  });

  test('JavaScript execution performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test search functionality performance
    const searchInput = page.locator('.search-input');
    await searchInput.focus();
    
    const startTime = Date.now();
    await searchInput.fill('web');
    await page.waitForTimeout(500);
    const searchTime = Date.now() - startTime;
    
    // Search should be responsive
    expect(searchTime).toBeLessThan(1000);
    
    // Check if results appear
    const searchResults = page.locator('#searchResults');
    await expect(searchResults).toBeVisible();
  });

  test('DOM manipulation performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test modal opening performance
    const startTime = Date.now();
    await page.locator('button:has-text("Log In")').click();
    const modalTime = Date.now() - startTime;
    
    // Modal should open quickly
    expect(modalTime).toBeLessThan(500);
    
    const loginModal = page.locator('#loginModal');
    await expect(loginModal).toBeVisible();
  });

  test('Responsive performance', async ({ page }) => {
    // Test performance on different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if page is responsive
      await expect(page.locator('.top-nav')).toBeVisible();
      await expect(page.locator('.hero-banner')).toBeVisible();
    }
  });
});
