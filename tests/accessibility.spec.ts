import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC040: Keyboard navigation', async ({ page }) => {
    // Test tab navigation through all interactive elements
    await page.keyboard.press('Tab');
    
    // Check if focus is on logo
    await expect(page.locator('.logo:focus')).toBeVisible();
    
    // Continue tabbing through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus indicators are visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('TC041: Screen reader compatibility', async ({ page }) => {
    // Check if all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }
    
    // Check if form inputs have proper labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('Color contrast compliance', async ({ page }) => {
    // Check main text elements for sufficient contrast
    const mainTextElements = [
      '.header h1',
      '.header .subtitle',
      '.slide-title',
      '.slide-subtitle',
      '.slide-description',
      '.bio-text',
      '.contact-item'
    ];
    
    for (const selector of mainTextElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        // Note: Actual color contrast testing would require additional tools
        // This is a basic visibility check
      }
    }
  });

  test('Focus management', async ({ page }) => {
    // Test modal focus management
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Check if focus is trapped in modal
    await expect(loginModal).toBeVisible();
    
    // Tab through modal elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(loginModal).not.toBeVisible();
  });

  test('ARIA attributes', async ({ page }) => {
    // Check if interactive elements have proper ARIA attributes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const role = await button.getAttribute('role');
      
      // Buttons should have either aria-label or accessible text
      const text = await button.textContent();
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('Semantic HTML structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    let previousLevel = 0;
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      
      // Check for proper heading hierarchy (no skipping levels)
      expect(level - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = level;
    }
    
    // Check for proper landmark elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('Form accessibility', async ({ page }) => {
    // Open login modal to test form accessibility
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Check if form has proper structure
    const form = loginModal.locator('form');
    await expect(form).toBeVisible();
    
    // Check if form fields have proper labels and IDs
    const emailInput = loginModal.locator('#loginEmail');
    const passwordInput = loginModal.locator('#loginPassword');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Check if labels are properly associated
    const emailLabel = page.locator('label[for="loginEmail"]');
    const passwordLabel = page.locator('label[for="loginPassword"]');
    
    await expect(emailLabel).toHaveText('Email');
    await expect(passwordLabel).toHaveText('Password');
  });

  test('Dynamic content announcements', async ({ page }) => {
    // Test search functionality for screen reader announcements
    const searchInput = page.locator('.search-input');
    await searchInput.focus();
    await searchInput.fill('web');
    await page.waitForTimeout(500);
    
    // Check if search results are announced
    const searchResults = page.locator('#searchResults');
    await expect(searchResults).toBeVisible();
    
    // Verify results are accessible
    const resultItems = searchResults.locator('.search-result-item');
    await expect(resultItems).toHaveCount(1);
  });

  test('Skip links and navigation', async ({ page }) => {
    // Test if main content is accessible via keyboard
    await page.keyboard.press('Tab');
    
    // Navigate to main content
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to reach main content
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });
});
