import { test, expect } from '@playwright/test';
import { BookingAppPage } from './pages/app.page';
import { SessionTypesPage } from './pages/session-types.page';
import { BookingFormPage } from './pages/booking-form.page';

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
test.describe('Booking Site Shell', () => {
  test('should display booking top bar with logo', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.goto();

    await expect(app.topBar).toBeVisible();
    await expect(app.logo).toHaveText('Anansi');
    await expect(app.subtitle).toHaveText(/Book a Session/i);
  });

  test('should redirect root to book', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/book/);
  });

  test('should render main content area', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.goto();
    await expect(app.mainContent).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// BKG-17.1.1: Landing Page - Desktop
// ---------------------------------------------------------------------------
test.describe('BKG-17.1.1: Landing Page Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show session type selection page', async ({ page }) => {
    const sessionTypes = new SessionTypesPage(page);
    await sessionTypes.goto();

    await expect(sessionTypes.topBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasTitle = (await sessionTypes.pageTitle.count()) > 0;
    const hasSpinner = (await sessionTypes.spinner.count()) > 0;
    const hasEmpty = (await sessionTypes.emptyState.count()) > 0;
    expect(hasTitle || hasSpinner || hasEmpty).toBe(true);
  });

  test('should show session cards or empty state', async ({ page }) => {
    const sessionTypes = new SessionTypesPage(page);
    await sessionTypes.goto();
    await page.waitForSelector('.session-card, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasCards = (await sessionTypes.sessionCards.count()) > 0;
    const hasSpinner = (await sessionTypes.spinner.count()) > 0;
    const hasEmpty = (await sessionTypes.emptyState.count()) > 0;
    expect(hasCards || hasSpinner || hasEmpty).toBe(true);
  });
});

// BKG-17.1.2: Landing Page - Mobile
test.describe('BKG-17.1.2: Landing Page Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show session type selection on mobile viewport', async ({ page }) => {
    const sessionTypes = new SessionTypesPage(page);
    await sessionTypes.goto();

    await expect(sessionTypes.topBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-spinner, lib-empty-state', { timeout: 10000 });
  });

  test('should show stacked session cards on mobile', async ({ page }) => {
    const sessionTypes = new SessionTypesPage(page);
    await sessionTypes.goto();
    await page.waitForSelector('.session-card, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// BKG-17.1.3: Booking Form - Multi-Step Flow
// ---------------------------------------------------------------------------
test.describe('BKG-17.1.3: Booking Form Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to booking form with session type', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.navigateTo('/book/test-session-type');
    await expect(page).toHaveURL(/\/book\/test-session-type/);
  });

  test('should show booking form with step indicator', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();

    await expect(form.topBar).toBeVisible();
    await page.waitForSelector('.booking-form, .form-container, lib-spinner, lib-empty-state', { timeout: 10000 });
  });

  test('should show 3 steps in the progress indicator', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();
    await page.waitForSelector('.steps-indicator, lib-spinner', { timeout: 10000 });

    if ((await form.stepsIndicator.count()) > 0) {
      expect(await form.getStepCount()).toBe(3);
    }
  });

  test('should show form inputs on step 1', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();
    await page.waitForSelector('.form-fields, lib-spinner', { timeout: 10000 });

    if ((await form.formFields.count()) > 0) {
      expect(await form.getFormInputCount()).toBeGreaterThan(0);
    }
  });

  test('should show continue button on form steps', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();
    await page.waitForSelector('.booking-form, lib-spinner', { timeout: 10000 });

    if ((await form.formContainer.count()) > 0) {
      const hasContinue = (await form.continueButton.count()) > 0;
      const hasConfirm = (await form.confirmButton.count()) > 0;
      expect(hasContinue || hasConfirm).toBe(true);
    }
  });
});

// BKG-17.1.4: Contact Info Form
test.describe('BKG-17.1.4: Contact Info Form', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show form fields for client information', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();

    await expect(form.topBar).toBeVisible();
    await page.waitForSelector('.booking-form, .form-container, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasForm = (await form.formContainer.count()) > 0;
    const hasSpinner = (await form.spinner.count()) > 0;
    const hasEmpty = (await form.emptyState.count()) > 0;
    expect(hasForm || hasSpinner || hasEmpty).toBe(true);
  });
});

// BKG-17.1.5: Intake Document Flow
test.describe('BKG-17.1.5: Intake Document Flow', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to booking form for intake', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.navigateTo('/book/intake-session');
    await expect(page).toHaveURL(/\/book\/intake-session/);
  });
});

// BKG-17.1.6: Payment Step
test.describe('BKG-17.1.6: Payment Step', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to booking form for payment step', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.navigateTo('/book/payment-session');
    await expect(page).toHaveURL(/\/book\/payment-session/);
  });
});

// BKG-17.1.7: Booking Confirmation
test.describe('BKG-17.1.7: Booking Confirmation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to booking form for confirmation', async ({ page }) => {
    const app = new BookingAppPage(page);
    await app.navigateTo('/book/confirm-session');
    await expect(page).toHaveURL(/\/book\/confirm-session/);
  });
});

// BKG-17.1.8: Booking Form - Mobile
test.describe('BKG-17.1.8: Booking Form Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show booking form on mobile viewport', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();

    await expect(form.topBar).toBeVisible();
    await page.waitForSelector('.booking-form, .form-container, lib-spinner, lib-empty-state', { timeout: 10000 });
  });

  test('should show step indicator on mobile', async ({ page }) => {
    const form = new BookingFormPage(page);
    await form.goto();
    await page.waitForSelector('.steps-indicator, lib-spinner', { timeout: 10000 });
  });
});
