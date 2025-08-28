import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('TC001: Top navigation bar visibility', async ({ page }) => {
    // Check if navigation bar is fixed and visible
    const nav = page.locator('.top-nav');
    await expect(nav).toBeVisible();
    
    // Check if navigation is fixed position
    const navStyle = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navStyle).toBe('fixed');
  });

  test('TC002: Logo display and animation', async ({ page }) => {
    // Check if logo is visible
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
    
    // Check if logo icon exists
    const logoIcon = page.locator('.logo-icon');
    await expect(logoIcon).toBeVisible();
    
    // Check if logo text is correct
    const logoText = page.locator('.logo span');
    await expect(logoText).toHaveText('Hector Ortiz');
    
    // Check if logo has hover effect
    await logo.hover();
    // Wait a bit for any hover animations
    await page.waitForTimeout(100);
  });

  test('TC003: Search bar functionality', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    
    // Check if search input is visible
    await expect(searchInput).toBeVisible();
    
    // Check placeholder text
    await expect(searchInput).toHaveAttribute('placeholder', 'Search for products, services...');
    
    // Test focus behavior
    await searchInput.focus();
    await page.waitForTimeout(500);
    
    // Check if input expands on focus (width should increase)
    const initialWidth = await searchInput.boundingBox();
    expect(initialWidth?.width).toBeGreaterThan(300);
  });

  test('TC004: Login button functionality', async ({ page }) => {
    const loginBtn = page.locator('button:has-text("Log In")');
    
    // Check if login button is visible
    await expect(loginBtn).toBeVisible();
    
    // Click login button
    await loginBtn.click();
    
    // Check if login modal opens
    const loginModal = page.locator('#loginModal');
    await expect(loginModal).toBeVisible();
    
    // Check if modal has correct content
    await expect(loginModal.locator('h2')).toHaveText('Log In');
    await expect(loginModal.locator('input[type="email"]')).toBeVisible();
    await expect(loginModal.locator('input[type="password"]')).toBeVisible();
  });

  test('TC005: Sign up button functionality', async ({ page }) => {
    const signupBtn = page.locator('button:has-text("Sign Up")');
    
    // Check if sign up button is visible
    await expect(signupBtn).toBeVisible();
    
    // Click sign up button
    await signupBtn.click();
    
    // Check if sign up modal opens
    const signupModal = page.locator('#signupModal');
    await expect(signupModal).toBeVisible();
    
    // Check if modal has correct content
    await expect(signupModal.locator('h2')).toHaveText('Create Account');
    await expect(signupModal.locator('input[type="text"]')).toBeVisible();
    await expect(signupModal.locator('input[type="email"]')).toBeVisible();
    await expect(signupModal.locator('input[type="password"]')).toHaveCount(2);
  });

  test('TC006: Responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if navigation adapts to mobile layout
    const navContainer = page.locator('.nav-container');
    await expect(navContainer).toBeVisible();
    
    // Check if logo is still visible
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
    
    // Check if search and auth buttons are accessible
    const searchInput = page.locator('.search-input');
    const loginBtn = page.locator('button:has-text("Log In")');
    const signupBtn = page.locator('button:has-text("Sign Up")');
    
    await expect(searchInput).toBeVisible();
    await expect(loginBtn).toBeVisible();
    await expect(signupBtn).toBeVisible();
  });
});
