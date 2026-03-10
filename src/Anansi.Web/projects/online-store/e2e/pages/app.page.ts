import { Page, Locator } from '@playwright/test';

export class StoreAppPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly logo: Locator;
  readonly subtitle: Locator;
  readonly cartButton: Locator;
  readonly cartBadge: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.store-bar');
    this.logo = page.locator('.store-bar__logo');
    this.subtitle = page.locator('.store-bar__subtitle');
    this.cartButton = page.locator('.store-bar__cart-btn');
    this.cartBadge = page.locator('.store-bar__cart-badge');
    this.mainContent = page.locator('.store-shell__content');
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
