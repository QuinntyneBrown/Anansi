import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class BookingsPage extends AppPage {
  readonly tabBar: Locator;
  readonly dateFromInput: Locator;
  readonly dateToInput: Locator;
  readonly filterButton: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly confirmButtons: Locator;
  readonly paginationInfo: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.dateFromInput = page.locator('.date-filters lib-input-group').first();
    this.dateToInput = page.locator('.date-filters lib-input-group').nth(1);
    this.filterButton = page.locator('lib-button', { hasText: 'Filter' });
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.confirmButtons = page.locator('lib-button', { hasText: 'Confirm' });
    this.paginationInfo = page.locator('.pagination-info');
    this.previousButton = page.locator('.page-btn', { hasText: 'Previous' });
    this.nextButton = page.locator('.page-btn', { hasText: 'Next' });
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/bookings');
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }
}
