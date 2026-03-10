import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { API_CONFIG } from 'api';
import { RevenueDashboardPageComponent } from './revenue-dashboard-page.component';

describe('RevenueDashboardPageComponent', () => {
  let component: RevenueDashboardPageComponent;
  let fixture: ComponentFixture<RevenueDashboardPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockDashboard = {
    totalRevenueCents: 500000,
    netRevenueCents: 485000,
    totalFeesCents: 15000,
    totalRefundsCents: 0,
    totalTipsCents: 5000,
    totalTaxCents: 65000,
    paymentMethodBreakdown: [
      { paymentMethod: 'CreditCard', totalCents: 400000, count: 10 },
      { paymentMethod: 'PayPal', totalCents: 100000, count: 5 },
    ],
    paidInvoiceCount: 8,
    pendingInvoiceCount: 2,
    overdueInvoiceCount: 1,
  };

  const mockTransactionsList = {
    items: [
      {
        id: 'tx-1',
        contactId: 'contact-1',
        amountCents: 25000,
        feeCents: 750,
        netAmountCents: 24250,
        tipCents: 500,
        taxCents: 3250,
        currency: 'USD',
        paymentMethod: 'CreditCard',
        description: 'Wedding session',
        isOffline: false,
        isRefund: false,
        createdAt: '2026-02-15T00:00:00Z',
      },
      {
        id: 'tx-2',
        amountCents: 15000,
        feeCents: 450,
        netAmountCents: 14550,
        tipCents: 0,
        taxCents: 1950,
        currency: 'USD',
        paymentMethod: 'PayPal',
        description: 'Portrait session',
        isOffline: false,
        isRefund: false,
        createdAt: '2026-02-20T00:00:00Z',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueDashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueDashboardPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
    expect(dashReq.request.method).toBe('GET');
    dashReq.flush(mockDashboard);

    const txReq = httpTesting.expectOne(
      (r) => r.url === `${baseUrl}/api/payments/transactions`,
    );
    expect(txReq.request.method).toBe('GET');
    expect(txReq.request.params.get('pageSize')).toBe('10');
    txReq.flush(mockTransactionsList);
  }

  describe('initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      flushInitialRequests();
      expect(component).toBeTruthy();
    });

    it('should start in loading state', () => {
      expect(component.loading()).toBe(true);
      fixture.detectChanges();
      flushInitialRequests();
    });

    it('should call getDashboard and listTransactions on init', () => {
      fixture.detectChanges();
      flushInitialRequests();

      expect(component.loading()).toBe(false);
      expect(component.dashboard()).toEqual(mockDashboard);
      expect(component.transactions().length).toBe(2);
    });

    it('should have default date range signals', () => {
      fixture.detectChanges();
      flushInitialRequests();

      expect(component.dateFrom()).toBe('Jan 1, 2026');
      expect(component.dateTo()).toBe('Mar 10, 2026');
    });
  });

  describe('metric values', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushInitialRequests();
      fixture.detectChanges();
    });

    it('should display total revenue from dashboard', () => {
      const el = fixture.nativeElement as HTMLElement;
      const metrics = el.querySelectorAll('lib-metric-card');
      expect(metrics.length).toBe(4);
    });

    it('should set dashboard data correctly', () => {
      expect(component.dashboard()!.totalRevenueCents).toBe(500000);
      expect(component.dashboard()!.netRevenueCents).toBe(485000);
      expect(component.dashboard()!.totalTaxCents).toBe(65000);
      expect(component.dashboard()!.totalTipsCents).toBe(5000);
    });
  });

  describe('barHeights computed', () => {
    it('should compute bar heights as percentages relative to max', () => {
      fixture.detectChanges();
      flushInitialRequests();

      const heights = component.barHeights();
      expect(heights.length).toBe(2);
      expect(heights[0]).toBe(100);
      expect(heights[1]).toBe(25);
    });

    it('should return empty array when dashboard is null', () => {
      expect(component.barHeights()).toEqual([]);
      fixture.detectChanges();
      flushInitialRequests();
    });

    it('should return empty array when breakdown is empty', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      dashReq.flush({
        ...mockDashboard,
        paymentMethodBreakdown: [],
      });

      const txReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      txReq.flush(mockTransactionsList);

      expect(component.barHeights()).toEqual([]);
    });

    it('should handle all-zero values', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      dashReq.flush({
        ...mockDashboard,
        paymentMethodBreakdown: [
          { paymentMethod: 'CreditCard', totalCents: 0, count: 0 },
          { paymentMethod: 'PayPal', totalCents: 0, count: 0 },
        ],
      });

      const txReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      txReq.flush(mockTransactionsList);

      expect(component.barHeights()).toEqual([0, 0]);
    });

    it('should handle single value breakdown', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      dashReq.flush({
        ...mockDashboard,
        paymentMethodBreakdown: [
          { paymentMethod: 'CreditCard', totalCents: 200000, count: 5 },
        ],
      });

      const txReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      txReq.flush(mockTransactionsList);

      expect(component.barHeights()).toEqual([100]);
    });
  });

  describe('formatCurrency', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushInitialRequests();
    });

    it('should format cents to dollar string', () => {
      expect(component.formatCurrency(500000)).toBe('$5,000.00');
    });

    it('should format zero cents', () => {
      expect(component.formatCurrency(0)).toBe('$0.00');
    });

    it('should format small amounts', () => {
      expect(component.formatCurrency(99)).toBe('$0.99');
    });

    it('should format single cent', () => {
      expect(component.formatCurrency(1)).toBe('$0.01');
    });

    it('should format large amounts', () => {
      expect(component.formatCurrency(1000000)).toBe('$10,000.00');
    });
  });

  describe('exportCsv', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushInitialRequests();
    });

    it('should call exportTransactions and trigger file download', () => {
      const mockBlob = new Blob(['col1,col2\nval1,val2'], {
        type: 'text/csv',
      });

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/fake-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          return { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });

      component.exportCsv();

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/export`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('from')).toBe(component.dateFrom());
      expect(req.request.params.get('to')).toBe(component.dateTo());
      req.flush(mockBlob);

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/fake-url');

      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should pass date range params to export service', () => {
      component.dateFrom.set('2025-01-01');
      component.dateTo.set('2025-12-31');

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          return { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });

      component.exportCsv();

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/export`,
      );
      expect(req.request.params.get('from')).toBe('2025-01-01');
      expect(req.request.params.get('to')).toBe('2025-12-31');
      req.flush(new Blob(['data']));

      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('loading state', () => {
    it('should show spinner while loading', () => {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('lib-spinner')).toBeTruthy();
      flushInitialRequests();
    });

    it('should hide spinner after data loads', () => {
      fixture.detectChanges();
      flushInitialRequests();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading-container lib-spinner')).toBeFalsy();
    });
  });

  describe('error state', () => {
    it('should show error when dashboard request fails', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      dashReq.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      fixture.detectChanges();

      expect(component.error()).toBe(true);
      expect(component.loading()).toBe(false);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.error-text')).toBeTruthy();
    });

    it('should show error when transactions request fails', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      dashReq.flush(mockDashboard);

      const txReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      txReq.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      fixture.detectChanges();

      expect(component.error()).toBe(true);
      expect(component.loading()).toBe(false);
    });

    it('should reload data when retry is clicked', () => {
      fixture.detectChanges();

      const dashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      dashReq.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      fixture.detectChanges();
      expect(component.error()).toBe(true);

      component.reload();

      const retryDashReq = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      retryDashReq.flush(mockDashboard);

      const retryTxReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      retryTxReq.flush(mockTransactionsList);

      expect(component.error()).toBe(false);
      expect(component.loading()).toBe(false);
      expect(component.dashboard()).toEqual(mockDashboard);
    });
  });

  describe('transactions table', () => {
    it('should display transaction rows', () => {
      fixture.detectChanges();
      flushInitialRequests();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const rows = el.querySelectorAll('lib-table-data-row');
      expect(rows.length).toBe(2);
    });

    it('should display N/A for missing contactId', () => {
      fixture.detectChanges();
      flushInitialRequests();
      fixture.detectChanges();

      const secondTx = component.transactions()[1];
      expect(secondTx.contactId).toBeUndefined();
    });
  });
});
