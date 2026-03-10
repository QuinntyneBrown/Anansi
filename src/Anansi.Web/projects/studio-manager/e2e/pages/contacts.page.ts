import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class ContactsPage extends AppPage {
  readonly searchInput: Locator;
  readonly addContactButton: Locator;
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
    this.searchInput = page.locator('.search-input');
    this.addContactButton = page.locator('lib-button', { hasText: 'Add Contact' });
    this.tabBar = page.locator('lib-tab-bar');
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.paginationInfo = page.locator('.pagination-info');
    this.previousButton = page.locator('.page-btn', { hasText: 'Previous' });
    this.nextButton = page.locator('.page-btn', { hasText: 'Next' });
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('.empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/contacts');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async selectTab(label: string): Promise<void> {
    await this.page.locator('lib-tab-bar').getByText(label).click();
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async clickNextPage(): Promise<void> {
    await this.nextButton.click();
  }

  async clickPreviousPage(): Promise<void> {
    await this.previousButton.click();
  }
}
