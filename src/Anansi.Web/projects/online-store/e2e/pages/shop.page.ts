import { Page, Locator } from '@playwright/test';

export class ShopPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly filterTabs: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.store-bar');
    this.pageTitle = page.locator('.page-title');
    this.productGrid = page.locator('.product-grid');
    this.productCards = page.locator('.product-card');
    this.filterTabs = page.locator('lib-tab-bar');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/shop');
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }
}
