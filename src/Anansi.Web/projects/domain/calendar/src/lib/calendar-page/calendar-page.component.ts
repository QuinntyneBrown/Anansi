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
  imports: [CardComponent, ButtonComponent, BadgeComponent, SpinnerComponent],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="48" />
      </div>
    } @else if (error()) {
      <div class="error-container">
        <p class="error-text">Something went wrong. Please try again.</p>
      </div>
    } @else {
      <div class="calendar-layout">
        <div class="calendar-main">
          <div class="calendar-header">
            <lib-button variant="ghost" (clicked)="prevMonth()">&#8249;</lib-button>
            <h2 class="month-title">{{ monthTitle() }}</h2>
            <lib-button variant="ghost" (clicked)="nextMonth()">&#8250;</lib-button>
          </div>

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
    }
    .month-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
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

  readonly weekdays = WEEKDAY_HEADERS;
  readonly formatTime = formatTime;

  readonly monthTitle = computed(() => {
    return `${MONTH_NAMES[this.currentMonth()]} ${this.currentYear()}`;
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

  private getBookingsForDate(date: Date, bookings: BookingRecordDto[]): BookingRecordDto[] {
    return bookings.filter((b) => {
      const start = new Date(b.startTime);
      return isSameDay(start, date);
    });
  }
}
