import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class InboxPage extends AppPage {
  readonly inboxSidebar: Locator;
  readonly conversationList: Locator;
  readonly conversationItems: Locator;
  readonly threadHeader: Locator;
  readonly messages: Locator;
  readonly composeArea: Locator;
  readonly sendButton: Locator;
  readonly noSelectionState: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.inboxSidebar = page.locator('.inbox__sidebar');
    this.conversationList = page.locator('.inbox__conversation-list');
    this.conversationItems = page.locator('.inbox__conversation-item');
    this.threadHeader = page.locator('.inbox__thread-header');
    this.messages = page.locator('.inbox__message');
    this.composeArea = page.locator('.inbox__compose');
    this.sendButton = page.locator('lib-button', { hasText: 'Send' });
    this.noSelectionState = page.locator('.inbox__no-selection');
    this.loadingSpinner = page.locator('lib-spinner');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inbox');
  }

  async selectConversation(index: number): Promise<void> {
    await this.conversationItems.nth(index).click();
  }

  async getConversationCount(): Promise<number> {
    return this.conversationItems.count();
  }

  async getMessageCount(): Promise<number> {
    return this.messages.count();
  }
}
