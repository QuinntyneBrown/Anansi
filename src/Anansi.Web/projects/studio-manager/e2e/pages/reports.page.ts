import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class ReportsPage extends AppPage {
  readonly dashboardContent: Locator;
  readonly metricsRow: Locator;
  readonly metricCards: Locator;
  readonly chartContainer: Locator;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly exportButton: Locator;
  readonly dateRange: Locator;
  readonly loadingSpinner: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardContent = page.locator('.dashboard-content');
    this.metricsRow = page.locator('.metrics-row');
    this.metricCards = page.locator('lib-metric-card');
    this.chartContainer = page.locator('.chart-container');
    this.tableContainer = page.locator('.table-container');
    this.tableRows = page.locator('lib-table-data-row');
    this.exportButton = page.locator('lib-button', { hasText: 'Export' });
    this.dateRange = page.locator('.date-range');
    this.loadingSpinner = page.locator('lib-spinner');
    this.errorText = page.locator('.error-text');
  }

  async goto(): Promise<void> {
    await this.page.goto('/reports');
  }

  async getMetricCardCount(): Promise<number> {
    return this.metricCards.count();
  }

  async getTransactionRowCount(): Promise<number> {
    return this.tableRows.count();
  }
}
