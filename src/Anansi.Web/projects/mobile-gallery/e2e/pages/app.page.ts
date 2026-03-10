import { Page, Locator } from '@playwright/test';

export class MobileGalleryAppPage {
  readonly page: Page;
  readonly mobileBar: Locator;
  readonly logo: Locator;
  readonly subtitle: Locator;
  readonly backButton: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileBar = page.locator('.mobile-bar');
    this.logo = page.locator('.mobile-bar__logo');
    this.subtitle = page.locator('.mobile-bar__subtitle');
    this.backButton = page.locator('.mobile-bar__back');
    this.mainContent = page.locator('.gallery-mobile-shell__content');
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
