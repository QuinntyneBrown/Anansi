import { Page, Locator } from '@playwright/test';

export class GalleryPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly galleryTitle: Locator;
  readonly galleryDescription: Locator;
  readonly photoGrid: Locator;
  readonly photoCards: Locator;
  readonly spinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator('.gallery-bar');
    this.galleryTitle = page.locator('.gallery-title');
    this.galleryDescription = page.locator('.gallery-description');
    this.photoGrid = page.locator('.photo-grid');
    this.photoCards = page.locator('.photo-card');
    this.spinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(collectionId: string = 'demo'): Promise<void> {
    await this.page.goto(`/gallery/${collectionId}`);
  }

  async getPhotoCardCount(): Promise<number> {
    return this.photoCards.count();
  }

  async getGalleryTitle(): Promise<string> {
    return (await this.galleryTitle.textContent()) ?? '';
  }
}
