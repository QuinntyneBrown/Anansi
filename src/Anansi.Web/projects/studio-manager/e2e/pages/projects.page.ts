import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class ProjectsPage extends AppPage {
  readonly board: Locator;
  readonly columns: Locator;
  readonly projectCards: Locator;
  readonly addStageButton: Locator;
  readonly addProjectButton: Locator;
  readonly inlineForm: Locator;
  readonly formInput: Locator;
  readonly formSelect: Locator;
  readonly loadingSpinner: Locator;
  readonly errorText: Locator;
  readonly emptyBoard: Locator;

  constructor(page: Page) {
    super(page);
    this.board = page.locator('.board');
    this.columns = page.locator('.column');
    this.projectCards = page.locator('.project-card');
    this.addStageButton = page.locator('lib-button', { hasText: 'Add Stage' });
    this.addProjectButton = page.locator('lib-button', { hasText: 'Add Project' });
    this.inlineForm = page.locator('.inline-form');
    this.formInput = page.locator('.form-input');
    this.formSelect = page.locator('.form-select');
    this.loadingSpinner = page.locator('lib-spinner');
    this.errorText = page.locator('.error-text');
    this.emptyBoard = page.locator('.empty-board');
  }

  async goto(): Promise<void> {
    await this.page.goto('/projects');
  }

  async getColumnCount(): Promise<number> {
    return this.columns.count();
  }

  async getProjectCardCount(): Promise<number> {
    return this.projectCards.count();
  }

  async getColumnTitle(index: number): Promise<string> {
    return (await this.columns.nth(index).locator('.column-title').textContent()) ?? '';
  }

  async getColumnCardCount(index: number): Promise<string> {
    return (await this.columns.nth(index).locator('.column-count').textContent()) ?? '';
  }
}
