import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  RevenueDashboardDto,
  BookingRecordDto,
  NotificationDto,
  PagedList,
  BookingStatus,
  NotificationCategory,
  PaymentMethod,
} from 'api';
import {
  DashboardPageComponent,
  formatCurrency,
  relativeTime,
} from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockDashboard: RevenueDashboardDto = {
    totalRevenueCents: 1254000,
    netRevenueCents: 1200000,
    totalFeesCents: 54000,
    totalRefundsCents: 0,
    totalTipsCents: 10000,
    totalTaxCents: 5000,
    paymentMethodBreakdown: [
      { paymentMethod: PaymentMethod.CreditCard, totalCents: 1254000, count: 10 },
    ],
    paidInvoiceCount: 12,
    pendingInvoiceCount: 8,
    overdueInvoiceCount: 2,
  };

  const mockBookings: BookingRecordDto[] = [
    {
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
    },
    {
      id: 'booking-2',
      sessionTypeId: 'st-2',
      sessionTypeName: 'Wedding',
      contactId: 'c-2',
      clientFirstName: 'Bob',
      clientLastName: 'Jones',
      clientEmail: 'bob@example.com',
      startTime: '2026-03-11T10:00:00Z',
      endTime: '2026-03-11T18:00:00Z',
      status: BookingStatus.Pending,
      amountPaidCents: 0,
      discountCents: 0,
      createdAt: '2026-03-02T00:00:00Z',
    },
  ];

  const mockNotifications: NotificationDto[] = [
    {
      id: 'notif-1',
      photographerId: 'p-1',
      eventType: 'FormSubmissionReceived',
      category: NotificationCategory.StudioManager,
      title: 'New lead form',
      message: 'A new lead submitted a contact form',
      isRead: false,
      createdAt: '2026-03-10T12:00:00Z',
    },
    {
      id: 'notif-2',
      photographerId: 'p-1',
      eventType: 'SessionBooked',
      category: NotificationCategory.StudioManager,
      title: 'Session booked',
      message: 'Alice booked a portrait session',
      isRead: false,
      createdAt: '2026-03-10T11:00:00Z',
    },
    {
      id: 'notif-3',
      photographerId: 'p-1',
      eventType: 'InvoicePaymentReceived',
      category: NotificationCategory.Store,
      title: 'Payment received',
      message: 'Payment of $200 received',
      isRead: true,
      createdAt: '2026-03-09T08:00:00Z',
    },
  ];

  const mockSessionsPage: PagedList<BookingRecordDto> = {
    items: mockBookings,
    page: 1,
    pageSize: 5,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const mockNotificationsPage: PagedList<NotificationDto> = {
    items: mockNotifications,
    page: 1,
    pageSize: 5,
    totalCount: 3,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  function flushAllRequests(): void {
    const dashReq = httpTesting.expectOne(
      (r) => r.url === `${baseUrl}/api/payments/dashboard`,
    );
    expect(dashReq.request.method).toBe('GET');
    dashReq.flush(mockDashboard);

    const sessionsReq = httpTesting.expectOne(
      (r) => r.url === `${baseUrl}/api/bookings`,
    );
    expect(sessionsReq.request.method).toBe('GET');
    expect(sessionsReq.request.params.get('pageSize')).toBe('5');
    sessionsReq.flush(mockSessionsPage);

    const notifReq = httpTesting.expectOne(
      (r) => r.url === `${baseUrl}/api/notifications`,
    );
    expect(notifReq.request.method).toBe('GET');
    expect(notifReq.request.params.get('pageSize')).toBe('5');
    notifReq.flush(mockNotificationsPage);
  }

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
      // ngOnInit not called yet so no requests — flush nothing
      // trigger change detection to call ngOnInit
      fixture.detectChanges();
      flushAllRequests();
    });

    it('should set loading to true initially', () => {
      expect(component.loading()).toBe(true);
      fixture.detectChanges();
      flushAllRequests();
    });
  });

  describe('API calls', () => {
    it('should call all 3 APIs in parallel on init', () => {
      fixture.detectChanges();
      flushAllRequests();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(false);
    });

    it('should populate dashboard signal from PaymentsService.getDashboard', () => {
      fixture.detectChanges();
      flushAllRequests();

      expect(component.dashboard()).toEqual(mockDashboard);
    });

    it('should populate upcomingSessions signal from BookingsService.list', () => {
      fixture.detectChanges();
      flushAllRequests();

      expect(component.upcomingSessions()).toEqual(mockBookings);
    });

    it('should populate recentActivity signal from NotificationsService.list', () => {
      fixture.detectChanges();
      flushAllRequests();

      expect(component.recentActivity()).toEqual(mockNotifications);
    });

    it('should pass pageSize 5 to bookings list', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush(mockDashboard);

      const sessionsReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/bookings`,
      );
      expect(sessionsReq.request.params.get('pageSize')).toBe('5');
      sessionsReq.flush(mockSessionsPage);

      const notifReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      notifReq.flush(mockNotificationsPage);
    });

    it('should pass pageSize 5 to notifications list', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush(mockDashboard);

      const sessionsReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/bookings`,
      );
      sessionsReq.flush(mockSessionsPage);

      const notifReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      expect(notifReq.request.params.get('pageSize')).toBe('5');
      notifReq.flush(mockNotificationsPage);
    });
  });

  describe('data mapping', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushAllRequests();
    });

    it('should compute newLeadsCount from notifications with lead-related event types', () => {
      // FormSubmissionReceived + SessionBooked = 2
      expect(component.newLeadsCount()).toBe(2);
    });

    it('should return 0 newLeadsCount when no matching notifications', () => {
      component.recentActivity.set([
        {
          ...mockNotifications[2],
          eventType: 'InvoicePaymentReceived',
        },
      ]);
      expect(component.newLeadsCount()).toBe(0);
    });

    it('should compute session initials from first and last name', () => {
      expect(component.sessionInitials(mockBookings[0])).toBe('AS');
      expect(component.sessionInitials(mockBookings[1])).toBe('BJ');
    });

    it('should handle empty name gracefully for initials', () => {
      const booking: BookingRecordDto = {
        ...mockBookings[0],
        clientFirstName: '',
        clientLastName: '',
      };
      expect(component.sessionInitials(booking)).toBe('');
    });

    it('should return correct badge variant for Confirmed status', () => {
      expect(component.getBadgeVariant('Confirmed')).toBe('success');
    });

    it('should return correct badge variant for Pending status', () => {
      expect(component.getBadgeVariant('Pending')).toBe('warning');
    });

    it('should return correct badge variant for Cancelled status', () => {
      expect(component.getBadgeVariant('Cancelled')).toBe('error');
    });

    it('should return correct badge variant for Declined status', () => {
      expect(component.getBadgeVariant('Declined')).toBe('error');
    });

    it('should return correct badge variant for NoShow status', () => {
      expect(component.getBadgeVariant('NoShow')).toBe('error');
    });

    it('should return neutral badge variant for Completed status', () => {
      expect(component.getBadgeVariant('Completed')).toBe('neutral');
    });

    it('should return neutral badge variant for unknown status', () => {
      expect(component.getBadgeVariant('SomeOtherStatus')).toBe('neutral');
    });

    it('should return gold dot color for ClientGallery category', () => {
      expect(component.getDotColor('ClientGallery')).toBe('#C9A962');
    });

    it('should return green dot color for Store category', () => {
      expect(component.getDotColor('Store')).toBe('#6E9E6E');
    });

    it('should return blue dot color for StudioManager category', () => {
      expect(component.getDotColor('StudioManager')).toBe('#5B8DEF');
    });

    it('should return muted dot color for Other category', () => {
      expect(component.getDotColor('Other')).toBe('#6E6E70');
    });

    it('should return muted dot color for unknown category', () => {
      expect(component.getDotColor('Unknown')).toBe('#6E6E70');
    });

    it('should format session time', () => {
      const result = component.formatSessionTime('2026-03-10T14:00:00Z');
      expect(result).toBeTruthy();
      // The exact format depends on locale, but should contain numeric time
      expect(typeof result).toBe('string');
    });
  });

  describe('loading state', () => {
    it('should show spinner while loading', () => {
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('lib-spinner');
      expect(spinner).toBeTruthy();

      flushAllRequests();
      fixture.detectChanges();

      const spinnerAfter = fixture.nativeElement.querySelector('.loading-container');
      expect(spinnerAfter).toBeNull();
    });

    it('should hide spinner after data loads', () => {
      fixture.detectChanges();
      flushAllRequests();
      fixture.detectChanges();

      expect(component.loading()).toBe(false);
      const spinner = fixture.nativeElement.querySelector('.loading-container');
      expect(spinner).toBeNull();
    });
  });

  describe('error state', () => {
    it('should set error to true and loading to false on API failure', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush('Server error', { status: 500, statusText: 'Server Error' });

      // forkJoin cancels remaining requests on first error — just discard them
      httpTesting.match(() => true);

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(true);
    });

    it('should show error message when error is true', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush('Server error', { status: 500, statusText: 'Server Error' });
      httpTesting.match(() => true);

      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.error-text');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('Something went wrong');
    });

    it('should not show dashboard content when error is true', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush('Server error', { status: 500, statusText: 'Server Error' });
      httpTesting.match(() => true);

      fixture.detectChanges();

      const metricsRow = fixture.nativeElement.querySelector('.metrics-row');
      expect(metricsRow).toBeNull();
    });
  });

  describe('rendered content', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushAllRequests();
      fixture.detectChanges();
    });

    it('should render 4 metric cards', () => {
      const cards = fixture.nativeElement.querySelectorAll('lib-metric-card');
      expect(cards.length).toBe(4);
    });

    it('should render two-column layout with 2 cards', () => {
      const cards = fixture.nativeElement.querySelectorAll(
        '.two-column lib-card',
      );
      expect(cards.length).toBe(2);
    });

    it('should render session rows for each booking', () => {
      const rows = fixture.nativeElement.querySelectorAll('.session-row');
      expect(rows.length).toBe(2);
    });

    it('should render activity rows for each notification', () => {
      const rows = fixture.nativeElement.querySelectorAll('.activity-row');
      expect(rows.length).toBe(3);
    });

    it('should render session client names', () => {
      const clients = fixture.nativeElement.querySelectorAll('.session-client');
      expect(clients[0].textContent).toContain('Alice Smith');
      expect(clients[1].textContent).toContain('Bob Jones');
    });

    it('should render notification titles', () => {
      const titles = fixture.nativeElement.querySelectorAll('.activity-title');
      expect(titles[0].textContent).toContain('New lead form');
      expect(titles[1].textContent).toContain('Session booked');
      expect(titles[2].textContent).toContain('Payment received');
    });

    it('should render notification descriptions', () => {
      const descs = fixture.nativeElement.querySelectorAll('.activity-desc');
      expect(descs[0].textContent).toContain('A new lead submitted a contact form');
    });

    it('should show empty text when no sessions', () => {
      component.upcomingSessions.set([]);
      fixture.detectChanges();

      const emptyTexts = fixture.nativeElement.querySelectorAll('.empty-text');
      const sessionEmpty = Array.from(emptyTexts).find((el: unknown) =>
        (el as HTMLElement).textContent?.includes('No upcoming sessions'),
      );
      expect(sessionEmpty).toBeTruthy();
    });

    it('should show empty text when no activity', () => {
      component.recentActivity.set([]);
      fixture.detectChanges();

      const emptyTexts = fixture.nativeElement.querySelectorAll('.empty-text');
      const activityEmpty = Array.from(emptyTexts).find((el: unknown) =>
        (el as HTMLElement).textContent?.includes('No recent activity'),
      );
      expect(activityEmpty).toBeTruthy();
    });
  });

  describe('formatCurrency', () => {
    it('should format zero cents', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should format small amounts', () => {
      expect(formatCurrency(100)).toBe('$1');
    });

    it('should format amounts in the hundreds', () => {
      expect(formatCurrency(9999)).toBe('$100');
    });

    it('should format thousands with comma separator', () => {
      expect(formatCurrency(1254000)).toBe('$12,540');
    });

    it('should format large amounts with commas', () => {
      expect(formatCurrency(100000000)).toBe('$1,000,000');
    });

    it('should format negative amounts', () => {
      expect(formatCurrency(-50000)).toBe('-$500');
    });

    it('should format single cent', () => {
      expect(formatCurrency(1)).toBe('$0');
    });

    it('should format 99 cents', () => {
      expect(formatCurrency(99)).toBe('$1');
    });

    it('should format exact dollar amounts', () => {
      expect(formatCurrency(500)).toBe('$5');
    });
  });

  describe('relativeTime', () => {
    it('should return "just now" for timestamps less than 60 seconds ago', () => {
      const now = new Date();
      now.setSeconds(now.getSeconds() - 10);
      expect(relativeTime(now.toISOString())).toBe('just now');
    });

    it('should return minutes ago for timestamps less than 60 minutes ago', () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - 2);
      expect(relativeTime(now.toISOString())).toBe('2 min ago');
    });

    it('should return minutes ago for 30 minutes', () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - 30);
      expect(relativeTime(now.toISOString())).toBe('30 min ago');
    });

    it('should return hours ago for timestamps less than 24 hours ago', () => {
      const now = new Date();
      now.setHours(now.getHours() - 3);
      expect(relativeTime(now.toISOString())).toBe('3 hr ago');
    });

    it('should return "1 hr ago" for one hour', () => {
      const now = new Date();
      now.setHours(now.getHours() - 1);
      expect(relativeTime(now.toISOString())).toBe('1 hr ago');
    });

    it('should return singular "day" for 1 day ago', () => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      expect(relativeTime(now.toISOString())).toBe('1 day ago');
    });

    it('should return plural "days" for multiple days ago', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(relativeTime(fiveDaysAgo.toISOString())).toBe('5 days ago');
    });

    it('should return "just now" for timestamps 0 seconds ago', () => {
      const now = new Date();
      expect(relativeTime(now.toISOString())).toBe('just now');
    });

    it('should handle 59 seconds as "just now"', () => {
      const now = new Date();
      now.setSeconds(now.getSeconds() - 59);
      expect(relativeTime(now.toISOString())).toBe('just now');
    });

    it('should handle exactly 60 seconds as "1 min ago"', () => {
      const now = new Date();
      now.setSeconds(now.getSeconds() - 60);
      expect(relativeTime(now.toISOString())).toBe('1 min ago');
    });
  });

  describe('reload', () => {
    it('should be able to reload data by calling load again', () => {
      fixture.detectChanges();
      flushAllRequests();

      component.load();

      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush(mockDashboard);

      const sessionsReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/bookings`,
      );
      sessionsReq.flush(mockSessionsPage);

      const notifReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      notifReq.flush(mockNotificationsPage);

      expect(component.loading()).toBe(false);
    });

    it('should reset error state on reload', () => {
      fixture.detectChanges();

      // Fail the first load
      const dashReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      dashReq.flush('error', { status: 500, statusText: 'Error' });
      httpTesting.match(() => true);

      expect(component.error()).toBe(true);

      // Reload
      component.load();
      expect(component.error()).toBe(false);
      expect(component.loading()).toBe(true);

      flushAllRequests();
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(false);
    });
  });
});
