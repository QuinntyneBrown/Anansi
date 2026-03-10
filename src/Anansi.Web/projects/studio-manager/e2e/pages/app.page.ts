import { Page, Locator } from '@playwright/test';

export class AppPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly topNav: Locator;
  readonly mainContent: Locator;
  readonly sidebarLogo: Locator;
  readonly sidebarSubtitle: Locator;
  readonly sidebarItems: Locator;
  readonly collapseButton: Locator;
  readonly hamburgerButton: Locator;
  readonly notificationButton: Locator;
  readonly pageTitle: Locator;
  readonly mobileTabBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('.sidebar');
    this.topNav = page.locator('.topnav');
    this.mainContent = page.locator('.shell__content');
    this.sidebarLogo = page.locator('.sidebar__logo');
    this.sidebarSubtitle = page.locator('.sidebar__subtitle');
    this.sidebarItems = page.locator('lib-sidebar-item');
    this.collapseButton = page.locator('.sidebar__collapse-btn');
    this.hamburgerButton = page.locator('.topnav__hamburger');
    this.notificationButton = page.locator('.topnav__notification-btn');
    this.pageTitle = page.locator('.topnav__title');
    this.mobileTabBar = page.locator('.mobile-tabs');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async clickSidebarItem(label: string): Promise<void> {
    await this.page
      .locator('lib-sidebar-item')
      .filter({ hasText: label })
      .click();
  }

  async toggleSidebar(): Promise<void> {
    await this.collapseButton.click();
  }

  async getPageTitle(): Promise<string> {
    return (await this.pageTitle.textContent()) ?? '';
  }

  async getSidebarItemCount(): Promise<number> {
    return this.sidebarItems.count();
  }

  async isSidebarCollapsed(): Promise<boolean> {
    return this.sidebar.evaluate((el) =>
      el.classList.contains('sidebar--collapsed'),
    );
  }

  async getNotificationBadgeText(): Promise<string | null> {
    const badge = this.page.locator('.topnav__notification-badge');
    if ((await badge.count()) === 0) {
      return null;
    }
    return badge.textContent();
  }
}
