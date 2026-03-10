import { Page, Locator } from '@playwright/test';

export class BookingAppPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly logo: Locator;
  readonly subtitle: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.booking-bar');
    this.logo = page.locator('.booking-bar__logo');
    this.subtitle = page.locator('.booking-bar__subtitle');
    this.mainContent = page.locator('.booking-shell__content');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async getLogoText(): Promise<string> {
    return (await this.logo.textContent()) ?? '';
  }
}
