import { Page, Locator } from '@playwright/test';
import { BuilderAppPage } from './app.page';

export class SeoManagerPage extends BuilderAppPage {
  readonly pageTitle: Locator;
  readonly runAuditButton: Locator;
  readonly issuesSection: Locator;
  readonly issuesTable: Locator;
  readonly issueRows: Locator;
  readonly redirectsSection: Locator;
  readonly redirectsTable: Locator;
  readonly redirectRows: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.page-title');
    this.runAuditButton = page.locator('lib-button', { hasText: 'Run Audit' });
    this.issuesSection = page.locator('.section').first();
    this.issuesTable = page.locator('.table-container').first();
    this.issueRows = page.locator('.table-container').first().locator('lib-table-data-row');
    this.redirectsSection = page.locator('.section').nth(1);
    this.redirectsTable = page.locator('.table-container').nth(1);
    this.redirectRows = page.locator('.table-container').nth(1).locator('lib-table-data-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(websiteId: string = 'ws-1'): Promise<void> {
    await this.page.goto(`/sites/${websiteId}/seo`);
  }

  async getIssueRowCount(): Promise<number> {
    return this.issueRows.count();
  }

  async getRedirectRowCount(): Promise<number> {
    return this.redirectRows.count();
  }
}
