import { Page, Locator } from '@playwright/test';

export class BookingFormPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly formContainer: Locator;
  readonly formTitle: Locator;
  readonly stepsIndicator: Locator;
  readonly steps: Locator;
  readonly activeStep: Locator;
  readonly completedSteps: Locator;
  readonly stepTitle: Locator;
  readonly formFields: Locator;
  readonly formInputs: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly confirmButton: Locator;
  readonly reviewSection: Locator;
  readonly reviewRows: Locator;
  readonly errorBanner: Locator;
  readonly confirmation: Locator;
  readonly confirmationTitle: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.booking-bar');
    this.pageTitle = page.locator('.page-title');
    this.formContainer = page.locator('.booking-form, .form-container');
    this.formTitle = page.locator('.form-title');
    this.stepsIndicator = page.locator('.steps-indicator');
    this.steps = page.locator('.step');
    this.activeStep = page.locator('.step--active');
    this.completedSteps = page.locator('.step--completed');
    this.stepTitle = page.locator('.step-title');
    this.formFields = page.locator('.form-fields');
    this.formInputs = page.locator('lib-input-group');
    this.continueButton = page.locator('lib-button', { hasText: 'Continue' });
    this.backButton = page.locator('lib-button', { hasText: 'Back' });
    this.confirmButton = page.locator('lib-button', { hasText: 'Confirm Booking' });
    this.reviewSection = page.locator('.review-section');
    this.reviewRows = page.locator('.review-row');
    this.errorBanner = page.locator('.error-banner');
    this.confirmation = page.locator('.confirmation');
    this.confirmationTitle = page.locator('.confirmation-title');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(sessionTypeId: string = 'test-session'): Promise<void> {
    await this.page.goto(`/book/${sessionTypeId}`);
  }

  async getStepCount(): Promise<number> {
    return this.steps.count();
  }

  async getFormInputCount(): Promise<number> {
    return this.formInputs.count();
  }
}
