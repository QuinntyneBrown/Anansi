import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly checkoutForm: Locator;
  readonly orderSummary: Locator;
  readonly submitButton: Locator;
  readonly successContent: Locator;
  readonly emptyState: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.store-bar');
    this.pageTitle = page.locator('.page-title');
    this.checkoutForm = page.locator('.checkout-form');
    this.orderSummary = page.locator('.order-summary');
    this.submitButton = page.locator('lib-button').filter({ hasText: 'Place Order' });
    this.successContent = page.locator('.success-content');
    this.emptyState = page.locator('lib-empty-state');
    this.nameInput = page.locator('lib-input-group').first();
    this.emailInput = page.locator('lib-input-group').nth(1);
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }
}
