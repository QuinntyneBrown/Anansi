import { Page, Locator } from '@playwright/test';

export class FavoritesPage {
  readonly page: Page;
  readonly mobileBar: Locator;
  readonly pageTitle: Locator;
  readonly favoriteItems: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileBar = page.locator('.mobile-bar');
    this.pageTitle = page.locator('.page-title');
    this.favoriteItems = page.locator('.favorite-item');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(collectionId: string = 'test-collection'): Promise<void> {
    await this.page.goto(`/gallery/${collectionId}/favorites`);
  }
}
