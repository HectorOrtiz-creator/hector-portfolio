import { test, expect } from '@playwright/test';

test.describe('Authentication Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC019: Login modal opening', async ({ page }) => {
    const loginBtn = page.locator('button:has-text("Log In")');
    
    // Click login button
    await loginBtn.click();
    
    // Check if modal opens
    const loginModal = page.locator('#loginModal');
    await expect(loginModal).toBeVisible();
    
    // Check modal content
    await expect(loginModal.locator('h2')).toHaveText('Log In');
    await expect(loginModal.locator('input[type="email"]')).toBeVisible();
    await expect(loginModal.locator('input[type="password"]')).toBeVisible();
    await expect(loginModal.locator('button[type="submit"]')).toHaveText('Log In');
  });

  test('TC020: Sign up modal opening', async ({ page }) => {
    const signupBtn = page.locator('button:has-text("Sign Up")');
    
    // Click sign up button
    await signupBtn.click();
    
    // Check if modal opens
    const signupModal = page.locator('#signupModal');
    await expect(signupModal).toBeVisible();
    
    // Check modal content
    await expect(signupModal.locator('h2')).toHaveText('Create Account');
    await expect(signupModal.locator('input[type="text"]')).toBeVisible();
    await expect(signupModal.locator('input[type="email"]')).toBeVisible();
    await expect(signupModal.locator('input[type="password"]')).toHaveCount(2);
    await expect(signupModal.locator('button[type="submit"]')).toHaveText('Create Account');
  });

  test('TC021: Form validation', async ({ page }) => {
    // Open login modal
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Try to submit empty form
    await loginModal.locator('button[type="submit"]').click();
    
    // Check if form validation prevents submission
    // (HTML5 validation should prevent submission with required fields empty)
    await expect(loginModal).toBeVisible();
    
    // Fill email only
    await loginModal.locator('input[type="email"]').fill('test@example.com');
    await loginModal.locator('button[type="submit"]').click();
    
    // Modal should still be visible (password required)
    await expect(loginModal).toBeVisible();
  });

  test('TC022: Password confirmation match', async ({ page }) => {
    // Open sign up modal
    await page.locator('button:has-text("Sign Up")').click();
    const signupModal = page.locator('#signupModal');
    
    // Fill form with mismatched passwords
    await signupModal.locator('input[type="text"]').fill('Test User');
    await signupModal.locator('input[type="email"]').fill('test@example.com');
    await signupModal.locator('input[type="password"]').first().fill('password123');
    await signupModal.locator('input[type="password"]').last().fill('differentpassword');
    
    // Setup dialog handler for alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Passwords do not match');
      dialog.accept();
    });
    
    // Submit form
    await signupModal.locator('button[type="submit"]').click();
    
    // Modal should still be visible after validation error
    await expect(signupModal).toBeVisible();
  });

  test('TC023: Modal close functionality', async ({ page }) => {
    // Open login modal
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Check if close button is visible
    const closeBtn = loginModal.locator('.close');
    await expect(closeBtn).toBeVisible();
    
    // Click close button
    await closeBtn.click();
    
    // Check if modal is closed
    await expect(loginModal).not.toBeVisible();
  });

  test('TC024: Outside click modal close', async ({ page }) => {
    // Open login modal
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Click outside modal (on backdrop)
    await page.click('.modal');
    
    // Check if modal is closed
    await expect(loginModal).not.toBeVisible();
  });

  test('TC025: Form submission handling', async ({ page }) => {
    // Test login form submission
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Fill login form
    await loginModal.locator('input[type="email"]').fill('test@example.com');
    await loginModal.locator('input[type="password"]').fill('password123');
    
    // Setup dialog handler for success alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Login functionality would be implemented here');
      dialog.accept();
    });
    
    // Submit form
    await loginModal.locator('button[type="submit"]').click();
    
    // Check if modal closes after successful submission
    await expect(loginModal).not.toBeVisible();
    
    // Test signup form submission
    await page.locator('button:has-text("Sign Up")').click();
    const signupModal = page.locator('#signupModal');
    
    // Fill signup form
    await signupModal.locator('input[type="text"]').fill('Test User');
    await signupModal.locator('input[type="email"]').fill('test@example.com');
    await signupModal.locator('input[type="password"]').first().fill('password123');
    await signupModal.locator('input[type="password"]').last().fill('password123');
    
    // Setup dialog handler for success alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Account created successfully');
      dialog.accept();
    });
    
    // Submit form
    await signupModal.locator('button[type="submit"]').click();
    
    // Check if modal closes after successful submission
    await expect(signupModal).not.toBeVisible();
  });

  test('Modal accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Check if modal is focusable
    await loginModal.focus();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test escape key to close modal
    await page.keyboard.press('Escape');
    await expect(loginModal).not.toBeVisible();
  });

  test('Form field labels and accessibility', async ({ page }) => {
    // Open login modal
    await page.locator('button:has-text("Log In")').click();
    const loginModal = page.locator('#loginModal');
    
    // Check if form fields have proper labels
    const emailLabel = loginModal.locator('label[for="loginEmail"]');
    const passwordLabel = loginModal.locator('label[for="loginPassword"]');
    
    await expect(emailLabel).toHaveText('Email');
    await expect(passwordLabel).toHaveText('Password');
    
    // Check if form fields have proper IDs
    await expect(loginModal.locator('#loginEmail')).toBeVisible();
    await expect(loginModal.locator('#loginPassword')).toBeVisible();
  });
});
