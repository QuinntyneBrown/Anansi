import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  BookingRecordDto,
  BookingStatus,
  PagedList,
} from 'api';
import {
  CalendarPageComponent,
  CalendarDay,
  getMonthStart,
  getMonthEnd,
  toISODate,
  isSameDay,
  bookingBadgeVariant,
  formatTime,
} from './calendar-page.component';

describe('CalendarPageComponent', () => {
  let component: CalendarPageComponent;
  let fixture: ComponentFixture<CalendarPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockBooking1: BookingRecordDto = {
    id: 'booking-1',
    sessionTypeId: 'st-1',
    sessionTypeName: 'Portrait',
    contactId: 'c-1',
    clientFirstName: 'Alice',
    clientLastName: 'Smith',
    clientEmail: 'alice@example.com',
    startTime: '2026-03-10T14:00:00Z',
    endTime: '2026-03-10T15:00:00Z',
    status: BookingStatus.Confirmed,
    amountPaidCents: 20000,
    discountCents: 0,
    createdAt: '2026-03-01T00:00:00Z',
  };

  const mockBooking2: BookingRecordDto = {
    id: 'booking-2',
    sessionTypeId: 'st-2',
    sessionTypeName: 'Wedding',
    contactId: 'c-2',
    clientFirstName: 'Bob',
    clientLastName: 'Jones',
    clientEmail: 'bob@example.com',
    startTime: '2026-03-10T10:00:00Z',
    endTime: '2026-03-10T18:00:00Z',
    status: BookingStatus.Pending,
    amountPaidCents: 0,
    discountCents: 0,
    createdAt: '2026-03-02T00:00:00Z',
  };

  const mockBooking3: BookingRecordDto = {
    id: 'booking-3',
    sessionTypeId: 'st-1',
    sessionTypeName: 'Mini',
    contactId: 'c-3',
    clientFirstName: 'Carol',
    clientLastName: 'White',
    clientEmail: 'carol@example.com',
    startTime: '2026-03-15T09:00:00Z',
    endTime: '2026-03-15T10:00:00Z',
    status: BookingStatus.Cancelled,
    amountPaidCents: 0,
    discountCents: 0,
    createdAt: '2026-03-03T00:00:00Z',
  };

  const mockPagedBookings: PagedList<BookingRecordDto> = {
    items: [mockBooking1, mockBooking2, mockBooking3],
    page: 1,
    pageSize: 200,
    totalCount: 3,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const emptyPagedBookings: PagedList<BookingRecordDto> = {
    items: [],
    page: 1,
    pageSize: 200,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  };

  function flushInitialRequest(data: PagedList<BookingRecordDto> = mockPagedBookings): void {
    const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
    expect(req.request.method).toBe('GET');
    req.flush(data);
  }

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
      fixture.detectChanges();
      flushInitialRequest();
    });

    it('should set loading to true initially', () => {
      expect(component.loading()).toBe(true);
      fixture.detectChanges();
      flushInitialRequest();
    });

    it('should set error to false initially', () => {
      expect(component.error()).toBe(false);
      fixture.detectChanges();
      flushInitialRequest();
    });

    it('should load bookings on init', () => {
      fixture.detectChanges();
      flushInitialRequest();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(false);
      expect(component.bookings().length).toBe(3);
    });
  });

  describe('API calls', () => {
    it('should pass from and to params for the current month', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      expect(req.request.method).toBe('GET');

      const year = component.currentYear();
      const month = component.currentMonth();
      const expectedFrom = toISODate(getMonthStart(year, month));
      const expectedTo = toISODate(getMonthEnd(year, month));

      expect(req.request.params.get('from')).toBe(expectedFrom);
      expect(req.request.params.get('to')).toBe(expectedTo);
      expect(req.request.params.get('pageSize')).toBe('200');

      req.flush(mockPagedBookings);
    });

    it('should set error to true on API failure', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(true);
    });

    it('should populate bookings signal from API response', () => {
      fixture.detectChanges();
      flushInitialRequest();

      expect(component.bookings()).toEqual([mockBooking1, mockBooking2, mockBooking3]);
    });
  });

  describe('month navigation', () => {
    beforeEach(() => {
      // Set to a known month for predictability
      component.currentYear.set(2026);
      component.currentMonth.set(2); // March (0-indexed)
    });

    it('should advance to next month', () => {
      fixture.detectChanges();
      flushInitialRequest();

      component.nextMonth();

      expect(component.currentMonth()).toBe(3);
      expect(component.currentYear()).toBe(2026);

      flushInitialRequest(emptyPagedBookings);
    });

    it('should go to previous month', () => {
      fixture.detectChanges();
      flushInitialRequest();

      component.prevMonth();

      expect(component.currentMonth()).toBe(1);
      expect(component.currentYear()).toBe(2026);

      flushInitialRequest(emptyPagedBookings);
    });

    it('should wrap from January to December of previous year', () => {
      component.currentMonth.set(0); // January
      component.currentYear.set(2026);

      fixture.detectChanges();
      flushInitialRequest();

      component.prevMonth();

      expect(component.currentMonth()).toBe(11);
      expect(component.currentYear()).toBe(2025);

      flushInitialRequest(emptyPagedBookings);
    });

    it('should wrap from December to January of next year', () => {
      component.currentMonth.set(11); // December
      component.currentYear.set(2026);

      fixture.detectChanges();
      flushInitialRequest();

      component.nextMonth();

      expect(component.currentMonth()).toBe(0);
      expect(component.currentYear()).toBe(2027);

      flushInitialRequest(emptyPagedBookings);
    });

    it('should reload bookings after navigating to next month', () => {
      fixture.detectChanges();
      flushInitialRequest();

      component.nextMonth();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      expect(req.request.params.get('from')).toBe('2026-04-01');
      expect(req.request.params.get('to')).toBe('2026-04-30');
      req.flush(emptyPagedBookings);
    });

    it('should reload bookings after navigating to previous month', () => {
      fixture.detectChanges();
      flushInitialRequest();

      component.prevMonth();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      expect(req.request.params.get('from')).toBe('2026-02-01');
      expect(req.request.params.get('to')).toBe('2026-02-28');
      req.flush(emptyPagedBookings);
    });

    it('should show correct month title', () => {
      fixture.detectChanges();
      flushInitialRequest();

      expect(component.monthTitle()).toBe('March 2026');
    });

    it('should update month title after navigation', () => {
      fixture.detectChanges();
      flushInitialRequest();

      component.nextMonth();

      expect(component.monthTitle()).toBe('April 2026');

      flushInitialRequest(emptyPagedBookings);
    });
  });

  describe('calendar grid', () => {
    beforeEach(() => {
      component.currentYear.set(2026);
      component.currentMonth.set(2); // March 2026 starts on Sunday
    });

    it('should produce 42 calendar day cells', () => {
      fixture.detectChanges();
      flushInitialRequest();

      expect(component.calendarDays().length).toBe(42);
    });

    it('should have 31 current-month days for March', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const currentMonthDays = component.calendarDays().filter((d) => d.isCurrentMonth);
      expect(currentMonthDays.length).toBe(31);
    });

    it('should mark the first day of March correctly', () => {
      fixture.detectChanges();
      flushInitialRequest();

      // March 2026 starts on Sunday => first cell is March 1
      const days = component.calendarDays();
      expect(days[0].dayOfMonth).toBe(1);
      expect(days[0].isCurrentMonth).toBe(true);
    });

    it('should include previous month days when month does not start on Sunday', () => {
      component.currentMonth.set(3); // April 2026 starts on Wednesday
      fixture.detectChanges();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      req.flush(emptyPagedBookings);

      const days = component.calendarDays();
      const prevMonthDays = days.filter((d) => !d.isCurrentMonth && d.date.getMonth() === 2);
      expect(prevMonthDays.length).toBeGreaterThan(0);
    });

    it('should include next month days to fill the grid', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const nextMonthDays = days.filter((d) => !d.isCurrentMonth && d.date.getMonth() === 3);
      expect(nextMonthDays.length).toBeGreaterThan(0);
    });

    it('should assign bookings to the correct day', () => {
      fixture.detectChanges();
      flushInitialRequest();

      // mockBooking1 and mockBooking2 are on March 10
      const days = component.calendarDays();
      const march10 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 10);
      expect(march10).toBeTruthy();
      expect(march10!.bookings.length).toBe(2);
    });

    it('should have no bookings on days without any', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march1 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 1);
      expect(march1).toBeTruthy();
      expect(march1!.bookings.length).toBe(0);
    });
  });

  describe('day selection', () => {
    beforeEach(() => {
      component.currentYear.set(2026);
      component.currentMonth.set(2); // March
    });

    it('should select a day when selectDay is called', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march15 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 15)!;
      component.selectDay(march15);

      expect(isSameDay(component.selectedDate(), march15.date)).toBe(true);
    });

    it('should show bookings for the selected day', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march10 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);

      const selectedBookings = component.selectedDayBookings();
      expect(selectedBookings.length).toBe(2);
      expect(selectedBookings[0].clientFirstName).toBe('Alice');
    });

    it('should return empty bookings for a day with no bookings', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march1 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 1)!;
      component.selectDay(march1);

      expect(component.selectedDayBookings().length).toBe(0);
    });

    it('should show a formatted title for the selected day', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march10 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);

      const title = component.selectedDayTitle();
      expect(title).toContain('March');
      expect(title).toContain('10');
    });

    it('isSelected returns true for the selected day', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march10 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);

      expect(component.isSelected(march10)).toBe(true);
    });

    it('isSelected returns false for a non-selected day', () => {
      fixture.detectChanges();
      flushInitialRequest();

      const days = component.calendarDays();
      const march10 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      const march15 = days.find((d) => d.isCurrentMonth && d.dayOfMonth === 15)!;
      component.selectDay(march10);

      expect(component.isSelected(march15)).toBe(false);
    });
  });

  describe('badge variants', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushInitialRequest();
    });

    it('should return success for Confirmed', () => {
      expect(component.getBadgeVariant('Confirmed')).toBe('success');
    });

    it('should return warning for Pending', () => {
      expect(component.getBadgeVariant('Pending')).toBe('warning');
    });

    it('should return error for Cancelled', () => {
      expect(component.getBadgeVariant('Cancelled')).toBe('error');
    });

    it('should return error for Declined', () => {
      expect(component.getBadgeVariant('Declined')).toBe('error');
    });

    it('should return error for NoShow', () => {
      expect(component.getBadgeVariant('NoShow')).toBe('error');
    });

    it('should return neutral for Completed', () => {
      expect(component.getBadgeVariant('Completed')).toBe('neutral');
    });

    it('should return neutral for unknown status', () => {
      expect(component.getBadgeVariant('SomeOther')).toBe('neutral');
    });
  });

  describe('loading state rendering', () => {
    it('should show spinner while loading', () => {
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('lib-spinner');
      expect(spinner).toBeTruthy();

      flushInitialRequest();
      fixture.detectChanges();

      const spinnerAfter = fixture.nativeElement.querySelector('.loading-container');
      expect(spinnerAfter).toBeNull();
    });

    it('should hide spinner after data loads', () => {
      fixture.detectChanges();
      flushInitialRequest();
      fixture.detectChanges();

      expect(component.loading()).toBe(false);
      const spinner = fixture.nativeElement.querySelector('.loading-container');
      expect(spinner).toBeNull();
    });
  });

  describe('error state rendering', () => {
    it('should show error message when error is true', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });

      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.error-text');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('Something went wrong');
    });

    it('should not show calendar when error is true', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });

      fixture.detectChanges();

      const grid = fixture.nativeElement.querySelector('.calendar-grid');
      expect(grid).toBeNull();
    });
  });

  describe('rendered content', () => {
    beforeEach(() => {
      component.currentYear.set(2026);
      component.currentMonth.set(2);
      fixture.detectChanges();
      flushInitialRequest();
      fixture.detectChanges();
    });

    it('should render the month title', () => {
      const title = fixture.nativeElement.querySelector('.month-title');
      expect(title.textContent).toContain('March 2026');
    });

    it('should render weekday headers', () => {
      const headers = fixture.nativeElement.querySelectorAll('.weekday-cell');
      expect(headers.length).toBe(7);
      expect(headers[0].textContent).toContain('Sun');
      expect(headers[6].textContent).toContain('Sat');
    });

    it('should render 42 day cells', () => {
      const cells = fixture.nativeElement.querySelectorAll('.day-cell');
      expect(cells.length).toBe(42);
    });

    it('should render booking dots on days with bookings', () => {
      const dots = fixture.nativeElement.querySelectorAll('.dot');
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should render the detail sidebar card', () => {
      const card = fixture.nativeElement.querySelector('.day-detail lib-card');
      expect(card).toBeTruthy();
    });

    it('should show empty text when no bookings on selected day', () => {
      const days = component.calendarDays();
      const march1 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 1)!;
      component.selectDay(march1);
      fixture.detectChanges();

      const emptyText = fixture.nativeElement.querySelector('.empty-text');
      expect(emptyText).toBeTruthy();
      expect(emptyText.textContent).toContain('No bookings on this day');
    });

    it('should show booking rows when day has bookings', () => {
      const days = component.calendarDays();
      const march10 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.booking-row');
      expect(rows.length).toBe(2);
    });

    it('should show client names in booking rows', () => {
      const days = component.calendarDays();
      const march10 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);
      fixture.detectChanges();

      const clients = fixture.nativeElement.querySelectorAll('.booking-client');
      const names = Array.from(clients).map((el: unknown) => (el as HTMLElement).textContent!.trim());
      expect(names).toContain('Alice Smith');
      expect(names).toContain('Bob Jones');
    });

    it('should show session type in booking rows', () => {
      const days = component.calendarDays();
      const march10 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);
      fixture.detectChanges();

      const types = fixture.nativeElement.querySelectorAll('.booking-type');
      const typeNames = Array.from(types).map((el: unknown) => (el as HTMLElement).textContent!.trim());
      expect(typeNames).toContain('Portrait');
      expect(typeNames).toContain('Wedding');
    });

    it('should show time range in booking rows', () => {
      const days = component.calendarDays();
      const march10 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);
      fixture.detectChanges();

      const times = fixture.nativeElement.querySelectorAll('.booking-time');
      expect(times.length).toBe(2);
      expect(times[0].textContent).toContain('-');
    });

    it('should render badge components for each booking', () => {
      const days = component.calendarDays();
      const march10 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 10)!;
      component.selectDay(march10);
      fixture.detectChanges();

      const badges = fixture.nativeElement.querySelectorAll('.booking-row lib-badge');
      expect(badges.length).toBe(2);
    });

    it('should render navigation buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.calendar-header lib-button');
      expect(buttons.length).toBe(2);
    });

    it('should apply other-month class to non-current-month days', () => {
      const otherMonthCells = fixture.nativeElement.querySelectorAll('.day-cell.other-month');
      expect(otherMonthCells.length).toBeGreaterThan(0);
    });

    it('should select a day when a day cell is clicked', () => {
      const days = component.calendarDays();
      const march15 = days.find((d: CalendarDay) => d.isCurrentMonth && d.dayOfMonth === 15)!;
      const cells = fixture.nativeElement.querySelectorAll('.day-cell');
      // Find the cell for day 15 — March 2026 starts on Sunday, so day 15 is at index 14
      const cellIndex = days.indexOf(march15);
      cells[cellIndex].click();
      fixture.detectChanges();

      expect(isSameDay(component.selectedDate(), march15.date)).toBe(true);
    });
  });

  describe('overflow dots', () => {
    it('should show overflow indicator when a day has more than 3 bookings', () => {
      component.currentYear.set(2026);
      component.currentMonth.set(2);

      const fourBookings: BookingRecordDto[] = [
        { ...mockBooking1, id: 'b1' },
        { ...mockBooking1, id: 'b2', status: BookingStatus.Pending },
        { ...mockBooking1, id: 'b3', status: BookingStatus.Cancelled },
        { ...mockBooking1, id: 'b4', status: BookingStatus.Completed },
      ];

      const pagedFour: PagedList<BookingRecordDto> = {
        items: fourBookings,
        page: 1,
        pageSize: 200,
        totalCount: 4,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      };

      fixture.detectChanges();
      flushInitialRequest(pagedFour);
      fixture.detectChanges();

      const overflow = fixture.nativeElement.querySelector('.dot-overflow');
      expect(overflow).toBeTruthy();
      expect(overflow.textContent).toContain('+1');
    });

    it('should not show overflow indicator when a day has 3 or fewer bookings', () => {
      component.currentYear.set(2026);
      component.currentMonth.set(2);

      fixture.detectChanges();
      flushInitialRequest();
      fixture.detectChanges();

      const overflow = fixture.nativeElement.querySelector('.dot-overflow');
      expect(overflow).toBeNull();
    });
  });

  describe('reload / loadMonth', () => {
    it('should be able to reload data', () => {
      fixture.detectChanges();
      flushInitialRequest();

      component.loadMonth();

      expect(component.loading()).toBe(true);

      flushInitialRequest(emptyPagedBookings);

      expect(component.loading()).toBe(false);
      expect(component.bookings().length).toBe(0);
    });

    it('should reset error state on reload', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      req.flush('error', { status: 500, statusText: 'Error' });

      expect(component.error()).toBe(true);

      component.loadMonth();
      expect(component.error()).toBe(false);
      expect(component.loading()).toBe(true);

      flushInitialRequest(emptyPagedBookings);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(false);
    });
  });

  describe('utility functions', () => {
    describe('getMonthStart', () => {
      it('should return the first day of the month', () => {
        const result = getMonthStart(2026, 2);
        expect(result.getFullYear()).toBe(2026);
        expect(result.getMonth()).toBe(2);
        expect(result.getDate()).toBe(1);
      });

      it('should handle January', () => {
        const result = getMonthStart(2026, 0);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(1);
      });

      it('should handle December', () => {
        const result = getMonthStart(2026, 11);
        expect(result.getMonth()).toBe(11);
        expect(result.getDate()).toBe(1);
      });
    });

    describe('getMonthEnd', () => {
      it('should return the last day of March', () => {
        const result = getMonthEnd(2026, 2);
        expect(result.getDate()).toBe(31);
      });

      it('should return the last day of February in a non-leap year', () => {
        const result = getMonthEnd(2026, 1);
        expect(result.getDate()).toBe(28);
      });

      it('should return the last day of February in a leap year', () => {
        const result = getMonthEnd(2024, 1);
        expect(result.getDate()).toBe(29);
      });

      it('should return the last day of April (30 days)', () => {
        const result = getMonthEnd(2026, 3);
        expect(result.getDate()).toBe(30);
      });
    });

    describe('toISODate', () => {
      it('should format as YYYY-MM-DD', () => {
        const date = new Date(2026, 2, 10);
        expect(toISODate(date)).toBe('2026-03-10');
      });

      it('should pad single-digit months', () => {
        const date = new Date(2026, 0, 5);
        expect(toISODate(date)).toBe('2026-01-05');
      });

      it('should pad single-digit days', () => {
        const date = new Date(2026, 9, 3);
        expect(toISODate(date)).toBe('2026-10-03');
      });

      it('should handle December 31', () => {
        const date = new Date(2026, 11, 31);
        expect(toISODate(date)).toBe('2026-12-31');
      });
    });

    describe('isSameDay', () => {
      it('should return true for same date', () => {
        const a = new Date(2026, 2, 10, 14, 0);
        const b = new Date(2026, 2, 10, 9, 30);
        expect(isSameDay(a, b)).toBe(true);
      });

      it('should return false for different dates', () => {
        const a = new Date(2026, 2, 10);
        const b = new Date(2026, 2, 11);
        expect(isSameDay(a, b)).toBe(false);
      });

      it('should return false for different months', () => {
        const a = new Date(2026, 2, 10);
        const b = new Date(2026, 3, 10);
        expect(isSameDay(a, b)).toBe(false);
      });

      it('should return false for different years', () => {
        const a = new Date(2026, 2, 10);
        const b = new Date(2025, 2, 10);
        expect(isSameDay(a, b)).toBe(false);
      });
    });

    describe('bookingBadgeVariant', () => {
      it('should return success for Confirmed', () => {
        expect(bookingBadgeVariant('Confirmed')).toBe('success');
      });

      it('should return warning for Pending', () => {
        expect(bookingBadgeVariant('Pending')).toBe('warning');
      });

      it('should return error for Cancelled', () => {
        expect(bookingBadgeVariant('Cancelled')).toBe('error');
      });

      it('should return error for Declined', () => {
        expect(bookingBadgeVariant('Declined')).toBe('error');
      });

      it('should return error for NoShow', () => {
        expect(bookingBadgeVariant('NoShow')).toBe('error');
      });

      it('should return neutral for Completed', () => {
        expect(bookingBadgeVariant('Completed')).toBe('neutral');
      });

      it('should return neutral for unknown status', () => {
        expect(bookingBadgeVariant('Whatever')).toBe('neutral');
      });
    });

    describe('formatTime', () => {
      it('should format an ISO time string', () => {
        const result = formatTime('2026-03-10T14:00:00Z');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('should return a string containing a colon (time separator)', () => {
        const result = formatTime('2026-03-10T10:30:00Z');
        expect(result).toContain(':');
      });
    });
  });
});
