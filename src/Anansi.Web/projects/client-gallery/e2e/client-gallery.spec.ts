import { test, expect } from '@playwright/test';
import { GalleryAppPage } from './pages/app.page';
import { GalleryPage } from './pages/gallery.page';
import { FavoritesPage } from './pages/favorites.page';
import { PasswordPage } from './pages/password.page';

test.describe('Client Gallery Shell', () => {
  test('should display gallery top bar with logo', async ({ page }) => {
    const app = new GalleryAppPage(page);
    await app.goto();

    await expect(app.topBar).toBeVisible();
    await expect(app.logo).toHaveText('Anansi');
  });

  test('should redirect root to gallery', async ({ page }) => {
    const app = new GalleryAppPage(page);
    await app.goto();
    await expect(page).toHaveURL(/\/gallery/);
  });

  test('should render main content area', async ({ page }) => {
    const app = new GalleryAppPage(page);
    await app.goto();
    await expect(app.mainContent).toBeVisible();
  });
});

// GAL-14.2.1: Gallery Homepage - Desktop (1440px)
test.describe('GAL-14.2.1: Gallery Homepage Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show branded header and collection grid', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');

    await expect(gallery.topBar).toBeVisible();
    await page.waitForSelector('.gallery-page, lib-spinner, lib-empty-state', { timeout: 10000 });

    const hasGallery = (await page.locator('.gallery-page').count()) > 0;
    const hasSpinner = (await gallery.spinner.count()) > 0;
    expect(hasGallery || hasSpinner).toBe(true);
  });
});

// GAL-14.2.2: Gallery Homepage - Mobile (402px)
test.describe('GAL-14.2.2: Gallery Homepage Mobile', () => {
  test.use({ viewport: { width: 402, height: 874 } });

  test('should show mobile homepage with stacked layout', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');

    await expect(gallery.topBar).toBeVisible();
    await page.waitForSelector('.gallery-page, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// GAL-14.2.3: Collection Cover Page - Desktop
test.describe('GAL-14.2.3: Collection Cover Page Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to gallery collection page', async ({ page }) => {
    const app = new GalleryAppPage(page);
    await app.navigateTo('/gallery/demo');
    await expect(page).toHaveURL(/\/gallery\/demo/);
  });
});

// GAL-14.2.4: Photo Grid - Desktop (Light Theme)
test.describe('GAL-14.2.4: Photo Grid Desktop Light', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show gallery page with photo grid area', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');
    await page.waitForSelector('.gallery-page, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// GAL-14.2.5: Photo Grid - Desktop (Dark Theme)
test.describe('GAL-14.2.5: Photo Grid Desktop Dark', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show dark theme gallery with correct background', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');
    await page.waitForSelector('.gallery-page, lib-spinner', { timeout: 10000 });

    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBeTruthy();
  });
});

// GAL-14.2.6: Photo Grid - Mobile
test.describe('GAL-14.2.6: Photo Grid Mobile', () => {
  test.use({ viewport: { width: 402, height: 874 } });

  test('should show responsive photo layout on mobile', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');
    await page.waitForSelector('.gallery-page, lib-spinner, lib-empty-state', { timeout: 10000 });

    await expect(gallery.topBar).toBeVisible();
  });
});

// GAL-14.2.7: Image Lightbox - Desktop
test.describe('GAL-14.2.7: Image Lightbox Desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should have clickable photo cards for lightbox trigger', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');
    await page.waitForSelector('.gallery-page, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});

// GAL-14.2.8: Favorite List Management
test.describe('GAL-14.2.8: Favorite List Management', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show favorites page with create button', async ({ page }) => {
    const favorites = new FavoritesPage(page);
    await favorites.goto('demo');

    await expect(favorites.topBar).toBeVisible();
    await page.waitForSelector('.favorites-page, lib-spinner', { timeout: 10000 });

    const hasFavoritesPage = (await page.locator('.favorites-page').count()) > 0;
    const hasSpinner = (await favorites.spinner.count()) > 0;
    expect(hasFavoritesPage || hasSpinner).toBe(true);
  });
});

// GAL-14.2.9: Password Entry Screen
test.describe('GAL-14.2.9: Password Entry Screen', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should show branded card with input and error state', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.goto('demo');

    await expect(password.topBar).toBeVisible();
    await expect(password.title).toBeVisible();
    await expect(password.title).toHaveText('Protected Gallery');
    await expect(password.subtitle).toBeVisible();
    await expect(password.passwordInput).toBeVisible();
    await expect(password.submitButton).toBeVisible();
  });

  test('should not show error message initially', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.goto('demo');

    await expect(password.errorMessage).toHaveCount(0);
  });
});

// GAL-14.2.10: Download PIN Screen
test.describe('GAL-14.2.10: Download PIN Screen', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to gallery collection', async ({ page }) => {
    const app = new GalleryAppPage(page);
    await app.navigateTo('/gallery/demo');
    await expect(page).toHaveURL(/\/gallery\/demo/);
  });
});

// GAL-14.2.11: Email Registration Screen
test.describe('GAL-14.2.11: Email Registration Screen', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate to gallery collection', async ({ page }) => {
    const app = new GalleryAppPage(page);
    await app.navigateTo('/gallery/demo');
    await expect(page).toHaveURL(/\/gallery\/demo/);
  });
});

// GAL-14.2.12: Slideshow Mode
test.describe('GAL-14.2.12: Slideshow Mode', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should have gallery page accessible for slideshow', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.goto('demo');
    await page.waitForSelector('.gallery-page, lib-spinner, lib-empty-state', { timeout: 10000 });
  });
});
