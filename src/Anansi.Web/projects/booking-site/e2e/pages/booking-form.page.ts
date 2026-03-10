import { Page, Locator } from '@playwright/test';

export class BookingFormPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly formContainer: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.booking-bar');
    this.pageTitle = page.locator('.page-title');
    this.formContainer = page.locator('.booking-form, .form-container');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(sessionTypeId: string = 'test-session'): Promise<void> {
    await this.page.goto(`/book/${sessionTypeId}`);
  }
}
