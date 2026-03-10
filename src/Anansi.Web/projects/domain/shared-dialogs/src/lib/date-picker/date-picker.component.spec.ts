import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent, CalendarDay } from './date-picker.component';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the current month and year', () => {
    const now = new Date();
    expect(component.currentMonth()).toBe(now.getMonth());
    expect(component.currentYear()).toBe(now.getFullYear());
  });

  it('should display month and year label', () => {
    component.currentMonth.set(0);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.month-year');
    expect(label.textContent).toBe('January 2026');
  });

  it('should display all weekday headers', () => {
    fixture.detectChanges();

    const weekdays = fixture.nativeElement.querySelectorAll('.weekday');
    expect(weekdays.length).toBe(7);
    expect(weekdays[0].textContent).toBe('Sun');
    expect(weekdays[6].textContent).toBe('Sat');
  });

  it('should generate a 42-cell (6-week) calendar grid', () => {
    component.currentMonth.set(2); // March
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    expect(days.length).toBe(42);
  });

  it('should always generate exactly 42 cells', () => {
    // Test several months
    for (let m = 0; m < 12; m++) {
      component.currentMonth.set(m);
      component.currentYear.set(2026);
      expect(component.calendarDays().length).toBe(42);
    }
  });

  it('should mark current month days as isCurrentMonth', () => {
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    const currentMonthDays = days.filter((d) => d.isCurrentMonth);
    expect(currentMonthDays.length).toBe(31); // March has 31 days
    expect(currentMonthDays[0].date).toBe(1);
    expect(currentMonthDays[currentMonthDays.length - 1].date).toBe(31);
  });

  it('should include trailing days from previous month', () => {
    // March 2026 starts on Sunday, so no previous-month trailing days
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    let days = component.calendarDays();
    let prevDays = days.filter((d) => !d.isCurrentMonth && d.month < 2);
    expect(prevDays.length).toBe(0);

    // April 2026 starts on Wednesday, so 3 trailing days from March
    component.currentMonth.set(3);
    component.currentYear.set(2026);
    fixture.detectChanges();

    days = component.calendarDays();
    const beforeApril = days.filter(
      (d) => !d.isCurrentMonth && (d.month === 2 || (d.year < 2026)),
    );
    expect(beforeApril.length).toBe(3);
    expect(beforeApril[0].date).toBe(29);
    expect(beforeApril[1].date).toBe(30);
    expect(beforeApril[2].date).toBe(31);
  });

  it('should include leading days from next month', () => {
    component.currentMonth.set(2); // March 2026
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    const nextDays = days.filter((d) => !d.isCurrentMonth && d.month > 2);
    expect(nextDays.length).toBe(42 - 31); // 11 days from April
    expect(nextDays[0].date).toBe(1);
  });

  it('should navigate to previous month', () => {
    component.currentMonth.set(5);
    component.currentYear.set(2026);

    component.previousMonth();

    expect(component.currentMonth()).toBe(4);
    expect(component.currentYear()).toBe(2026);
  });

  it('should wrap to December when going before January', () => {
    component.currentMonth.set(0);
    component.currentYear.set(2026);

    component.previousMonth();

    expect(component.currentMonth()).toBe(11);
    expect(component.currentYear()).toBe(2025);
  });

  it('should navigate to next month', () => {
    component.currentMonth.set(5);
    component.currentYear.set(2026);

    component.nextMonth();

    expect(component.currentMonth()).toBe(6);
    expect(component.currentYear()).toBe(2026);
  });

  it('should wrap to January when going past December', () => {
    component.currentMonth.set(11);
    component.currentYear.set(2026);

    component.nextMonth();

    expect(component.currentMonth()).toBe(0);
    expect(component.currentYear()).toBe(2027);
  });

  it('should render previous month button and respond to click', () => {
    component.currentMonth.set(6);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('[aria-label="Previous month"]');
    expect(prevBtn).toBeTruthy();
    prevBtn.click();
    fixture.detectChanges();

    expect(component.currentMonth()).toBe(5);
  });

  it('should render next month button and respond to click', () => {
    component.currentMonth.set(6);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const nextBtn = fixture.nativeElement.querySelector('[aria-label="Next month"]');
    expect(nextBtn).toBeTruthy();
    nextBtn.click();
    fixture.detectChanges();

    expect(component.currentMonth()).toBe(7);
  });

  it('should identify today correctly', () => {
    const today = new Date();
    component.currentMonth.set(today.getMonth());
    component.currentYear.set(today.getFullYear());
    fixture.detectChanges();

    const todayDay: CalendarDay = {
      date: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
      isCurrentMonth: true,
      iso: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    };

    expect(component.isToday(todayDay)).toBe(true);

    const notToday: CalendarDay = {
      date: 1,
      month: 0,
      year: 2000,
      isCurrentMonth: true,
      iso: '2000-01-01',
    };
    expect(component.isToday(notToday)).toBe(false);
  });

  it('should render today cell with today class', () => {
    const today = new Date();
    component.currentMonth.set(today.getMonth());
    component.currentYear.set(today.getFullYear());
    fixture.detectChanges();

    const todayCells = fixture.nativeElement.querySelectorAll('.day-cell.today');
    expect(todayCells.length).toBe(1);
  });

  it('should identify selected day', () => {
    fixture.componentRef.setInput('selectedDate', '2026-03-15');
    fixture.detectChanges();

    const day: CalendarDay = {
      date: 15,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-15',
    };
    expect(component.isSelected(day)).toBe(true);

    const otherDay: CalendarDay = {
      date: 16,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-16',
    };
    expect(component.isSelected(otherDay)).toBe(false);
  });

  it('should render selected cell with selected class', () => {
    fixture.componentRef.setInput('selectedDate', '2026-03-15');
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const selectedCells = fixture.nativeElement.querySelectorAll('.day-cell.selected');
    expect(selectedCells.length).toBe(1);
    expect(selectedCells[0].textContent.trim()).toBe('15');
  });

  it('should emit dateSelected when a day is clicked', () => {
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dateSelected.subscribe(spy);

    const day: CalendarDay = {
      date: 10,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-10',
    };
    component.selectDay(day);

    expect(spy).toHaveBeenCalledWith('2026-03-10');
  });

  it('should emit dateSelected when a day cell in the DOM is clicked', () => {
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dateSelected.subscribe(spy);

    // Click the first current-month day cell (day 1)
    const dayCells = fixture.nativeElement.querySelectorAll('.day-cell');
    // March 2026 starts on Sunday, so first cell is day 1
    dayCells[0].click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('2026-03-01');
  });

  it('should not emit dateSelected when a disabled day is clicked', () => {
    fixture.componentRef.setInput('minDate', '2026-03-10');
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dateSelected.subscribe(spy);

    const day: CalendarDay = {
      date: 5,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-05',
    };
    component.selectDay(day);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should disable dates before minDate', () => {
    fixture.componentRef.setInput('minDate', '2026-03-15');
    fixture.detectChanges();

    const before: CalendarDay = {
      date: 14,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-14',
    };
    expect(component.isDisabled(before)).toBe(true);

    const on: CalendarDay = {
      date: 15,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-15',
    };
    expect(component.isDisabled(on)).toBe(false);

    const after: CalendarDay = {
      date: 16,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-16',
    };
    expect(component.isDisabled(after)).toBe(false);
  });

  it('should disable dates after maxDate', () => {
    fixture.componentRef.setInput('maxDate', '2026-03-20');
    fixture.detectChanges();

    const after: CalendarDay = {
      date: 21,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-21',
    };
    expect(component.isDisabled(after)).toBe(true);

    const on: CalendarDay = {
      date: 20,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-20',
    };
    expect(component.isDisabled(on)).toBe(false);
  });

  it('should disable dates outside both minDate and maxDate', () => {
    fixture.componentRef.setInput('minDate', '2026-03-10');
    fixture.componentRef.setInput('maxDate', '2026-03-20');
    fixture.detectChanges();

    expect(
      component.isDisabled({
        date: 9,
        month: 2,
        year: 2026,
        isCurrentMonth: true,
        iso: '2026-03-09',
      }),
    ).toBe(true);

    expect(
      component.isDisabled({
        date: 15,
        month: 2,
        year: 2026,
        isCurrentMonth: true,
        iso: '2026-03-15',
      }),
    ).toBe(false);

    expect(
      component.isDisabled({
        date: 21,
        month: 2,
        year: 2026,
        isCurrentMonth: true,
        iso: '2026-03-21',
      }),
    ).toBe(true);
  });

  it('should not disable when no minDate or maxDate set', () => {
    fixture.detectChanges();

    const day: CalendarDay = {
      date: 15,
      month: 2,
      year: 2026,
      isCurrentMonth: true,
      iso: '2026-03-15',
    };
    expect(component.isDisabled(day)).toBe(false);
  });

  it('should render disabled cells with disabled class and attribute', () => {
    fixture.componentRef.setInput('minDate', '2026-03-05');
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const disabledCells = fixture.nativeElement.querySelectorAll('.day-cell.disabled');
    expect(disabledCells.length).toBeGreaterThan(0);

    // Check that disabled cells have the disabled attribute
    const firstDisabled = disabledCells[0] as HTMLButtonElement;
    expect(firstDisabled.disabled).toBe(true);
  });

  it('should render other-month cells with dimmed class', () => {
    component.currentMonth.set(3); // April 2026 starts on Wednesday
    component.currentYear.set(2026);
    fixture.detectChanges();

    const otherMonthCells = fixture.nativeElement.querySelectorAll('.day-cell.other-month');
    expect(otherMonthCells.length).toBeGreaterThan(0);
  });

  it('should generate correct ISO strings', () => {
    component.currentMonth.set(0); // January
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    const jan1 = days.find((d) => d.isCurrentMonth && d.date === 1);
    expect(jan1!.iso).toBe('2026-01-01');

    const jan31 = days.find((d) => d.isCurrentMonth && d.date === 31);
    expect(jan31!.iso).toBe('2026-01-31');
  });

  it('should pad single-digit months and days in ISO strings', () => {
    component.currentMonth.set(1); // February
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    const feb5 = days.find((d) => d.isCurrentMonth && d.date === 5);
    expect(feb5!.iso).toBe('2026-02-05');
  });

  it('should handle December to January rollover in trailing days', () => {
    component.currentMonth.set(11); // December 2026
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    const nextMonthDays = days.filter((d) => !d.isCurrentMonth && d.month === 0);
    if (nextMonthDays.length > 0) {
      expect(nextMonthDays[0].year).toBe(2027);
      expect(nextMonthDays[0].month).toBe(0);
    }
  });

  it('should handle January to December rollover in previous month trailing days', () => {
    component.currentMonth.set(0); // January 2026
    component.currentYear.set(2026);
    fixture.detectChanges();

    const days = component.calendarDays();
    const prevMonthDays = days.filter((d) => !d.isCurrentMonth && d.month === 11);
    if (prevMonthDays.length > 0) {
      expect(prevMonthDays[0].year).toBe(2025);
    }
  });

  it('should handle February in a leap year', () => {
    component.currentMonth.set(1); // February
    component.currentYear.set(2024); // Leap year
    fixture.detectChanges();

    const days = component.calendarDays();
    const febDays = days.filter((d) => d.isCurrentMonth);
    expect(febDays.length).toBe(29);
  });

  it('should handle February in a non-leap year', () => {
    component.currentMonth.set(1); // February
    component.currentYear.set(2026); // Not a leap year
    fixture.detectChanges();

    const days = component.calendarDays();
    const febDays = days.filter((d) => d.isCurrentMonth);
    expect(febDays.length).toBe(28);
  });

  it('should render exactly 42 day cells in the DOM', () => {
    component.currentMonth.set(2);
    component.currentYear.set(2026);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.day-cell');
    expect(cells.length).toBe(42);
  });

  it('should update month-year label when navigating', () => {
    component.currentMonth.set(5);
    component.currentYear.set(2026);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.month-year').textContent).toBe('June 2026');

    component.nextMonth();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.month-year').textContent).toBe('July 2026');
  });

  it('should use default null for selectedDate, minDate, maxDate', () => {
    fixture.detectChanges();
    expect(component.selectedDate()).toBeNull();
    expect(component.minDate()).toBeNull();
    expect(component.maxDate()).toBeNull();
  });
});
