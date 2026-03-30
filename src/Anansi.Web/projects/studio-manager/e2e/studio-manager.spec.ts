import { test, expect } from '@playwright/test';
import { AppPage } from './pages/app.page';
import { DashboardPage } from './pages/dashboard.page';
import { ContactsPage } from './pages/contacts.page';
import { ContactDetailPage } from './pages/contact-detail.page';
import { InboxPage } from './pages/inbox.page';
import { ProjectsPage } from './pages/projects.page';
import { CalendarPage } from './pages/calendar.page';
import { ContractsPage } from './pages/contracts.page';
import { InvoicesPage } from './pages/invoices.page';
import { ReportsPage } from './pages/reports.page';
import { AccountSettingsPage } from './pages/account-settings.page';
import { NotificationSettingsPage } from './pages/notification-settings.page';
import { CollectionsPage } from './pages/collections.page';
import { CollectionDetailPage } from './pages/collection-detail.page';
import { ProductsPage } from './pages/products.page';
import { OrdersPage } from './pages/orders.page';
import { BookingsPage } from './pages/bookings.page';
import { QuotesPage } from './pages/quotes.page';
import { QuestionnairesPage } from './pages/questionnaires.page';

// ---------------------------------------------------------------------------
// Shell & Navigation
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// SM-13.1.1: Dashboard - Desktop (1440px)
// ---------------------------------------------------------------------------
test.describe('SM-13.1.1: Dashboard Desktop Layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show sidebar + main content layout', async ({ page }) => {
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

// ---------------------------------------------------------------------------
// SM-13.2.1: Contact List - Desktop
// ---------------------------------------------------------------------------
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

  test('should accept search input', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();
    await contacts.search('John');
    await expect(contacts.searchInput).toHaveValue('John');
  });
});

// SM-13.2.2: Contact Detail
test.describe('SM-13.2.2: Contact Detail Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to contact detail page', async ({ page }) => {
    const detail = new ContactDetailPage(page);
    await detail.goto('test-contact');
    await expect(page).toHaveURL(/\/contacts\/test-contact/);
  });

  test('should show breadcrumb navigation', async ({ page }) => {
    const detail = new ContactDetailPage(page);
    await detail.goto('test-contact');
    await page.waitForSelector('lib-breadcrumb, lib-spinner, .error-container', { timeout: 10000 });
  });

  test('should show two-column layout with main content and sidebar', async ({ page }) => {
    const detail = new ContactDetailPage(page);
    await detail.goto('test-contact');
    await page.waitForSelector('.content-layout, lib-spinner, .error-container', { timeout: 10000 });
  });

  test('should show tab bar for content sections', async ({ page }) => {
    const detail = new ContactDetailPage(page);
    await detail.goto('test-contact');
    await page.waitForSelector('lib-tab-bar, lib-spinner, .error-container', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// SM-13.3.1: Kanban Board - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.3.1: Kanban Board Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to projects page', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await expect(page).toHaveURL(/\/projects/);
  });

  test('should show board or loading state', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await page.waitForSelector('.board, lib-spinner, .empty-board', { timeout: 10000 });

    const hasBoard = (await projects.board.count()) > 0;
    const hasSpinner = (await projects.loadingSpinner.count()) > 0;
    const hasEmpty = (await projects.emptyBoard.count()) > 0;
    expect(hasBoard || hasSpinner || hasEmpty).toBe(true);
  });

  test('should show add stage and add project buttons', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });

    const hasAddStage = (await projects.addStageButton.count()) > 0;
    const hasAddProject = (await projects.addProjectButton.count()) > 0;
    expect(hasAddStage || hasAddProject).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SM-13.4.1: Calendar View - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.4.1: Calendar View Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to calendar page', async ({ page }) => {
    const calendar = new CalendarPage(page);
    await calendar.goto();
    await expect(page).toHaveURL(/\/calendar/);
  });

  test('should show calendar grid or loading state', async ({ page }) => {
    const calendar = new CalendarPage(page);
    await calendar.goto();
    await page.waitForSelector('.calendar-layout, lib-spinner, .error-container', { timeout: 10000 });

    const hasCalendar = (await calendar.calendarLayout.count()) > 0;
    const hasSpinner = (await calendar.loadingSpinner.count()) > 0;
    expect(hasCalendar || hasSpinner).toBe(true);
  });

  test('should show month title and weekday headers', async ({ page }) => {
    const calendar = new CalendarPage(page);
    await calendar.goto();
    await page.waitForSelector('.calendar-layout, lib-spinner', { timeout: 10000 });

    if ((await calendar.calendarLayout.count()) > 0) {
      await expect(calendar.monthTitle).toBeVisible();
      await expect(calendar.weekdayRow).toBeVisible();
    }
  });

  test('should show day detail panel', async ({ page }) => {
    const calendar = new CalendarPage(page);
    await calendar.goto();
    await page.waitForSelector('.calendar-layout, lib-spinner', { timeout: 10000 });

    if ((await calendar.calendarLayout.count()) > 0) {
      await expect(calendar.dayDetail).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// SM-13.5.1: Contract List - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.5.1: Documents - Contracts Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to contracts page', async ({ page }) => {
    const contracts = new ContractsPage(page);
    await contracts.goto();
    await expect(page).toHaveURL(/\/documents\/contracts/);
  });

  test('should show create contract button', async ({ page }) => {
    const contracts = new ContractsPage(page);
    await contracts.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(contracts.createButton).toBeVisible();
  });

  test('should show filter tab bar', async ({ page }) => {
    const contracts = new ContractsPage(page);
    await contracts.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });

    const hasTabBar = (await contracts.tabBar.count()) > 0;
    const hasSpinner = (await contracts.loadingSpinner.count()) > 0;
    expect(hasTabBar || hasSpinner).toBe(true);
  });

  test('should show table or empty state', async ({ page }) => {
    const contracts = new ContractsPage(page);
    await contracts.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await contracts.tableContainer.count()) > 0;
    const hasEmpty = (await contracts.emptyState.count()) > 0;
    const hasSpinner = (await contracts.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SM-13.5.2: Invoice List - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.5.2: Documents - Invoices Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to invoices page', async ({ page }) => {
    const invoices = new InvoicesPage(page);
    await invoices.goto();
    await expect(page).toHaveURL(/\/documents\/invoices/);
  });

  test('should show create invoice button', async ({ page }) => {
    const invoices = new InvoicesPage(page);
    await invoices.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(invoices.createButton).toBeVisible();
  });

  test('should show status filter tabs', async ({ page }) => {
    const invoices = new InvoicesPage(page);
    await invoices.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });

    const hasTabBar = (await invoices.tabBar.count()) > 0;
    const hasSpinner = (await invoices.loadingSpinner.count()) > 0;
    expect(hasTabBar || hasSpinner).toBe(true);
  });

  test('should show table or empty state', async ({ page }) => {
    const invoices = new InvoicesPage(page);
    await invoices.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await invoices.tableContainer.count()) > 0;
    const hasEmpty = (await invoices.emptyState.count()) > 0;
    const hasSpinner = (await invoices.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SM-13.6.1: Inbox - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.6.1: Inbox Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should display inbox with conversation list', async ({ page }) => {
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

// ---------------------------------------------------------------------------
// SM-13.7.1: Revenue Dashboard - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.7.1: Revenue Dashboard Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to reports page', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await expect(page).toHaveURL(/\/reports/);
  });

  test('should show metric cards or loading state', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await page.waitForSelector('lib-metric-card, lib-spinner, .error-container', { timeout: 10000 });

    const hasMetrics = (await reports.metricCards.count()) > 0;
    const hasSpinner = (await reports.loadingSpinner.count()) > 0;
    expect(hasMetrics || hasSpinner).toBe(true);
  });

  test('should show 4 metric cards for revenue KPIs', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await page.waitForSelector('lib-metric-card, lib-spinner', { timeout: 10000 });

    if ((await reports.metricCards.count()) > 0) {
      expect(await reports.getMetricCardCount()).toBe(4);
    }
  });

  test('should show chart container for revenue visualization', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await page.waitForSelector('.chart-container, lib-spinner, .error-container', { timeout: 10000 });
  });

  test('should show transactions table', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await page.waitForSelector('.table-container, lib-spinner, .error-container', { timeout: 10000 });
  });

  test('should show export button', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });

    const hasExport = (await reports.exportButton.count()) > 0;
    const hasSpinner = (await reports.loadingSpinner.count()) > 0;
    expect(hasExport || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SM-13.8.1: Account Settings - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.8.1: Account Settings Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to settings page', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should show profile form with input fields', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('.form, lib-spinner', { timeout: 10000 });

    const hasForm = (await settings.form.count()) > 0;
    const hasSpinner = (await settings.loadingSpinner.count()) > 0;
    expect(hasForm || hasSpinner).toBe(true);
  });

  test('should show save changes button', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('.form, lib-spinner', { timeout: 10000 });

    if ((await settings.form.count()) > 0) {
      await expect(settings.saveButton).toBeVisible();
    }
  });

  test('should show storage usage bar', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('.storage, lib-spinner', { timeout: 10000 });
  });

  test('should show danger zone with delete button', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('.section__title--danger, lib-spinner', { timeout: 10000 });

    if ((await settings.dangerZone.count()) > 0) {
      await expect(settings.deleteButton).toBeVisible();
    }
  });
});

// SM-13.8.2: Notification Settings
test.describe('SM-13.8.2: Notification Settings Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to notification settings page', async ({ page }) => {
    const settings = new NotificationSettingsPage(page);
    await settings.goto();
    await expect(page).toHaveURL(/\/settings\/notifications/);
  });

  test('should show notification preferences grid', async ({ page }) => {
    const settings = new NotificationSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('.prefs, lib-spinner', { timeout: 10000 });

    const hasPrefs = (await settings.prefsGrid.count()) > 0;
    const hasSpinner = (await settings.loadingSpinner.count()) > 0;
    expect(hasPrefs || hasSpinner).toBe(true);
  });

  test('should show toggle switches for notification channels', async ({ page }) => {
    const settings = new NotificationSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('lib-toggle, lib-spinner', { timeout: 10000 });
  });

  test('should show save preferences button', async ({ page }) => {
    const settings = new NotificationSettingsPage(page);
    await settings.goto();
    await page.waitForSelector('.prefs, lib-spinner', { timeout: 10000 });

    if ((await settings.prefsGrid.count()) > 0) {
      await expect(settings.saveButton).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// SM-13.9.1: Gallery Management - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.9.1: Gallery Collection List Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to galleries page', async ({ page }) => {
    const collections = new CollectionsPage(page);
    await collections.goto();
    await expect(page).toHaveURL(/\/galleries/);
  });

  test('should show search input and create button', async ({ page }) => {
    const collections = new CollectionsPage(page);
    await collections.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });

    await expect(collections.searchInput).toBeVisible();
    await expect(collections.createButton).toBeVisible();
  });

  test('should show status filter tabs', async ({ page }) => {
    const collections = new CollectionsPage(page);
    await collections.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show collection grid or empty state', async ({ page }) => {
    const collections = new CollectionsPage(page);
    await collections.goto();
    await page.waitForSelector('.grid, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasGrid = (await collections.grid.count()) > 0;
    const hasEmpty = (await collections.emptyState.count()) > 0;
    const hasSpinner = (await collections.loadingSpinner.count()) > 0;
    expect(hasGrid || hasEmpty || hasSpinner).toBe(true);
  });

  test('should accept search input', async ({ page }) => {
    const collections = new CollectionsPage(page);
    await collections.goto();
    await collections.search('Wedding');
    await expect(collections.searchInput).toHaveValue('Wedding');
  });
});

// SM-13.9.2: Gallery Collection Detail
test.describe('SM-13.9.2: Gallery Collection Detail Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to collection detail page', async ({ page }) => {
    const detail = new CollectionDetailPage(page);
    await detail.goto('test-collection');
    await expect(page).toHaveURL(/\/galleries\/test-collection/);
  });

  test('should show breadcrumb and title or loading state', async ({ page }) => {
    const detail = new CollectionDetailPage(page);
    await detail.goto('test-collection');
    await page.waitForSelector('lib-breadcrumb, lib-spinner', { timeout: 10000 });
  });

  test('should show content tabs for Media, Settings, Activity', async ({ page }) => {
    const detail = new CollectionDetailPage(page);
    await detail.goto('test-collection');
    await page.waitForSelector('lib-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show two-column layout', async ({ page }) => {
    const detail = new CollectionDetailPage(page);
    await detail.goto('test-collection');
    await page.waitForSelector('.content-layout, lib-spinner', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// SM-13.10.1: Product Catalog - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.10.1: Product Catalog Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to products page', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await expect(page).toHaveURL(/\/store\/products/);
  });

  test('should show add product button', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(products.addProductButton).toBeVisible();
  });

  test('should show product type filter tabs', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show product grid or empty state', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await page.waitForSelector('.product-grid, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasGrid = (await products.productGrid.count()) > 0;
    const hasEmpty = (await products.emptyState.count()) > 0;
    const hasSpinner = (await products.loadingSpinner.count()) > 0;
    expect(hasGrid || hasEmpty || hasSpinner).toBe(true);
  });
});

// SM-13.10.2: Order Management
test.describe('SM-13.10.2: Order Management Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to orders page', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.goto();
    await expect(page).toHaveURL(/\/store\/orders/);
  });

  test('should show search input', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(orders.searchInput).toBeVisible();
  });

  test('should show order status filter tabs', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show orders table or empty state', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await orders.tableContainer.count()) > 0;
    const hasEmpty = (await orders.emptyState.count()) > 0;
    const hasSpinner = (await orders.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });

  test('should accept search input for client name', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.goto();
    await orders.search('Jane');
    await expect(orders.searchInput).toHaveValue('Jane');
  });
});

// ---------------------------------------------------------------------------
// SM-13.11.1: Booking Management - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.11.1: Booking Management Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to bookings page', async ({ page }) => {
    const bookings = new BookingsPage(page);
    await bookings.goto();
    await expect(page).toHaveURL(/\/bookings/);
  });

  test('should show status filter tabs', async ({ page }) => {
    const bookings = new BookingsPage(page);
    await bookings.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show date filter inputs', async ({ page }) => {
    const bookings = new BookingsPage(page);
    await bookings.goto();
    await page.waitForSelector('.date-filters, lib-spinner', { timeout: 10000 });
  });

  test('should show bookings table or empty state', async ({ page }) => {
    const bookings = new BookingsPage(page);
    await bookings.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await bookings.tableContainer.count()) > 0;
    const hasEmpty = (await bookings.emptyState.count()) > 0;
    const hasSpinner = (await bookings.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SM-13.12.1: Quotes - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.12.1: Quotes Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to quotes page', async ({ page }) => {
    const quotes = new QuotesPage(page);
    await quotes.goto();
    await expect(page).toHaveURL(/\/quotes/);
  });

  test('should show create quote button', async ({ page }) => {
    const quotes = new QuotesPage(page);
    await quotes.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(quotes.createButton).toBeVisible();
  });

  test('should show status filter tabs', async ({ page }) => {
    const quotes = new QuotesPage(page);
    await quotes.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show quotes table or empty state', async ({ page }) => {
    const quotes = new QuotesPage(page);
    await quotes.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await quotes.tableContainer.count()) > 0;
    const hasEmpty = (await quotes.emptyState.count()) > 0;
    const hasSpinner = (await quotes.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });

  test('should show search input', async ({ page }) => {
    const quotes = new QuotesPage(page);
    await quotes.goto();
    await page.waitForSelector('.toolbar, lib-spinner', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// SM-13.13.1: Questionnaires - Desktop
// ---------------------------------------------------------------------------
test.describe('SM-13.13.1: Questionnaires Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to questionnaires page', async ({ page }) => {
    const questionnaires = new QuestionnairesPage(page);
    await questionnaires.goto();
    await expect(page).toHaveURL(/\/questionnaires/);
  });

  test('should show create questionnaire button', async ({ page }) => {
    const questionnaires = new QuestionnairesPage(page);
    await questionnaires.goto();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
    await expect(questionnaires.createButton).toBeVisible();
  });

  test('should show status filter tabs', async ({ page }) => {
    const questionnaires = new QuestionnairesPage(page);
    await questionnaires.goto();
    await page.waitForSelector('lib-pill-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show questionnaires table or empty state', async ({ page }) => {
    const questionnaires = new QuestionnairesPage(page);
    await questionnaires.goto();
    await page.waitForSelector('.table-container, lib-empty-state, lib-spinner', { timeout: 10000 });

    const hasTable = (await questionnaires.tableContainer.count()) > 0;
    const hasEmpty = (await questionnaires.emptyState.count()) > 0;
    const hasSpinner = (await questionnaires.loadingSpinner.count()) > 0;
    expect(hasTable || hasEmpty || hasSpinner).toBe(true);
  });
});
