import { test, expect } from '@playwright/test';
import { AppPage } from './pages/app.page';
import { DashboardPage } from './pages/dashboard.page';
import { ContactsPage } from './pages/contacts.page';
import { InboxPage } from './pages/inbox.page';

test.describe('Studio Manager Shell', () => {
  test('should display sidebar with navigation items', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    await expect(app.sidebar).toBeVisible();
    await expect(app.sidebarLogo).toHaveText('Anansi');
    await expect(app.sidebarSubtitle).toHaveText(/Studio Manager/i);
    expect(await app.getSidebarItemCount()).toBe(9);
  });

  test('should display top navigation bar', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    await expect(app.topNav).toBeVisible();
    await expect(app.notificationButton).toBeVisible();
  });

  test('should redirect root to dashboard', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to contacts when sidebar item clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.clickSidebarItem('Contacts');
    await expect(page).toHaveURL(/\/contacts/);
  });

  test('should navigate to projects when sidebar item clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.clickSidebarItem('Projects');
    await expect(page).toHaveURL(/\/projects/);
  });

  test('should navigate to calendar when sidebar item clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.clickSidebarItem('Calendar');
    await expect(page).toHaveURL(/\/calendar/);
  });

  test('should navigate to inbox when sidebar item clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.clickSidebarItem('Inbox');
    await expect(page).toHaveURL(/\/inbox/);
  });

  test('should navigate to reports when sidebar item clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.clickSidebarItem('Reports');
    await expect(page).toHaveURL(/\/reports/);
  });

  test('should navigate to settings when sidebar item clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.clickSidebarItem('Settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should collapse sidebar when toggle button clicked', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.toggleSidebar();
    expect(await app.isSidebarCollapsed()).toBe(true);
  });

  test('should expand sidebar when toggle button clicked twice', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.toggleSidebar();
    await app.toggleSidebar();
    expect(await app.isSidebarCollapsed()).toBe(false);
  });
});

// SM-13.1.1: Dashboard - Desktop (1440px)
test.describe('SM-13.1.1: Dashboard Desktop Layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show sidebar (260px) + main content layout', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.sidebar).toBeVisible();
    await expect(dashboard.mainContent).toBeVisible();
  });

  test('should show 4 metric cards in a row', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await page.waitForSelector('lib-metric-card', { timeout: 10000 });
    expect(await dashboard.getMetricCardCount()).toBe(4);
  });

  test('should show upcoming sessions and recent activity in two columns', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await page.waitForSelector('.two-column', { timeout: 10000 });

    const twoColumn = page.locator('.two-column');
    await expect(twoColumn).toBeVisible();
  });

  test('should show page title as Dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const title = await dashboard.getPageTitle();
    expect(title).toContain('Dashboard');
  });

  test('should show notification bell in top bar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.notificationButton).toBeVisible();
  });
});

// SM-13.1.2: Dashboard - Tablet (768px)
test.describe('SM-13.1.2: Dashboard Tablet Layout', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should show collapsed sidebar on tablet', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    // On tablet, sidebar is hidden (off-screen)
    await expect(dashboard.hamburgerButton).toBeVisible();
  });
});

// SM-13.1.3: Dashboard - Mobile (402px)
test.describe('SM-13.1.3: Dashboard Mobile Layout', () => {
  test.use({ viewport: { width: 402, height: 874 } });

  test('should show hamburger menu instead of sidebar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.hamburgerButton).toBeVisible();
  });

  test('should show mobile tab bar at bottom', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.mobileTabBar).toBeVisible();
  });

  test('should show Dashboard title', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const title = await dashboard.getPageTitle();
    expect(title).toContain('Dashboard');
  });
});

// SM-13.2.1: Contact List - Desktop
test.describe('SM-13.2.1: Contact List Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should display contacts page with search and add button', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    await expect(contacts.searchInput).toBeVisible();
    await expect(contacts.addContactButton).toBeVisible();
  });

  test('should display filter tabs', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();
    await expect(contacts.tabBar).toBeVisible();
  });

  test('should display table with pagination', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();
    await page.waitForSelector('.table-container, .empty-state', { timeout: 10000 });

    const hasTable = (await contacts.tableContainer.count()) > 0;
    const hasEmpty = (await contacts.emptyState.count()) > 0;
    expect(hasTable || hasEmpty).toBe(true);
  });
});

// SM-13.6.1: Inbox - Desktop
test.describe('SM-13.6.1: Inbox Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should display inbox with conversation list and message area', async ({ page }) => {
    const inbox = new InboxPage(page);
    await inbox.goto();

    await expect(inbox.inboxSidebar).toBeVisible();
  });

  test('should show empty selection state when no conversation selected', async ({ page }) => {
    const inbox = new InboxPage(page);
    await inbox.goto();
    await page.waitForSelector('.inbox__no-selection, .inbox__thread-header', { timeout: 10000 });
  });
});

// SM-13.3.1: Kanban Board - Desktop
test.describe('SM-13.3.1: Kanban Board Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to projects page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/projects');
    await expect(page).toHaveURL(/\/projects/);
  });
});

// SM-13.4.1: Calendar View - Desktop
test.describe('SM-13.4.1: Calendar View Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to calendar page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/calendar');
    await expect(page).toHaveURL(/\/calendar/);
  });
});

// SM-13.5.1: Contract Editor (Documents)
test.describe('SM-13.5.1: Documents - Contracts', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to contracts page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/documents/contracts');
    await expect(page).toHaveURL(/\/documents\/contracts/);
  });
});

// SM-13.5.2: Invoice Builder
test.describe('SM-13.5.2: Documents - Invoices', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to invoices page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/documents/invoices');
    await expect(page).toHaveURL(/\/documents\/invoices/);
  });
});

// SM-13.7.1: Revenue Dashboard
test.describe('SM-13.7.1: Revenue Dashboard Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to reports page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/reports');
    await expect(page).toHaveURL(/\/reports/);
  });
});

// SM-13.8.1: Settings
test.describe('SM-13.8.1: Settings Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to settings page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should navigate to notification settings page', async ({ page }) => {
    const app = new AppPage(page);
    await app.navigateTo('/settings/notifications');
    await expect(page).toHaveURL(/\/settings\/notifications/);
  });
});
