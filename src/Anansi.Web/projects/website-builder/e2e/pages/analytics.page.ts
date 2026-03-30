import { Page, Locator } from '@playwright/test';
import { BuilderAppPage } from './app.page';

export class AnalyticsPage extends BuilderAppPage {
  readonly pageTitle: Locator;
  readonly statsGrid: Locator;
  readonly statCards: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly refreshButton: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.page__title');
    this.statsGrid = page.locator('.stats-grid');
    this.statCards = page.locator('.stat-card');
    this.startDateInput = page.locator('.filter-field').first();
    this.endDateInput = page.locator('.filter-field').nth(1);
    this.refreshButton = page.locator('lib-button', { hasText: 'Refresh' });
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(websiteId: string = 'ws-1'): Promise<void> {
    await this.page.goto(`/sites/${websiteId}/analytics`);
  }

  async getStatCardCount(): Promise<number> {
    return this.statCards.count();
  }
}
