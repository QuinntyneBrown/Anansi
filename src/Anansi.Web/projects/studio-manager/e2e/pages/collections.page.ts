import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class CollectionsPage extends AppPage {
  readonly searchInput: Locator;
  readonly createButton: Locator;
  readonly tabBar: Locator;
  readonly grid: Locator;
  readonly collectionCards: Locator;
  readonly starButtons: Locator;
  readonly paginationInfo: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('.search-input');
    this.createButton = page.locator('lib-button', { hasText: 'Create Collection' });
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.grid = page.locator('.grid');
    this.collectionCards = page.locator('lib-card');
    this.starButtons = page.locator('.star-btn');
    this.paginationInfo = page.locator('.pagination-info');
    this.previousButton = page.locator('.page-btn', { hasText: 'Previous' });
    this.nextButton = page.locator('.page-btn', { hasText: 'Next' });
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/galleries');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getCollectionCardCount(): Promise<number> {
    return this.collectionCards.count();
  }
}
