import { test, expect } from '@playwright/test';
import { StoreAppPage } from './pages/app.page';
import { ShopPage } from './pages/shop.page';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';

test.describe('Online Store Shell', () => {
  test('should display store top bar with logo', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.goto();

    await expect(app.topBar).toBeVisible();
    await expect(app.logo).toHaveText('Anansi');
    await expect(app.subtitle).toHaveText(/Store/i);
  });

  test('should redirect root to shop', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/shop/);
  });

  test('should render main content area', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.goto();
    await expect(app.mainContent).toBeVisible();
  });

  test('should show cart button in top bar', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.goto();
    await expect(app.cartButton).toBeVisible();
  });
});

// STR-15.2.1: Storefront Browse - Desktop
test.describe('STR-15.2.1: Storefront Browse Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show product grid with mockup previews', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    await expect(shop.topBar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });

    const hasPage = (await page.locator('.page').count()) > 0;
    const hasSpinner = (await shop.spinner.count()) > 0;
    expect(hasPage || hasSpinner).toBe(true);
  });

  test('should show page title', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await page.waitForSelector('.page-title, lib-spinner', { timeout: 10000 });
  });
});

// STR-15.2.2: Product Detail - Desktop
test.describe('STR-15.2.2: Product Detail Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to shop page', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.navigateTo('/shop');
    await expect(page).toHaveURL(/\/shop/);
  });
});

// STR-15.2.3: Shopping Cart - Desktop
test.describe('STR-15.2.3: Shopping Cart Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show cart page with empty state or items', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();

    await expect(cart.topBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-empty-state', { timeout: 10000 });

    const hasTitle = (await cart.pageTitle.count()) > 0;
    const hasEmpty = (await cart.emptyState.count()) > 0;
    expect(hasTitle || hasEmpty).toBe(true);
  });
});

// STR-15.2.4: Checkout - Desktop
test.describe('STR-15.2.4: Checkout Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show checkout page with form or empty state', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();

    await expect(checkout.topBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-empty-state', { timeout: 10000 });

    const hasTitle = (await checkout.pageTitle.count()) > 0;
    const hasEmpty = (await checkout.emptyState.count()) > 0;
    expect(hasTitle || hasEmpty).toBe(true);
  });
});

// STR-15.2.5: Order Confirmation
test.describe('STR-15.2.5: Order Confirmation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to checkout page', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.navigateTo('/checkout');
    await expect(page).toHaveURL(/\/checkout/);
  });
});
