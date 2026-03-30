import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class QuotesPage extends AppPage {
  readonly createButton: Locator;
  readonly createForm: Locator;
  readonly searchInput: Locator;
  readonly tabBar: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.locator('lib-button', { hasText: /Create|New Quote/ });
    this.createForm = page.locator('.create-form');
    this.searchInput = page.locator('.search-input');
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/quotes');
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }
}
