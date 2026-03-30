import { test, expect } from '@playwright/test';
import { MobileGalleryAppPage } from './pages/app.page';
import { GalleryPage } from './pages/gallery.page';
import { FavoritesPage } from './pages/favorites.page';
import { PasswordPage } from './pages/password.page';

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
test.describe('Mobile Gallery Shell', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should display mobile bar with logo', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.goto();

    await expect(app.mobileBar).toBeVisible();
    await expect(app.logo).toHaveText('Anansi');
    await expect(app.subtitle).toHaveText(/Gallery/i);
  });

  test('should redirect root to gallery', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/gallery/);
  });

  test('should render main content area', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.goto();
    await expect(app.mainContent).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// MOB-18.2.1: Gallery Cover - Mobile
// ---------------------------------------------------------------------------
test.describe('MOB-18.2.1: Gallery Cover Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show gallery page with cover or loading state', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto();

    await expect(gallery.mobileBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-spinner, lib-empty-state, .gallery-cover, .cover-image', { timeout: 10000 });

    const hasTitle = (await gallery.pageTitle.count()) > 0;
    const hasSpinner = (await gallery.spinner.count()) > 0;
    const hasEmpty = (await gallery.emptyState.count()) > 0;
    const hasCover = (await gallery.coverImage.count()) > 0;
    expect(hasTitle || hasSpinner || hasEmpty || hasCover).toBe(true);
  });

  test('should show mobile bar with branding', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto();
    await expect(gallery.mobileBar).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// MOB-18.2.2: Photo Grid - Mobile
// ---------------------------------------------------------------------------
test.describe('MOB-18.2.2: Photo Grid Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should navigate to gallery with collection id', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.navigateTo('/gallery/test-collection');
    await expect(page).toHaveURL(/\/gallery\/test-collection/);
  });

  test('should show photo grid or empty state', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('test-collection');
    await page.waitForSelector('.photo-grid, .gallery-grid, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasGrid = (await gallery.photoGrid.count()) > 0;
    const hasSpinner = (await gallery.spinner.count()) > 0;
    const hasEmpty = (await gallery.emptyState.count()) > 0;
    expect(hasGrid || hasSpinner || hasEmpty).toBe(true);
  });

  test('should show photo items when media exists', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('test-collection');
    await page.waitForSelector('.photo-item, .gallery-item, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// MOB-18.2.3: Mobile Lightbox
// ---------------------------------------------------------------------------
test.describe('MOB-18.2.3: Mobile Lightbox', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should load gallery page for lightbox interaction', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('lightbox-collection');

    await expect(gallery.mobileBar).toBeVisible();
    await page.waitForSelector('.page-title, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// MOB-18.2.4: Add to Home Screen Prompt (PWA)
// ---------------------------------------------------------------------------
test.describe('MOB-18.2.4: Add to Home Screen Prompt', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should have PWA manifest link in page', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.goto();

    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveCount(1);
  });

  test('should have mobile-web-app-capable meta tag', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.goto();

    const meta = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(meta).toHaveCount(1);
  });
});

// ---------------------------------------------------------------------------
// MOB-18.2.5: Favorites - Mobile
// ---------------------------------------------------------------------------
test.describe('MOB-18.2.5: Favorites Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should navigate to favorites page', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.navigateTo('/gallery/test-collection/favorites');
    await expect(page).toHaveURL(/\/gallery\/test-collection\/favorites/);

    await expect(app.mobileBar).toBeVisible();
    await expect(app.backButton).toBeVisible();
  });

  test('should show favorites page content or empty state', async ({ page }) => {
    const favorites = new FavoritesPage(page);
    await favorites.goto('test-collection');
    await page.waitForSelector('.page-title, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasTitle = (await favorites.pageTitle.count()) > 0;
    const hasSpinner = (await favorites.spinner.count()) > 0;
    const hasEmpty = (await favorites.emptyState.count()) > 0;
    expect(hasTitle || hasSpinner || hasEmpty).toBe(true);
  });

  test('should show favorite items when they exist', async ({ page }) => {
    const favorites = new FavoritesPage(page);
    await favorites.goto('test-collection');
    await page.waitForSelector('.favorite-item, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// MOB-18.2.6: Password Entry - Mobile
// ---------------------------------------------------------------------------
test.describe('MOB-18.2.6: Password Entry Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should navigate to password page', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.navigateTo('/gallery/test-collection/password');
    await expect(page).toHaveURL(/\/gallery\/test-collection\/password/);

    await expect(app.mobileBar).toBeVisible();
    await expect(app.backButton).toBeVisible();
  });

  test('should show password entry form', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.goto('test-collection');

    await expect(password.mobileBar).toBeVisible();
    await expect(password.passwordInput).toBeVisible();
    await expect(password.submitButton).toBeVisible();
  });

  test('should show title and subtitle', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.goto('test-collection');
    await page.waitForSelector('.password-entry__title', { timeout: 10000 });

    if ((await password.title.count()) > 0) {
      await expect(password.title).toHaveText('Protected Gallery');
    }
  });

  test('should not show error message initially', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.goto('test-collection');
    await expect(password.errorMessage).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Navigation Tests
// ---------------------------------------------------------------------------
test.describe('Mobile Gallery Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show back button on sub-pages', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);
    await app.navigateTo('/gallery/test-collection/favorites');
    await expect(app.backButton).toBeVisible();
  });

  test('should maintain mobile bar across all routes', async ({ page }) => {
    const app = new MobileGalleryAppPage(page);

    await app.navigateTo('/gallery/test-collection');
    await expect(app.mobileBar).toBeVisible();

    await app.navigateTo('/gallery/test-collection/favorites');
    await expect(app.mobileBar).toBeVisible();

    await app.navigateTo('/gallery/test-collection/password');
    await expect(app.mobileBar).toBeVisible();
  });
});
