import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class CollectionDetailPage extends AppPage {
  readonly breadcrumb: Locator;
  readonly collectionTitle: Locator;
  readonly statusBadge: Locator;
  readonly tabBar: Locator;
  readonly contentLayout: Locator;
  readonly mainContentArea: Locator;
  readonly sidebarArea: Locator;
  readonly settingsCards: Locator;
  readonly activityList: Locator;
  readonly activityItems: Locator;
  readonly infoRows: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumb = page.locator('lib-breadcrumb');
    this.collectionTitle = page.locator('.collection-title');
    this.statusBadge = page.locator('lib-badge');
    this.tabBar = page.locator('lib-tab-bar');
    this.contentLayout = page.locator('.content-layout');
    this.mainContentArea = page.locator('.main-content');
    this.sidebarArea = page.locator('.sidebar');
    this.settingsCards = page.locator('.settings-cards lib-card');
    this.activityList = page.locator('.activity-list');
    this.activityItems = page.locator('.activity-item');
    this.infoRows = page.locator('.info-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.emptyState = page.locator('lib-empty-state');
  }

  async goto(collectionId: string = 'test-collection'): Promise<void> {
    await this.page.goto(`/galleries/${collectionId}`);
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getActivityItemCount(): Promise<number> {
    return this.activityItems.count();
  }
}
