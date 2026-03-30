import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class AccountSettingsPage extends AppPage {
  readonly pageHeading: Locator;
  readonly form: Locator;
  readonly formInputs: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly storageBar: Locator;
  readonly storageText: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly confirmDialog: Locator;
  readonly loadingSpinner: Locator;
  readonly dangerZone: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('.page__title');
    this.form = page.locator('.form');
    this.formInputs = page.locator('lib-input-group');
    this.saveButton = page.locator('lib-button', { hasText: 'Save Changes' });
    this.deleteButton = page.locator('lib-button', { hasText: 'Delete Account' });
    this.storageBar = page.locator('.storage__bar-container');
    this.storageText = page.locator('.storage__text');
    this.successMessage = page.locator('.page__success');
    this.errorMessage = page.locator('.page__error');
    this.confirmDialog = page.locator('lib-confirm-dialog');
    this.loadingSpinner = page.locator('lib-spinner');
    this.dangerZone = page.locator('.section__title--danger');
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }

  async getFormInputCount(): Promise<number> {
    return this.formInputs.count();
  }
}
