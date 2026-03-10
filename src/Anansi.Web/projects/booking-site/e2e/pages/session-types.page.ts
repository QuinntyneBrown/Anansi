import { Page, Locator } from '@playwright/test';

export class SessionTypesPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly sessionCards: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.booking-bar');
    this.pageTitle = page.locator('.page-title');
    this.sessionCards = page.locator('.session-card');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/book');
  }

  async getSessionCardCount(): Promise<number> {
    return this.sessionCards.count();
  }
}
