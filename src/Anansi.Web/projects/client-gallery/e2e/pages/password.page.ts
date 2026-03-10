import { Page, Locator } from '@playwright/test';

export class PasswordPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly card: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.gallery-bar');
    this.title = page.locator('.password-entry__title');
    this.subtitle = page.locator('.password-entry__subtitle');
    this.passwordInput = page.locator('lib-input-group');
    this.submitButton = page.locator('lib-button');
    this.errorMessage = page.locator('.password-entry__error');
    this.card = page.locator('lib-card');
  }

  async goto(collectionId: string = 'demo'): Promise<void> {
    await this.page.goto(`/gallery/${collectionId}/password`);
  }
}
