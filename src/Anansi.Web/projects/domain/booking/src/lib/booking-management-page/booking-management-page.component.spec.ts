import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  API_CONFIG,
  BookingRecordDto,
  BookingStatus,
  PagedList,
} from 'api';
import { BookingManagementPageComponent } from './booking-management-page.component';

describe('BookingManagementPageComponent', () => {
  let component: BookingManagementPageComponent;
  let fixture: ComponentFixture<BookingManagementPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockBookings: BookingRecordDto[] = [
    {
      id: 'b-1',
      sessionTypeId: 'st-1',
      sessionTypeName: 'Portrait Session',
      clientFirstName: 'Jane',
      clientLastName: 'Doe',
      clientEmail: 'jane@example.com',
      startTime: '2025-06-15T10:00:00',
      endTime: '2025-06-15T11:30:00',
      status: BookingStatus.Pending,
      amountPaidCents: 0,
      discountCents: 0,
      createdAt: '2025-06-01T00:00:00Z',
    },
    {
      id: 'b-2',
      sessionTypeId: 'st-2',
      sessionTypeName: 'Mini Session',
      clientFirstName: 'John',
      clientLastName: 'Smith',
      clientEmail: 'john@example.com',
      startTime: '2025-06-16T14:00:00',
      endTime: '2025-06-16T14:30:00',
      status: BookingStatus.Confirmed,
      amountPaidCents: 10000,
      discountCents: 0,
      createdAt: '2025-06-02T00:00:00Z',
    },
  ];

  const mockPagedList: PagedList<BookingRecordDto> = {
    items: mockBookings,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingManagementPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingManagementPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: PagedList<BookingRecordDto> = mockPagedList): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    flushInitialLoad();
    expect(component.bookings()).toEqual(mockBookings);
    expect(component.loading()).toBe(false);
    expect(component.totalCount()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?page=1&pageSize=10`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should filter by status tab', () => {
    flushInitialLoad();

    component.onTabChange(BookingStatus.Pending);
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?status=Pending&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe(BookingStatus.Pending);
  });

  it('should reset page when switching tabs', () => {
    flushInitialLoad();
    component.currentPage.set(3);

    component.onTabChange(BookingStatus.Confirmed);
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?status=Confirmed&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should load all when All tab selected', () => {
    flushInitialLoad();

    component.onTabChange(BookingStatus.Pending);
    const pendingReq = httpTesting.expectOne(`${baseUrl}/api/bookings?status=Pending&page=1&pageSize=10`);
    pendingReq.flush(mockPagedList);

    component.onTabChange('All');
    const allReq = httpTesting.expectOne(`${baseUrl}/api/bookings?page=1&pageSize=10`);
    allReq.flush(mockPagedList);
  });

  it('should apply date filter', () => {
    flushInitialLoad();

    component.fromDate = '2025-06-01';
    component.toDate = '2025-06-30';
    component.applyDateFilter();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?from=2025-06-01&to=2025-06-30&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList);
  });

  it('should reset page when applying date filter', () => {
    flushInitialLoad();
    component.currentPage.set(5);

    component.fromDate = '2025-06-01';
    component.applyDateFilter();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?from=2025-06-01&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should combine status and date filters', () => {
    flushInitialLoad();

    component.onTabChange(BookingStatus.Pending);
    const tabReq = httpTesting.expectOne(`${baseUrl}/api/bookings?status=Pending&page=1&pageSize=10`);
    tabReq.flush(mockPagedList);

    component.fromDate = '2025-06-01';
    component.toDate = '2025-06-30';
    component.applyDateFilter();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/bookings?status=Pending&from=2025-06-01&to=2025-06-30&page=1&pageSize=10`,
    );
    req.flush(mockPagedList);
  });

  it('should confirm a pending booking', () => {
    flushInitialLoad();

    component.onConfirm(mockBookings[0]);

    const confirmReq = httpTesting.expectOne(`${baseUrl}/api/bookings/b-1/confirm`);
    expect(confirmReq.request.method).toBe('PUT');
    expect(confirmReq.request.body).toEqual({ id: 'b-1' });
    confirmReq.flush(null);

    // After confirm, it reloads
    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/bookings?page=1&pageSize=10`);
    reloadReq.flush(mockPagedList);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockBookings,
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?page=2&pageSize=10`);
    req.flush({
      items: [],
      page: 2,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
      hasPrevious: true,
      hasNext: false,
    });

    expect(component.currentPage()).toBe(2);
  });

  it('should navigate to previous page', () => {
    flushInitialLoad();

    component.currentPage.set(2);
    component.totalPages.set(3);
    component.onPreviousPage();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(`${baseUrl}/api/bookings?page=0&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(`${baseUrl}/api/bookings?page=2&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should return correct badge variant for each status', () => {
    flushInitialLoad();
    expect(component.getBadgeVariant(BookingStatus.Confirmed)).toBe('success');
    expect(component.getBadgeVariant(BookingStatus.Pending)).toBe('warning');
    expect(component.getBadgeVariant(BookingStatus.Cancelled)).toBe('error');
    expect(component.getBadgeVariant(BookingStatus.Declined)).toBe('error');
    expect(component.getBadgeVariant(BookingStatus.NoShow)).toBe('error');
    expect(component.getBadgeVariant(BookingStatus.Completed)).toBe('neutral');
  });

  it('should format date time correctly', () => {
    flushInitialLoad();
    const formatted = component.formatDateTime('2025-06-15T10:00:00');
    expect(formatted).toContain('Jun');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2025');
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings?page=1&pageSize=10`);
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should show empty state when no bookings', () => {
    flushInitialLoad({
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    });
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should render booking rows', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('lib-table-data-row');
    expect(rows.length).toBe(2);
  });

  it('should display client name in table', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const clientCols = fixture.nativeElement.querySelectorAll('.col-client');
    // First is the header, rest are data
    const dataClientCols = Array.from(clientCols).slice(1);
    expect((dataClientCols[0] as any).textContent.trim()).toBe('Jane Doe');
  });

  it('should display session type name in table', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const sessionCols = fixture.nativeElement.querySelectorAll('.col-session');
    const dataSessionCols = Array.from(sessionCols).slice(1);
    expect((dataSessionCols[0] as any).textContent.trim()).toBe('Portrait Session');
  });

  it('should show Confirm button only for Pending bookings', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('lib-table-data-row');
    const pendingRow = rows[0];
    const confirmedRow = rows[1];

    const pendingBtn = pendingRow.querySelector('lib-button[variant="primary"]');
    const confirmedBtn = confirmedRow.querySelector('lib-button[variant="primary"]');

    expect(pendingBtn).toBeTruthy();
    expect(confirmedBtn).toBeFalsy();
  });

  it('should display pagination info', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const info = fixture.nativeElement.querySelector('.pagination-info');
    expect(info.textContent).toContain('Showing 2 of 2');
  });

  it('should have correct tabs', () => {
    flushInitialLoad();
    expect(component.tabs.length).toBe(4);
    expect(component.tabs.map((t) => t.value)).toEqual(['All', 'Pending', 'Confirmed', 'Completed']);
  });

  it('should expose BookingStatus for template', () => {
    flushInitialLoad();
    expect(component.BookingStatus).toBe(BookingStatus);
  });
});
