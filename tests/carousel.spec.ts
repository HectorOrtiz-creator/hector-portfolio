import { test, expect } from '@playwright/test';

test.describe('Carousel Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC007: Carousel auto-advance', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForSelector('.carousel-slide.active');
    
    // Get initial active slide
    const initialSlide = await page.locator('.carousel-slide.active').textContent();
    
    // Wait for auto-advance (5 seconds + buffer)
    await page.waitForTimeout(6000);
    
    // Check if slide has changed
    const newSlide = await page.locator('.carousel-slide.active').textContent();
    expect(newSlide).not.toBe(initialSlide);
  });

  test('TC008: Manual navigation arrows', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForSelector('.carousel-slide.active');
    
    // Get initial active slide
    const initialSlide = await page.locator('.carousel-slide.active').textContent();
    
    // Click next arrow
    const nextArrow = page.locator('.carousel-next');
    await expect(nextArrow).toBeVisible();
    await nextArrow.click();
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // Check if slide changed
    const newSlide = await page.locator('.carousel-slide.active').textContent();
    expect(newSlide).not.toBe(initialSlide);
    
    // Click previous arrow
    const prevArrow = page.locator('.carousel-prev');
    await expect(prevArrow).toBeVisible();
    await prevArrow.click();
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // Check if returned to original slide
    const finalSlide = await page.locator('.carousel-slide.active').textContent();
    expect(finalSlide).toBe(initialSlide);
  });

  test('TC009: Dot navigation indicators', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForSelector('.carousel-dot.active');
    
    // Check if dots are visible
    const dots = page.locator('.carousel-dot');
    await expect(dots).toHaveCount(3);
    
    // Check if first dot is active initially
    const firstDot = dots.first();
    await expect(firstDot).toHaveClass(/active/);
    
    // Click second dot
    const secondDot = dots.nth(1);
    await secondDot.click();
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // Check if second dot is now active
    await expect(secondDot).toHaveClass(/active/);
    await expect(firstDot).not.toHaveClass(/active/);
  });

  test('TC010: Keyboard navigation', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForSelector('.carousel-slide.active');
    
    // Get initial active slide
    const initialSlide = await page.locator('.carousel-slide.active').textContent();
    
    // Press right arrow key
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    
    // Check if slide changed
    const newSlide = await page.locator('.carousel-slide.active').textContent();
    expect(newSlide).not.toBe(initialSlide);
    
    // Press left arrow key
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1000);
    
    // Check if returned to original slide
    const finalSlide = await page.locator('.carousel-slide.active').textContent();
    expect(finalSlide).toBe(initialSlide);
  });

  test('TC011: Slide content visibility', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForSelector('.carousel-slide.active');
    
    // Check if slide content is visible
    const slideContent = page.locator('.slide-content');
    await expect(slideContent).toBeVisible();
    
    // Check if slide title is visible
    const slideTitle = page.locator('.slide-title');
    await expect(slideTitle).toBeVisible();
    
    // Check if slide subtitle is visible
    const slideSubtitle = page.locator('.slide-subtitle');
    await expect(slideSubtitle).toBeVisible();
    
    // Check if slide description is visible
    const slideDescription = page.locator('.slide-description');
    await expect(slideDescription).toBeVisible();
    
    // Verify content is readable (not empty)
    const titleText = await slideTitle.textContent();
    const subtitleText = await slideSubtitle.textContent();
    const descriptionText = await slideDescription.textContent();
    
    expect(titleText?.trim()).toBeTruthy();
    expect(subtitleText?.trim()).toBeTruthy();
    expect(descriptionText?.trim()).toBeTruthy();
  });

  test('TC012: Carousel responsive behavior', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForSelector('.carousel-slide.active');
    await expect(page.locator('.carousel')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('.carousel')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('.carousel')).toBeVisible();
    
    // Check if navigation arrows are still accessible on mobile
    const nextArrow = page.locator('.carousel-next');
    const prevArrow = page.locator('.carousel-prev');
    await expect(nextArrow).toBeVisible();
    await expect(prevArrow).toBeVisible();
  });
});
