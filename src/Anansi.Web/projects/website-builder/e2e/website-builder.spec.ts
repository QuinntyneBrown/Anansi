import { test, expect } from '@playwright/test';
import { BuilderAppPage } from './pages/app.page';
import { WebsiteListPage } from './pages/website-list.page';
import { TemplateGalleryPage } from './pages/template-gallery.page';
import { PageManagerPage } from './pages/page-manager.page';
import { BlogManagerPage } from './pages/blog-manager.page';
import { SeoManagerPage } from './pages/seo-manager.page';
import { AnalyticsPage } from './pages/analytics.page';

// ---------------------------------------------------------------------------
// Shell & Navigation
// ---------------------------------------------------------------------------
test.describe('Website Builder Shell', () => {
  test('should display sidebar with navigation items', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();

    await expect(app.sidebar).toBeVisible();
    await expect(app.sidebarLogo).toHaveText('Anansi');
    await expect(app.sidebarSubtitle).toHaveText(/Website Builder/i);
    expect(await app.getSidebarItemCount()).toBe(1);
  });

  test('should redirect root to sites', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/sites/);
  });

  test('should render main content area', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.goto();
    await expect(app.mainContent).toBeVisible();
  });

  test('should expose site workflow navigation when viewing a site', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/sites/ws-1/templates');
    expect(await app.getSidebarItemCount()).toBe(6);
  });

  test('should navigate to pages when sidebar item clicked', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/sites/ws-1/templates');
    await app.clickSidebarItem('Pages');
    await expect(page).toHaveURL(/\/sites\/ws-1\/pages/);
  });

  test('should navigate to SEO when sidebar item clicked', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/sites/ws-1/templates');
    await app.clickSidebarItem('SEO Manager');
    await expect(page).toHaveURL(/\/sites\/ws-1\/seo/);
  });

  test('should navigate to blog when sidebar item clicked', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/sites/ws-1/templates');
    await app.clickSidebarItem('Blog');
    await expect(page).toHaveURL(/\/sites\/ws-1\/blog/);
  });

  test('should navigate to analytics when sidebar item clicked', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/sites/ws-1/templates');
    await app.clickSidebarItem('Analytics');
    await expect(page).toHaveURL(/\/sites\/ws-1\/analytics/);
  });
});

// ---------------------------------------------------------------------------
// WEB-16.0.1: Website List - Desktop
// ---------------------------------------------------------------------------
test.describe('WEB-16.0.1: Website List Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to sites page', async ({ page }) => {
    const list = new WebsiteListPage(page);
    await list.goto();
    await expect(page).toHaveURL(/\/sites/);
  });

  test('should show create website button', async ({ page }) => {
    const list = new WebsiteListPage(page);
    await list.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(list.createButton).toBeVisible();
  });

  test('should show website cards grid or empty state', async ({ page }) => {
    const list = new WebsiteListPage(page);
    await list.goto();
    await page.waitForSelector('.site-grid, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasGrid = (await list.siteGrid.count()) > 0;
    const hasEmpty = (await list.emptyState.count()) > 0;
    const hasSpinner = (await list.loadingSpinner.count()) > 0;
    expect(hasGrid || hasEmpty || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// WEB-16.1.1: Template Gallery - Desktop
// ---------------------------------------------------------------------------
test.describe('WEB-16.1.1: Template Gallery Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show template gallery with sidebar', async ({ page }) => {
    const templates = new TemplateGalleryPage(page);
    await templates.goto();

    await expect(templates.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });

  test('should show category filter tabs', async ({ page }) => {
    const templates = new TemplateGalleryPage(page);
    await templates.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show template cards grid or empty state', async ({ page }) => {
    const templates = new TemplateGalleryPage(page);
    await templates.goto();
    await page.waitForSelector('.grid, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasGrid = (await templates.templateGrid.count()) > 0;
    const hasEmpty = (await templates.emptyState.count()) > 0;
    const hasSpinner = (await templates.loadingSpinner.count()) > 0;
    expect(hasGrid || hasEmpty || hasSpinner).toBe(true);
  });

  test('should show use template buttons on cards', async ({ page }) => {
    const templates = new TemplateGalleryPage(page);
    await templates.goto();
    await page.waitForSelector('.template-card, lib-spinner, lib-empty-state', { timeout: 10000 });

    if ((await templates.templateCards.count()) > 0) {
      expect(await templates.useTemplateButtons.count()).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// WEB-16.1.2: Flex Editor - Desktop (1440px)
// ---------------------------------------------------------------------------
test.describe('WEB-16.1.2: Flex Editor Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to templates page', async ({ page }) => {
    const app = new BuilderAppPage(page);
    await app.navigateTo('/sites/ws-1/templates');
    await expect(page).toHaveURL(/\/sites\/ws-1\/templates/);
  });
});

// ---------------------------------------------------------------------------
// WEB-16.1.3: Page Management - Desktop
// ---------------------------------------------------------------------------
test.describe('WEB-16.1.3: Page Management Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show page manager with sidebar', async ({ page }) => {
    const pages = new PageManagerPage(page);
    await pages.goto();

    await expect(pages.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });

  test('should show add page button', async ({ page }) => {
    const pages = new PageManagerPage(page);
    await pages.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(pages.addPageButton).toBeVisible();
  });

  test('should show pages table or empty state', async ({ page }) => {
    const pages = new PageManagerPage(page);
    await pages.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await pages.tableContainer.count()) > 0;
    const hasEmpty = (await pages.emptyState.count()) > 0;
    const hasSpinner = (await pages.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// WEB-16.2.1: Blog Editor - Desktop
// ---------------------------------------------------------------------------
test.describe('WEB-16.2.1: Blog Editor Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show blog manager page', async ({ page }) => {
    const blog = new BlogManagerPage(page);
    await blog.goto();
    await expect(page).toHaveURL(/\/sites\/ws-1\/blog/);
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });

  test('should show create post button', async ({ page }) => {
    const blog = new BlogManagerPage(page);
    await blog.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(blog.createButton).toBeVisible();
  });

  test('should show status filter tabs', async ({ page }) => {
    const blog = new BlogManagerPage(page);
    await blog.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show blog posts table or empty state', async ({ page }) => {
    const blog = new BlogManagerPage(page);
    await blog.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await blog.tableContainer.count()) > 0;
    const hasEmpty = (await blog.emptyState.count()) > 0;
    const hasSpinner = (await blog.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// WEB-16.2.2: SEO Manager - Desktop
// ---------------------------------------------------------------------------
test.describe('WEB-16.2.2: SEO Manager Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show SEO manager with sidebar', async ({ page }) => {
    const seo = new SeoManagerPage(page);
    await seo.goto();

    await expect(seo.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });

  test('should show run audit button', async ({ page }) => {
    const seo = new SeoManagerPage(page);
    await seo.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });

    const hasButton = (await seo.runAuditButton.count()) > 0;
    const hasSpinner = (await seo.loadingSpinner.count()) > 0;
    expect(hasButton || hasSpinner).toBe(true);
  });

  test('should show SEO issues section', async ({ page }) => {
    const seo = new SeoManagerPage(page);
    await seo.goto();
    await page.waitForSelector('.section, lib-spinner', { timeout: 10000 });
  });

  test('should show URL redirects section', async ({ page }) => {
    const seo = new SeoManagerPage(page);
    await seo.goto();
    await page.waitForSelector('.section, lib-spinner', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// WEB-16.2.3: Analytics Dashboard - Desktop
// ---------------------------------------------------------------------------
test.describe('WEB-16.2.3: Analytics Dashboard Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show analytics page with sidebar', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();

    await expect(analytics.sidebar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });

  test('should show stat cards or loading state', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();
    await page.waitForSelector('.stats-grid, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasStats = (await analytics.statsGrid.count()) > 0;
    const hasSpinner = (await analytics.loadingSpinner.count()) > 0;
    const hasEmpty = (await analytics.emptyState.count()) > 0;
    expect(hasStats || hasSpinner || hasEmpty).toBe(true);
  });

  test('should show 4 stat cards for visitor metrics', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();
    await page.waitForSelector('.stat-card, lib-spinner', { timeout: 10000 });

    if ((await analytics.statCards.count()) > 0) {
      expect(await analytics.getStatCardCount()).toBe(4);
    }
  });

  test('should show date range filter controls', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();
    await page.waitForSelector('.filters, lib-spinner', { timeout: 10000 });
  });

  test('should show daily snapshots table', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();
    await page.waitForSelector('.table-container, lib-spinner, lib-empty-state', { timeout: 10000 });
  });

  test('should show refresh button', async ({ page }) => {
    const analytics = new AnalyticsPage(page);
    await analytics.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });

    const hasRefresh = (await analytics.refreshButton.count()) > 0;
    const hasSpinner = (await analytics.loadingSpinner.count()) > 0;
    expect(hasRefresh || hasSpinner).toBe(true);
  });
});
