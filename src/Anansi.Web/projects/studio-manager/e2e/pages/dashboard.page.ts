import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class DashboardPage extends AppPage {
  readonly metricsRow: Locator;
  readonly metricCards: Locator;
  readonly upcomingSessions: Locator;
  readonly recentActivity: Locator;
  readonly sessionRows: Locator;
  readonly activityRows: Locator;
  readonly loadingSpinner: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    super(page);
    this.metricsRow = page.locator('.metrics-row');
    this.metricCards = page.locator('lib-metric-card');
    this.upcomingSessions = page.locator('.session-row');
    this.recentActivity = page.locator('.activity-row');
    this.sessionRows = page.locator('.session-row');
    this.activityRows = page.locator('.activity-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.errorText = page.locator('.error-text');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async getMetricCardCount(): Promise<number> {
    return this.metricCards.count();
  }

  async getSessionRowCount(): Promise<number> {
    return this.sessionRows.count();
  }

  async getActivityRowCount(): Promise<number> {
    return this.activityRows.count();
  }

  async isLoading(): Promise<boolean> {
    return (await this.loadingSpinner.count()) > 0;
  }

  async hasError(): Promise<boolean> {
    return (await this.errorText.count()) > 0;
  }
}
