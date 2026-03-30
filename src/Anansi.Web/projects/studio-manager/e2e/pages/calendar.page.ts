import { Page, Locator } from '@playwright/test';
import { AppPage } from './app.page';

export class CalendarPage extends AppPage {
  readonly calendarLayout: Locator;
  readonly monthTitle: Locator;
  readonly weekdayRow: Locator;
  readonly calendarGrid: Locator;
  readonly dayCells: Locator;
  readonly todayCell: Locator;
  readonly selectedCell: Locator;
  readonly dayDetail: Locator;
  readonly detailTitle: Locator;
  readonly bookingRows: Locator;
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly loadingSpinner: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    super(page);
    this.calendarLayout = page.locator('.calendar-layout');
    this.monthTitle = page.locator('.month-title');
    this.weekdayRow = page.locator('.weekday-row');
    this.calendarGrid = page.locator('.calendar-grid');
    this.dayCells = page.locator('.day-cell');
    this.todayCell = page.locator('.day-cell.today');
    this.selectedCell = page.locator('.day-cell.selected');
    this.dayDetail = page.locator('.day-detail');
    this.detailTitle = page.locator('.detail-title');
    this.bookingRows = page.locator('.booking-row');
    this.prevMonthButton = page.locator('lib-button').first();
    this.nextMonthButton = page.locator('lib-button').nth(1);
    this.loadingSpinner = page.locator('lib-spinner');
    this.errorText = page.locator('.error-text');
  }

  async goto(): Promise<void> {
    await this.page.goto('/calendar');
  }

  async getMonthTitle(): Promise<string> {
    return (await this.monthTitle.textContent()) ?? '';
  }

  async getDayCellCount(): Promise<number> {
    return this.dayCells.count();
  }

  async clickDay(index: number): Promise<void> {
    await this.dayCells.nth(index).click();
  }

  async getBookingRowCount(): Promise<number> {
    return this.bookingRows.count();
  }
}
