import { test, expect } from '@playwright/test';

test.describe('Settings Dashboard Page Verification', () => {
  test('should render locked email field and password verification modal flow', async ({ page }) => {
    console.log('Testing Dashboard...');

    // Navigate to the Dashboard. Assuming it automatically handles if not logged in.
    // If we get redirected to signup/login, we will just login first.
    await page.goto('http://localhost:3000/dashboard');
    
    // We might need to wait for login or handle it.
    // Let's check where we end up.
    if (page.url().includes('login') || page.url().includes('signup')) {
      console.log('Redirected to auth. Creating account / Logging in...');
      await page.goto('http://localhost:3000/signup'); // go to signup to be safe
      
      const emailField = page.getByPlaceholder('email@example.com');
      const hasEmailField = await emailField.isVisible().catch(() => false);
      if(hasEmailField) {
        // mock filling out info. Assuming standard NextAuth credentials fields
        await page.getByPlaceholder('email@example.com').fill('testverified@example.com');
        await page.getByPlaceholder('••••••••').fill('password123');
        await page.getByPlaceholder('John Doe').fill('Test User Verification');
        
        // Let's submit
        const buttons = page.locator('button');
        const signupBtn = await buttons.filter({ hasText: 'Sign up' }).first();
        if(await signupBtn.isVisible()) {
          await signupBtn.click();
        } else {
             // maybe it's just login form
             const signInBtn = await buttons.filter({ hasText: 'Sign in' }).first();
             if(await signInBtn.isVisible()) await signInBtn.click();
        }
      }

      // try logging in if not
      await page.goto('http://localhost:3000/login');
      const loginEmailField = page.getByPlaceholder('email@example.com');
      const hasLoginEmailField = await loginEmailField.isVisible().catch(() => false);
      if (hasLoginEmailField) {
         await page.getByPlaceholder('email@example.com').fill('testverified@example.com');
         await page.getByPlaceholder('••••••••').fill('password123');
         const signin = await page.locator('button').filter({ hasText: 'Sign in' }).first();
         if(await signin.isVisible()) await signin.click();
      }

      await page.waitForTimeout(2000);
      await page.goto('http://localhost:3000/dashboard');
    }

    console.log('On Dashboard page: ' + page.url());

    // Wait for the UI sidebar to appear.
    const settingsBtn = page.locator('button').filter({ hasText: 'Settings' });
    
    console.log('Clicking Settings tab...');
    await settingsBtn.click();

    // Verify settings view is mounted by looking for the "Account Settings" header
    await expect(page.getByRole('heading', { name: "Account Settings" })).toBeVisible();

    // 1. Verify locked email field
    console.log('Verifying locked email field...');
    // In our component: type="email" and disabled
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeDisabled();
    
    // We attached an icon to the disabled input.
    // Ensure "Change Email" button is visible
    const changeEmailBtn = page.getByRole('button', { name: 'Change Email' });
    await expect(changeEmailBtn).toBeVisible();

    // 2. Click "Change Email" and verify modal opens directly
    console.log('Testing Change Email click...');
    await changeEmailBtn.click();

    // Verify modal text: "Security Verification"
    await expect(page.getByRole('heading', { name: "Security Verification" })).toBeVisible();
    await expect(page.getByText('Please verify your password to continue.')).toBeVisible();

    // 3. Current Password Field
    console.log('Verifying password input and workflow...');
    const pwdInput = page.getByPlaceholder('••••••••');
    await expect(pwdInput).toBeVisible();
    await pwdInput.fill('password123');

    // Click "Verify" button
    const verifyBtn = page.getByRole('button', { name: 'Verify' }).first();
    await verifyBtn.click();

    // 4. Verify that modal state shifts to ask for New Email
    await expect(page.getByRole('heading', { name: "Change Email Address" })).toBeVisible();
    await expect(page.getByText('Enter your new email address below.')).toBeVisible();

    const newEmailInput = page.getByPlaceholder('new@example.com');
    await expect(newEmailInput).toBeVisible();
    await newEmailInput.fill('newemail@example.com');

    // Click "Update Email"
    const updateEmailBtn = page.getByRole('button', { name: 'Update Email' });
    await updateEmailBtn.click();

    console.log('SUCCESS: All UI validations for Settings passed in Playwright!');
  });
});
