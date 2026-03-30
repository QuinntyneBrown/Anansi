import { Page, Locator } from '@playwright/test';

export class PasswordPage {
  readonly page: Page;
  readonly mobileBar: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly card: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileBar = page.locator('.mobile-bar');
    this.title = page.locator('.password-entry__title');
    this.subtitle = page.locator('.password-entry__subtitle');
    this.passwordInput = page.locator('lib-input-group');
    this.submitButton = page.locator('lib-button');
    this.errorMessage = page.locator('.password-entry__error');
    this.card = page.locator('lib-card');
  }

  async goto(collectionId: string = 'test-collection'): Promise<void> {
    await this.page.goto(`/gallery/${collectionId}/password`);
  }
}
