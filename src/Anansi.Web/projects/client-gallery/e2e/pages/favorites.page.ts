import { Page, Locator } from '@playwright/test';

export class FavoritesPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly pageTitle: Locator;
  readonly listRows: Locator;
  readonly createButton: Locator;
  readonly createForm: Locator;
  readonly emptyState: Locator;
  readonly spinner: Locator;
  readonly itemsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.gallery-bar');
    this.pageTitle = page.locator('.page-title');
    this.listRows = page.locator('.list-row');
    this.createButton = page.locator('.page-header lib-button');
    this.createForm = page.locator('.create-form');
    this.emptyState = page.locator('lib-empty-state');
    this.spinner = page.locator('lib-spinner');
    this.itemsSection = page.locator('.items-section');
  }

  async goto(collectionId: string = 'demo'): Promise<void> {
    await this.page.goto(`/gallery/${collectionId}/favorites`);
  }

  async getListCount(): Promise<number> {
    return this.listRows.count();
  }
}
