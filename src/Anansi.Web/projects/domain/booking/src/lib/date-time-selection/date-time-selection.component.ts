import { Component, computed, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { SessionTypeDto } from 'api';

export interface DateTimeSelection {
  date: string;
  time: string;
}

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  iso: string;
}

@Component({
  selector: 'lib-date-time-selection',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="date-time-page">
      <div class="header">
        <button class="back-button" (click)="onBack()">
          <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          <span>Back</span>
        </button>
        <h1 class="title">Select Date & Time</h1>
      </div>

      <div class="main-content">
        <!-- Calendar Column -->
        <div class="calendar-column">
          <div class="calendar-header">
            <button class="nav-button" (click)="previousMonth()" aria-label="Previous month">
              <lucide-icon name="chevron-left" [size]="20"></lucide-icon>
            </button>
            <span class="month-year">{{ monthYearLabel() }}</span>
            <button class="nav-button" (click)="nextMonth()" aria-label="Next month">
              <lucide-icon name="chevron-right" [size]="20"></lucide-icon>
            </button>
          </div>

          <div class="weekday-row">
            @for (day of weekdays; track day) {
              <span class="weekday">{{ day }}</span>
            }
          </div>

          <div class="calendar-grid">
            @for (day of calendarDays(); track day.iso) {
              <button
                class="day-cell"
                [class.other-month]="!day.isCurrentMonth"
                [class.today]="isToday(day)"
                [class.selected]="isSelectedDate(day)"
                [class.unavailable]="!isAvailable(day)"
                [disabled]="!day.isCurrentMonth || !isAvailable(day)"
                (click)="selectDate(day)"
              >
                {{ day.date }}
              </button>
            }
          </div>
        </div>

        <!-- Time Slots Column -->
        <div class="time-column">
          <h3 class="time-title">Available Times</h3>

          @if (selectedDate()) {
            <div class="time-slots">
              @for (slot of availableTimeSlots(); track slot) {
                <button
                  class="time-slot"
                  [class.time-slot--selected]="selectedTime() === slot"
                  (click)="selectTime(slot)"
                >
                  {{ slot }}
                </button>
              } @empty {
                <p class="no-slots">No time slots available for this date.</p>
              }
            </div>
          } @else {
            <p class="no-slots">Select a date to see available times.</p>
          }

          @if (sessionType()) {
            <div class="session-info-card">
              <div class="session-info-row">
                <span class="session-info-label">Session</span>
                <span class="session-info-value">{{ sessionType()!.name }}</span>
              </div>
              <div class="session-info-row">
                <span class="session-info-label">Duration</span>
                <span class="session-info-value">{{ formatDuration(sessionType()!.durationMinutes) }}</span>
              </div>
              <div class="session-info-row">
                <span class="session-info-label">Price</span>
                <span class="session-info-value session-info-price">{{ formatPrice(sessionType()!.priceCents) }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .date-time-page {
      background: #1A1A1C;
      min-height: 700px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 32px;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px 12px;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .back-button:hover {
      border-color: #C9A962;
    }

    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .main-content {
      display: flex;
      gap: 40px;
      padding: 0 32px;
    }

    .calendar-column {
      flex: 1;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .nav-button {
      width: 32px;
      height: 32px;
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      cursor: pointer;
      color: #F5F5F0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.15s ease;
    }

    .nav-button:hover {
      border-color: #C9A962;
    }

    .nav-button:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }

    .month-year {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .weekday-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      margin-bottom: 4px;
    }

    .weekday {
      text-align: center;
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #6E6E70;
      padding: 4px 0;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }

    .day-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 2px solid transparent;
      border-radius: 8px;
      background: none;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .day-cell:hover:not(:disabled):not(.selected) {
      background: rgba(201, 169, 98, 0.1);
    }

    .day-cell:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }

    .day-cell.other-month {
      color: #3A3A3C;
    }

    .day-cell.today {
      border-color: #3A3A3C;
    }

    .day-cell.selected {
      background: #C9A962;
      color: #1A1A1C;
      font-weight: 600;
    }

    .day-cell.unavailable {
      color: #3A3A3C;
      cursor: not-allowed;
    }

    .time-column {
      width: 340px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .time-title {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0;
    }

    .time-slots {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 340px;
      overflow-y: auto;
    }

    .time-slot {
      padding: 12px 16px;
      border: 1px solid #3A3A3C;
      border-radius: 10px;
      background: none;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      text-align: left;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .time-slot:hover:not(.time-slot--selected) {
      border-color: #C9A962;
    }

    .time-slot--selected {
      background: #C9A962;
      color: #1A1A1C;
      border-color: #C9A962;
      font-weight: 600;
    }

    .time-slot:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }

    .no-slots {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0;
    }

    .session-info-card {
      background: #242426;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: auto;
    }

    .session-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .session-info-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .session-info-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      font-weight: 500;
    }

    .session-info-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      color: #C9A962;
    }

    @media (max-width: 480px) {
      .main-content {
        flex-direction: column;
        padding: 0 20px;
      }

      .time-column {
        width: 100%;
      }
    }
  `,
})
export class DateTimeSelectionComponent {
  readonly sessionType = input<SessionTypeDto | null>(null);
  readonly availableDates = input<string[]>([]);
  readonly availableTimeSlots = input<string[]>([]);
  readonly dateTimeSelected = output<DateTimeSelection>();
  readonly backClicked = output<void>();

  readonly selectedDate = signal<string | null>(null);
  readonly selectedTime = signal<string | null>(null);

  readonly currentMonth = signal(new Date().getMonth());
  readonly currentYear = signal(new Date().getFullYear());

  readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  readonly monthYearLabel = computed(() => {
    return `${this.monthNames[this.currentMonth()]} ${this.currentYear()}`;
  });

  readonly calendarDays = computed((): CalendarDay[] => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        date: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        iso: this.toIso(prevYear, prevMonth, d),
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: d,
        month,
        year,
        isCurrentMonth: true,
        iso: this.toIso(year, month, d),
      });
    }

    const remaining = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        iso: this.toIso(nextYear, nextMonth, d),
      });
    }

    return days;
  });

  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  selectDate(day: CalendarDay): void {
    if (day.isCurrentMonth && this.isAvailable(day)) {
      this.selectedDate.set(day.iso);
      this.selectedTime.set(null);
    }
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
    const date = this.selectedDate();
    if (date) {
      this.dateTimeSelected.emit({ date, time });
    }
  }

  onBack(): void {
    this.backClicked.emit();
  }

  isToday(day: CalendarDay): boolean {
    const today = new Date();
    return (
      day.date === today.getDate() &&
      day.month === today.getMonth() &&
      day.year === today.getFullYear()
    );
  }

  isSelectedDate(day: CalendarDay): boolean {
    return day.iso === this.selectedDate();
  }

  isAvailable(day: CalendarDay): boolean {
    const dates = this.availableDates();
    if (dates.length === 0) return true;
    return dates.includes(day.iso);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  private toIso(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
}
