import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly emptyState: Locator;
  readonly cartSummary: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.store-bar');
    this.pageTitle = page.locator('.page-title');
    this.cartItems = page.locator('.cart-item');
    this.emptyState = page.locator('lib-empty-state');
    this.cartSummary = page.locator('.cart-summary');
    this.checkoutButton = page.locator('lib-button').filter({ hasText: 'Proceed to Checkout' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }
}
