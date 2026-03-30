import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class NotificationSettingsPage extends AppPage {
  readonly pageHeading: Locator;
  readonly prefsGrid: Locator;
  readonly prefsRows: Locator;
  readonly toggles: Locator;
  readonly digestSelects: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('.page__title');
    this.prefsGrid = page.locator('.prefs');
    this.prefsRows = page.locator('.prefs__row');
    this.toggles = page.locator('lib-toggle');
    this.digestSelects = page.locator('.prefs__digest-select');
    this.saveButton = page.locator('lib-button', { hasText: 'Save Preferences' });
    this.successMessage = page.locator('.page__success');
    this.errorMessage = page.locator('.page__error');
    this.loadingSpinner = page.locator('lib-spinner');
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings/notifications');
  }

  async getPrefsRowCount(): Promise<number> {
    return this.prefsRows.count();
  }

  async getToggleCount(): Promise<number> {
    return this.toggles.count();
  }
}
