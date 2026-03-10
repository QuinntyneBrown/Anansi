import { Page, Locator } from '@playwright/test';

export class BuilderAppPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly sidebarLogo: Locator;
  readonly sidebarSubtitle: Locator;
  readonly sidebarItems: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('.wb-sidebar');
    this.sidebarLogo = page.locator('.wb-sidebar__logo');
    this.sidebarSubtitle = page.locator('.wb-sidebar__subtitle');
    this.sidebarItems = page.locator('.wb-sidebar__item');
    this.mainContent = page.locator('.builder-shell__content');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async clickSidebarItem(label: string): Promise<void> {
    await this.page.locator('.wb-sidebar__item').filter({ hasText: label }).click();
  }

  async getSidebarItemCount(): Promise<number> {
    return this.sidebarItems.count();
  }
}
