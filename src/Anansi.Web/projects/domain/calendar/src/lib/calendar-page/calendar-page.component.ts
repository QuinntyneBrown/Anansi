import { Component, inject, signal, computed, OnInit } from '@angular/core';
import {
  BookingsService,
  BookingRecordDto,
  BookingStatus,
  PagedList,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
} from 'components';
import { LucideAngularModule } from 'lucide-angular';

export type CalendarViewMode = 'month' | 'week' | 'day';

export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function bookingBadgeVariant(
  status: string,
): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
    case 'Declined':
    case 'NoShow':
      return 'error';
    default:
      return 'neutral';
  }
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: BookingRecordDto[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'lib-calendar-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, BadgeComponent, SpinnerComponent, LucideAngularModule],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="48" />
      </div>
    } @else if (error()) {
      <div class="error-container">
        <p class="error-text">Something went wrong. Please try again.</p>
        <lib-button variant="secondary" (clicked)="loadMonth()">Retry</lib-button>
      </div>
    } @else {
      <div class="calendar-layout">
        <div class="calendar-main">
          <div class="calendar-header">
            <div class="nav-group">
              <button class="nav-btn" (click)="prev()">
                <lucide-icon name="chevron-left" [size]="20"></lucide-icon>
              </button>
              <h2 class="month-title">{{ headerTitle() }}</h2>
              <button class="nav-btn" (click)="next()">
                <lucide-icon name="chevron-right" [size]="20"></lucide-icon>
              </button>
            </div>
            <div class="view-toggle">
              <button
                class="view-pill"
                [class.view-pill--active]="viewMode() === 'month'"
                (click)="setViewMode('month')"
              >Month</button>
              <button
                class="view-pill"
                [class.view-pill--active]="viewMode() === 'week'"
                (click)="setViewMode('week')"
              >Week</button>
              <button
                class="view-pill"
                [class.view-pill--active]="viewMode() === 'day'"
                (click)="setViewMode('day')"
              >Day</button>
            </div>
          </div>

          @switch (viewMode()) {
            @case ('month') {
              <div class="weekday-row">
                @for (day of weekdays; track day) {
                  <div class="weekday-cell">{{ day }}</div>
                }
              </div>

              <div class="calendar-grid">
                @for (day of calendarDays(); track day.date.toISOString()) {
                  <button
                    class="day-cell"
                    [class.other-month]="!day.isCurrentMonth"
                    [class.today]="day.isToday"
                    [class.selected]="isSelected(day)"
                    (click)="selectDay(day)"
                  >
                    <span class="day-number">{{ day.dayOfMonth }}</span>
                    @if (day.bookings.length > 0) {
                      <div class="booking-dots">
                        @for (b of day.bookings.slice(0, 3); track b.id) {
                          <span class="dot" [class.dot-confirmed]="b.status === 'Confirmed'" [class.dot-pending]="b.status === 'Pending'" [class.dot-cancelled]="b.status === 'Cancelled' || b.status === 'Declined' || b.status === 'NoShow'"></span>
                        }
                        @if (day.bookings.length > 3) {
                          <span class="dot-overflow">+{{ day.bookings.length - 3 }}</span>
                        }
                      </div>
                    }
                  </button>
                }
              </div>
            }

            @case ('week') {
              <div class="week-view">
                <div class="week-header-row">
                  <div class="time-gutter-header"></div>
                  @for (day of weekDays(); track day.date.toISOString()) {
                    <div class="week-day-header" [class.today]="day.isToday">
                      <span class="week-day-name">{{ getWeekdayShort(day.date) }}</span>
                      <span class="week-day-number" [class.today-number]="day.isToday">{{ day.date.getDate() }}</span>
                    </div>
                  }
                </div>
                <div class="week-body">
                  @for (hour of weekHours; track hour) {
                    <div class="week-hour-row">
                      <div class="time-gutter">{{ formatHourLabel(hour) }}</div>
                      @for (day of weekDays(); track day.date.toISOString()) {
                        <div class="week-cell">
                          @for (b of getBookingsForHour(day.date, hour); track b.id) {
                            <div class="week-booking-block" [class.block-confirmed]="b.status === 'Confirmed'" [class.block-pending]="b.status === 'Pending'">
                              <span class="block-name">{{ b.clientFirstName }} {{ b.clientLastName }}</span>
                              <span class="block-type">{{ b.sessionTypeName }}</span>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            @case ('day') {
              <div class="day-view">
                <div class="day-view-header">
                  <span class="day-view-title">{{ dayViewTitle() }}</span>
                </div>
                <div class="day-body">
                  @for (hour of dayHours; track hour) {
                    <div class="day-hour-row">
                      <div class="time-gutter">{{ formatHourLabel(hour) }}</div>
                      <div class="day-cell">
                        @for (b of getBookingsForHour(selectedDate(), hour); track b.id) {
                          <div class="day-booking-block" [class.block-confirmed]="b.status === 'Confirmed'" [class.block-pending]="b.status === 'Pending'">
                            <span class="block-name">{{ b.clientFirstName }} {{ b.clientLastName }}</span>
                            <span class="block-meta">{{ b.sessionTypeName }}</span>
                            <span class="block-meta">{{ formatTime(b.startTime) }} - {{ formatTime(b.endTime) }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <div class="day-detail">
          <lib-card>
            <h3 card-header class="detail-title">{{ selectedDayTitle() }}</h3>
            @if (selectedDayBookings().length === 0) {
              <p class="empty-text">No bookings on this day</p>
            }
            @for (booking of selectedDayBookings(); track booking.id) {
              <div class="booking-row">
                <div class="booking-info">
                  <span class="booking-client">{{ booking.clientFirstName }} {{ booking.clientLastName }}</span>
                  <span class="booking-type">{{ booking.sessionTypeName }}</span>
                  <span class="booking-time">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</span>
                </div>
                <lib-badge [variant]="getBadgeVariant(booking.status)">{{ booking.status }}</lib-badge>
              </div>
            }
          </lib-card>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 32px;
      font-family: Inter, sans-serif;
    }
    .loading-container,
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }
    .error-text {
      color: #C94A4A;
      font-size: 14px;
    }
    .calendar-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
    }
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;
    }
    .nav-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav-btn {
      background: none;
      border: 1px solid #3A3A3C;
      color: #F5F5F0;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.15s ease, color 0.15s ease;
    }
    .nav-btn:hover {
      border-color: #C9A962;
      color: #C9A962;
    }
    .view-toggle {
      display: flex;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 3px;
      gap: 2px;
    }
    .view-pill {
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      border: none;
      background: transparent;
      color: #6E6E70;
      padding: 6px 16px;
      border-radius: 9px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .view-pill:hover {
      color: #F5F5F0;
    }
    .view-pill--active {
      background: #C9A962;
      color: #1A1A1C;
    }
    .view-pill--active:hover {
      color: #1A1A1C;
    }
    .month-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
      white-space: nowrap;
    }
    .weekday-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0;
      margin-bottom: 4px;
    }
    .weekday-cell {
      text-align: center;
      font-size: 12px;
      color: #6E6E70;
      padding: 8px 0;
      font-weight: 500;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .day-cell {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 8px 4px 4px;
      background: #242426;
      border: 1px solid #2A2A2C;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.15s;
      min-height: 64px;
    }
    .day-cell:hover {
      border-color: #3A3A3C;
    }
    .day-cell.other-month {
      opacity: 0.35;
    }
    .day-cell.today {
      border-color: #C9A962;
    }
    .day-cell.today .day-number {
      color: #C9A962;
      font-weight: 600;
    }
    .day-cell.selected {
      background: #3A3A3C;
      border-color: #C9A962;
    }
    .day-number {
      font-size: 14px;
      color: #F5F5F0;
      margin-bottom: 4px;
    }
    .booking-dots {
      display: flex;
      gap: 3px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6E6E70;
    }
    .dot-confirmed {
      background: #6E9E6E;
    }
    .dot-pending {
      background: #C9A962;
    }
    .dot-cancelled {
      background: #C94A4A;
    }
    .dot-overflow {
      font-size: 10px;
      color: #6E6E70;
    }
    .detail-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
    }
    .empty-text {
      color: #6E6E70;
      font-size: 14px;
      text-align: center;
      padding: 24px 0;
      margin: 0;
    }
    .booking-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #2A2A2C;
    }
    .booking-row:last-child {
      border-bottom: none;
    }
    .booking-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .booking-client {
      font-size: 14px;
      color: #F5F5F0;
    }
    .booking-type {
      font-size: 12px;
      color: #6E6E70;
    }
    .booking-time {
      font-size: 12px;
      color: #6E6E70;
    }

    /* Week view */
    .week-view {
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      overflow: hidden;
    }
    .week-header-row {
      display: grid;
      grid-template-columns: 64px repeat(7, 1fr);
      border-bottom: 1px solid #3A3A3C;
      background: #242426;
    }
    .time-gutter-header {
      border-right: 1px solid #3A3A3C;
    }
    .week-day-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      border-right: 1px solid #2A2A2C;
      gap: 2px;
    }
    .week-day-header:last-child {
      border-right: none;
    }
    .week-day-header.today {
      background: rgba(201, 169, 98, 0.08);
    }
    .week-day-name {
      font-size: 11px;
      color: #6E6E70;
      text-transform: uppercase;
      font-weight: 500;
    }
    .week-day-number {
      font-size: 16px;
      color: #F5F5F0;
      font-weight: 500;
    }
    .today-number {
      color: #C9A962;
      font-weight: 700;
    }
    .week-body {
      max-height: 520px;
      overflow-y: auto;
    }
    .week-hour-row {
      display: grid;
      grid-template-columns: 64px repeat(7, 1fr);
      min-height: 48px;
      border-bottom: 1px solid #2A2A2C;
    }
    .week-hour-row:last-child {
      border-bottom: none;
    }
    .time-gutter {
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #6E6E70;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 4px;
      border-right: 1px solid #3A3A3C;
      background: #242426;
    }
    .week-cell {
      border-right: 1px solid #2A2A2C;
      padding: 2px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .week-cell:last-child {
      border-right: none;
    }
    .week-booking-block,
    .day-booking-block {
      font-family: Inter, sans-serif;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(110, 158, 110, 0.15);
      border-left: 3px solid #6E9E6E;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .block-confirmed {
      background: rgba(110, 158, 110, 0.15);
      border-left-color: #6E9E6E;
    }
    .block-pending {
      background: rgba(201, 169, 98, 0.15);
      border-left-color: #C9A962;
    }
    .block-name {
      font-size: 11px;
      font-weight: 600;
      color: #F5F5F0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .block-type,
    .block-meta {
      font-size: 10px;
      color: #6E6E70;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Day view */
    .day-view {
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      overflow: hidden;
    }
    .day-view-header {
      background: #242426;
      padding: 12px 16px;
      border-bottom: 1px solid #3A3A3C;
    }
    .day-view-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      color: #F5F5F0;
    }
    .day-body {
      max-height: 560px;
      overflow-y: auto;
    }
    .day-hour-row {
      display: grid;
      grid-template-columns: 64px 1fr;
      min-height: 56px;
      border-bottom: 1px solid #2A2A2C;
    }
    .day-hour-row:last-child {
      border-bottom: none;
    }
    .day-cell {
      padding: 4px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .day-booking-block {
      padding: 8px 10px;
      border-radius: 8px;
      gap: 2px;
    }
  `,
})
export class CalendarPageComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly bookings = signal<BookingRecordDto[]>([]);
  readonly currentYear = signal(new Date().getFullYear());
  readonly currentMonth = signal(new Date().getMonth());
  readonly selectedDate = signal<Date>(new Date());
  readonly viewMode = signal<CalendarViewMode>('month');

  readonly weekdays = WEEKDAY_HEADERS;
  readonly weekHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  readonly dayHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  readonly formatTime = formatTime;

  readonly headerTitle = computed(() => {
    const mode = this.viewMode();
    if (mode === 'month') {
      return `${MONTH_NAMES[this.currentMonth()]} ${this.currentYear()}`;
    }
    if (mode === 'week') {
      const days = this.weekDays();
      if (days.length === 0) return '';
      const start = days[0].date;
      const end = days[6].date;
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${fmt(start)} - ${fmt(end)}, ${end.getFullYear()}`;
    }
    const sel = this.selectedDate();
    return sel.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  readonly monthTitle = computed(() => {
    return `${MONTH_NAMES[this.currentMonth()]} ${this.currentYear()}`;
  });

  readonly weekDays = computed<CalendarDay[]>(() => {
    const sel = this.selectedDate();
    const today = new Date();
    const bookings = this.bookings();
    const startOfWeek = new Date(sel);
    startOfWeek.setDate(sel.getDate() - sel.getDay());
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentMonth(),
        isToday: isSameDay(date, today),
        bookings: this.getBookingsForDate(date, bookings),
      });
    }
    return days;
  });

  readonly dayViewTitle = computed(() => {
    const sel = this.selectedDate();
    return sel.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const today = new Date();
    const bookings = this.bookings();

    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month's trailing days
    if (startOffset > 0) {
      const prevMonthDays = new Date(year, month, 0).getDate();
      for (let i = startOffset - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const date = new Date(year, month - 1, dayNum);
        days.push({
          date,
          dayOfMonth: dayNum,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          bookings: this.getBookingsForDate(date, bookings),
        });
      }
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        dayOfMonth: d,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        bookings: this.getBookingsForDate(date, bookings),
      });
    }

    // Next month's leading days to fill the grid (always 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({
        date,
        dayOfMonth: d,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        bookings: this.getBookingsForDate(date, bookings),
      });
    }

    return days;
  });

  readonly selectedDayBookings = computed(() => {
    const sel = this.selectedDate();
    const bookings = this.bookings();
    return this.getBookingsForDate(sel, bookings);
  });

  readonly selectedDayTitle = computed(() => {
    const sel = this.selectedDate();
    return sel.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  });

  ngOnInit(): void {
    this.loadMonth();
  }

  loadMonth(): void {
    this.loading.set(true);
    this.error.set(false);

    const year = this.currentYear();
    const month = this.currentMonth();
    const from = toISODate(getMonthStart(year, month));
    const to = toISODate(getMonthEnd(year, month));

    this.bookingsService
      .list({ from, to, pageSize: 200 })
      .subscribe({
        next: (result: PagedList<BookingRecordDto>) => {
          this.bookings.set(result.items);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }

  setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }

  prev(): void {
    const mode = this.viewMode();
    if (mode === 'month') {
      this.prevMonth();
    } else if (mode === 'week') {
      const sel = this.selectedDate();
      const d = new Date(sel);
      d.setDate(d.getDate() - 7);
      this.selectedDate.set(d);
      this.currentMonth.set(d.getMonth());
      this.currentYear.set(d.getFullYear());
      this.loadMonth();
    } else {
      const sel = this.selectedDate();
      const d = new Date(sel);
      d.setDate(d.getDate() - 1);
      this.selectedDate.set(d);
      this.currentMonth.set(d.getMonth());
      this.currentYear.set(d.getFullYear());
      this.loadMonth();
    }
  }

  next(): void {
    const mode = this.viewMode();
    if (mode === 'month') {
      this.nextMonth();
    } else if (mode === 'week') {
      const sel = this.selectedDate();
      const d = new Date(sel);
      d.setDate(d.getDate() + 7);
      this.selectedDate.set(d);
      this.currentMonth.set(d.getMonth());
      this.currentYear.set(d.getFullYear());
      this.loadMonth();
    } else {
      const sel = this.selectedDate();
      const d = new Date(sel);
      d.setDate(d.getDate() + 1);
      this.selectedDate.set(d);
      this.currentMonth.set(d.getMonth());
      this.currentYear.set(d.getFullYear());
      this.loadMonth();
    }
  }

  prevMonth(): void {
    let month = this.currentMonth();
    let year = this.currentYear();
    if (month === 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
    this.currentMonth.set(month);
    this.currentYear.set(year);
    this.loadMonth();
  }

  nextMonth(): void {
    let month = this.currentMonth();
    let year = this.currentYear();
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
    this.currentMonth.set(month);
    this.currentYear.set(year);
    this.loadMonth();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
  }

  isSelected(day: CalendarDay): boolean {
    return isSameDay(day.date, this.selectedDate());
  }

  getBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    return bookingBadgeVariant(status);
  }

  getWeekdayShort(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  formatHourLabel(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  getBookingsForHour(date: Date, hour: number): BookingRecordDto[] {
    return this.bookings().filter((b) => {
      const start = new Date(b.startTime);
      return isSameDay(start, date) && start.getHours() === hour;
    });
  }

  private getBookingsForDate(date: Date, bookings: BookingRecordDto[]): BookingRecordDto[] {
    return bookings.filter((b) => {
      const start = new Date(b.startTime);
      return isSameDay(start, date);
    });
  }
}
