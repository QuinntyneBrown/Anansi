import { Page, Locator } from '@playwright/test';
import { BuilderAppPage } from './app.page';

export class PageManagerPage extends BuilderAppPage {
  readonly pageTitle: Locator;
  readonly addPageButton: Locator;
  readonly addForm: Locator;
  readonly formInputs: Locator;
  readonly pageTypeSelect: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.page-title');
    this.addPageButton = page.locator('lib-button', { hasText: 'Add Page' });
    this.addForm = page.locator('.add-form');
    this.formInputs = page.locator('lib-input-group');
    this.pageTypeSelect = page.locator('.select-input');
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(websiteId: string = 'ws-1'): Promise<void> {
    await this.page.goto(`/sites/${websiteId}/pages`);
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }
}
