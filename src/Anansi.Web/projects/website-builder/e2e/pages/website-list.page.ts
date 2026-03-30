import { Page, Locator } from '@playwright/test';
import { BuilderAppPage } from './app.page';

export class WebsiteListPage extends BuilderAppPage {
  readonly pageTitle: Locator;
  readonly createButton: Locator;
  readonly createForm: Locator;
  readonly siteGrid: Locator;
  readonly siteCards: Locator;
  readonly formInputs: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.page__title');
    this.createButton = page.locator('lib-button', { hasText: /Create|New/ });
    this.createForm = page.locator('.create-form');
    this.siteGrid = page.locator('.site-grid');
    this.siteCards = page.locator('.site-card');
    this.formInputs = page.locator('lib-input-group');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/sites');
  }

  async getSiteCardCount(): Promise<number> {
    return this.siteCards.count();
  }
}
