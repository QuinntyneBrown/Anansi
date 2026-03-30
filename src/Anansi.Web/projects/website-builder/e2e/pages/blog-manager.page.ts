import { Page, Locator } from '@playwright/test';
import { BuilderAppPage } from './app.page';

export class BlogManagerPage extends BuilderAppPage {
  readonly pageTitle: Locator;
  readonly createButton: Locator;
  readonly createForm: Locator;
  readonly formInputs: Locator;
  readonly statusSelect: Locator;
  readonly tabBar: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly categoryPills: Locator;
  readonly summaryRow: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.page__title');
    this.createButton = page.locator('lib-button', { hasText: /Create|New/ });
    this.createForm = page.locator('.create-form');
    this.formInputs = page.locator('lib-input-group');
    this.statusSelect = page.locator('.select-input');
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.categoryPills = page.locator('.category-pill');
    this.summaryRow = page.locator('.summary-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(websiteId: string = 'ws-1'): Promise<void> {
    await this.page.goto(`/sites/${websiteId}/blog`);
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }
}
