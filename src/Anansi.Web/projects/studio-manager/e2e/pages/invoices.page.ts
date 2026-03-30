import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class InvoicesPage extends AppPage {
  readonly createButton: Locator;
  readonly tabBar: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly paginationInfo: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.locator('lib-button', { hasText: 'Create Invoice' });
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.paginationInfo = page.locator('.pagination-info');
    this.previousButton = page.locator('.page-btn', { hasText: 'Previous' });
    this.nextButton = page.locator('.page-btn', { hasText: 'Next' });
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/documents/invoices');
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }
}
