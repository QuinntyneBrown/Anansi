import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class ContactDetailPage extends AppPage {
  readonly breadcrumb: Locator;
  readonly avatar: Locator;
  readonly contactName: Locator;
  readonly contactMeta: Locator;
  readonly contactBadge: Locator;
  readonly tabBar: Locator;
  readonly contentLayout: Locator;
  readonly mainContentArea: Locator;
  readonly sidebarArea: Locator;
  readonly infoRows: Locator;
  readonly loadingSpinner: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumb = page.locator('lib-breadcrumb');
    this.avatar = page.locator('lib-avatar');
    this.contactName = page.locator('.contact-name');
    this.contactMeta = page.locator('.contact-meta');
    this.contactBadge = page.locator('lib-badge');
    this.tabBar = page.locator('lib-tab-bar');
    this.contentLayout = page.locator('.content-layout');
    this.mainContentArea = page.locator('.main-content');
    this.sidebarArea = page.locator('.sidebar');
    this.infoRows = page.locator('.info-row');
    this.loadingSpinner = page.locator('lib-spinner');
    this.errorText = page.locator('.error-text');
  }

  async goto(contactId: string = 'test-contact'): Promise<void> {
    await this.page.goto(`/contacts/${contactId}`);
  }

  async selectTab(label: string): Promise<void> {
    await this.tabBar.getByText(label).click();
  }

  async getContactName(): Promise<string> {
    return (await this.contactName.textContent()) ?? '';
  }
}
