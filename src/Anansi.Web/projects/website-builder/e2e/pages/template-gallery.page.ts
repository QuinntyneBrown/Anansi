import { Page, Locator } from '@playwright/test';
import { BuilderAppPage } from './app.page';

export class TemplateGalleryPage extends BuilderAppPage {
  readonly pageTitle: Locator;
  readonly tabBar: Locator;
  readonly templateGrid: Locator;
  readonly templateCards: Locator;
  readonly useTemplateButtons: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.page-title');
    this.tabBar = page.locator('lib-pill-tab-bar');
    this.templateGrid = page.locator('.grid');
    this.templateCards = page.locator('.template-card');
    this.useTemplateButtons = page.locator('lib-button', { hasText: 'Use Template' });
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(websiteId: string = 'ws-1'): Promise<void> {
    await this.page.goto(`/sites/${websiteId}/templates`);
  }

  async getTemplateCardCount(): Promise<number> {
    return this.templateCards.count();
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }
}
