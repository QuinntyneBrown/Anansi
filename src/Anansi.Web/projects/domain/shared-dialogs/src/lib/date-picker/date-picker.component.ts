import { Component, computed, input, output, signal } from '@angular/core';

export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  iso: string;
}

@Component({
  selector: 'lib-date-picker',
  standalone: true,
  imports: [],
  template: `
    <div class="date-picker">
      <div class="header">
        <button class="nav-button" (click)="previousMonth()" aria-label="Previous month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="month-year">{{ monthYearLabel() }}</span>
        <button class="nav-button" (click)="nextMonth()" aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
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
            [class.selected]="isSelected(day)"
            [class.disabled]="isDisabled(day)"
            [disabled]="isDisabled(day)"
            (click)="selectDay(day)"
          >
            {{ day.date }}
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .date-picker {
      background: #242426;
      border-radius: 20px;
      padding: 20px;
      width: 320px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .nav-button {
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 6px;
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
      font-size: 18px;
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
      color: #6E6E70;
    }

    .day-cell.today {
      border-color: #C9A962;
    }

    .day-cell.selected {
      background: #C9A962;
      color: #1A1A1C;
      font-weight: 600;
    }

    .day-cell.disabled {
      color: #3A3A3C;
      cursor: not-allowed;
    }
  `,
})
export class DatePickerComponent {
  readonly selectedDate = input<string | null>(null);
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  readonly dateSelected = output<string>();

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

    // Previous month trailing days
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

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: d,
        month,
        year,
        isCurrentMonth: true,
        iso: this.toIso(year, month, d),
      });
    }

    // Next month leading days to fill 6 weeks (42 cells)
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

  selectDay(day: CalendarDay): void {
    if (!this.isDisabled(day)) {
      this.dateSelected.emit(day.iso);
    }
  }

  isToday(day: CalendarDay): boolean {
    const today = new Date();
    return (
      day.date === today.getDate() &&
      day.month === today.getMonth() &&
      day.year === today.getFullYear()
    );
  }

  isSelected(day: CalendarDay): boolean {
    return day.iso === this.selectedDate();
  }

  isDisabled(day: CalendarDay): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && day.iso < min) return true;
    if (max && day.iso > max) return true;
    return false;
  }

  private toIso(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
}
