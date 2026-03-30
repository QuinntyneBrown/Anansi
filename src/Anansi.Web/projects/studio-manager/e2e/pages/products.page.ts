import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class ProductsPage extends AppPage {
  readonly addProductButton: Locator;
  readonly tabBar: Locator;
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly paginationInfo: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.addProductButton = page.locator('lib-button', { hasText: 'Add Product' });
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.productGrid = page.locator('.product-grid');
    this.productCards = page.locator('.product-card');
    this.paginationInfo = page.locator('.pagination__info');
    this.previousButton = page.locator('.page-btn', { hasText: 'Previous' });
    this.nextButton = page.locator('.page-btn', { hasText: 'Next' });
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/store/products');
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getProductCardCount(): Promise<number> {
    return this.productCards.count();
  }
}
