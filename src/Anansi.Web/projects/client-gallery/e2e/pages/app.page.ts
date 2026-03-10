import { Page, Locator } from '@playwright/test';

export class GalleryAppPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly logo: Locator;
  readonly backButton: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.gallery-bar');
    this.logo = page.locator('.gallery-bar__logo');
    this.backButton = page.locator('.gallery-bar__link');
    this.mainContent = page.locator('.gallery-shell__content');
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
