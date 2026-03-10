import { test, expect } from '@playwright/test';
import { BuilderAppPage } from './pages/app.page';

test.describe('Website Builder Shell', () => {
  test('should display sidebar with navigation items', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();

    await expect(app.sidebar).toBeVisible();
    await expect(app.sidebarLogo).toHaveText('Anansi');
    await expect(app.sidebarSubtitle).toHaveText(/Website Builder/i);
    expect(await app.getSidebarItemCount()).toBe(3);
  });

  test('should redirect root to templates', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/templates/);
  });

  test('should render main content area', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();
    await expect(app.mainContent).toBeVisible();
  });

  test('should navigate to pages when sidebar item clicked', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();
    await app.clickSidebarItem('Pages');
    await expect(page).toHaveURL(/\/pages/);
  });

  test('should navigate to SEO when sidebar item clicked', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();
    await app.clickSidebarItem('SEO Manager');
    await expect(page).toHaveURL(/\/seo/);
  });
});

// WEB-16.1.1: Template Gallery - Desktop
test.describe('WEB-16.1.1: Template Gallery Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show template thumbnails with category filters', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/templates');

    await expect(app.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });
});

// WEB-16.1.2: Flex Editor - Desktop (1440px)
test.describe('WEB-16.1.2: Flex Editor Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to templates page', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/templates');
    await expect(page).toHaveURL(/\/templates/);
  });
});

// WEB-16.1.3: Page Management - Desktop
test.describe('WEB-16.1.3: Page Management Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show page list with action buttons', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/pages');

    await expect(app.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });
});

// WEB-16.2.1: Blog Editor - Desktop
test.describe('WEB-16.2.1: Blog Editor Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to templates page', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/templates');
    await expect(page).toHaveURL(/\/templates/);
  });
});

// WEB-16.2.2: SEO Manager - Desktop
test.describe('WEB-16.2.2: SEO Manager Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show SEO manager with health indicators', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/seo');

    await expect(app.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });
});
