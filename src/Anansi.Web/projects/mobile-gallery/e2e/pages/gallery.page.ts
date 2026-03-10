import { Page, Locator } from '@playwright/test';

export class GalleryPage {
  readonly page: Page;
  readonly mobileBar: Locator;
  readonly pageTitle: Locator;
  readonly photoGrid: Locator;
  readonly photoItems: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;
  readonly coverImage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileBar = page.locator('.mobile-bar');
    this.pageTitle = page.locator('.page-title');
    this.photoGrid = page.locator('.photo-grid, .gallery-grid');
    this.photoItems = page.locator('.photo-item, .gallery-item');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
    this.coverImage = page.locator('.cover-image, .gallery-cover');
  }

  async goto(collectionId: string = 'test-collection'): Promise<void> {
    await this.page.goto(`/gallery/${collectionId}`);
  }

  async getPhotoCount(): Promise<number> {
    return this.photoItems.count();
  }
}
