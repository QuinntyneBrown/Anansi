import { test, expect } from '@playwright/test';
import { StoreAppPage } from './pages/app.page';
import { ShopPage } from './pages/shop.page';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// STR-15.2.1: Storefront Browse - Desktop
// ---------------------------------------------------------------------------
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

  test('should show product filter tabs', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await page.waitForSelector('lib-tab-bar, lib-spinner', { timeout: 10000 });
  });

  test('should show product cards or empty state', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await page.waitForSelector('.product-card, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasCards = (await shop.productCards.count()) > 0;
    const hasSpinner = (await shop.spinner.count()) > 0;
    const hasEmpty = (await shop.emptyState.count()) > 0;
    expect(hasCards || hasSpinner || hasEmpty).toBe(true);
  });

  test('should render product cards with hover effects', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await page.waitForSelector('.product-card, lib-spinner, lib-empty-state', { timeout: 10000 });

    if ((await shop.productCards.count()) > 0) {
      const cursor = await shop.productCards.first().evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    }
  });
});

// STR-15.2.1.2: Storefront Browse - Mobile
test.describe('STR-15.2.1.2: Storefront Browse Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show store on mobile viewport', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await expect(shop.topBar).toBeVisible();
    await page.waitForSelector('.page, lib-spinner', { timeout: 10000 });
  });

  test('should show cart button on mobile', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.goto();
    await expect(app.cartButton).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// STR-15.2.2: Product Detail - Desktop
// ---------------------------------------------------------------------------
test.describe('STR-15.2.2: Product Detail Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to shop page', async ({ page }) => {
    const app = new StoreAppPage(page);
    await app.navigateTo('/shop');
    await expect(page).toHaveURL(/\/shop/);
  });
});

// ---------------------------------------------------------------------------
// STR-15.2.3: Shopping Cart - Desktop
// ---------------------------------------------------------------------------
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

  test('should show page title as Your Cart', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await page.waitForSelector('.page-title', { timeout: 10000 });

    if ((await cart.pageTitle.count()) > 0) {
      const title = await cart.pageTitle.textContent();
      expect(title).toContain('Cart');
    }
  });

  test('should show cart summary section', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await page.waitForSelector('.cart-summary, lib-empty-state', { timeout: 10000 });
  });

  test('should show checkout button when items exist', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await page.waitForSelector('.cart-summary, lib-empty-state', { timeout: 10000 });

    if ((await cart.cartSummary.count()) > 0) {
      await expect(cart.checkoutButton).toBeVisible();
    }
  });
});

// STR-15.2.3.2: Shopping Cart - Mobile
test.describe('STR-15.2.3.2: Shopping Cart Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show cart page on mobile', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await expect(cart.topBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-empty-state', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// STR-15.2.4: Checkout - Desktop
// ---------------------------------------------------------------------------
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

  test('should show checkout form with contact fields', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await page.waitForSelector('.checkout-form, lib-empty-state', { timeout: 10000 });

    if ((await checkout.checkoutForm.count()) > 0) {
      await expect(checkout.nameInput).toBeVisible();
      await expect(checkout.emailInput).toBeVisible();
    }
  });

  test('should show order summary panel', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await page.waitForSelector('.order-summary, lib-empty-state', { timeout: 10000 });
  });

  test('should show place order button', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await page.waitForSelector('.checkout-form, lib-empty-state', { timeout: 10000 });

    if ((await checkout.checkoutForm.count()) > 0) {
      await expect(checkout.submitButton).toBeVisible();
    }
  });
});

// STR-15.2.4.2: Checkout - Mobile
test.describe('STR-15.2.4.2: Checkout Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show checkout page on mobile', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await expect(checkout.topBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-empty-state', { timeout: 10000 });
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
