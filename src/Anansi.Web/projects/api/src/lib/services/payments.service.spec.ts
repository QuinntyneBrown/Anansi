import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { PaymentsService } from './payments.service';
import { PagedList } from '../models/common';
import { PaymentMethod } from '../models/enums';
import { GiftCardDto } from '../models/store.models';
import {
  ApplyForFinancingCommand,
  CreateGiftCardCommand,
  FinancingApplicationDto,
  PaymentRecordDto,
  RecordPaymentCommand,
  RedeemGiftCardCommand,
  RevenueDashboardDto,
} from '../models/system.models';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(PaymentsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockPaymentRecord: PaymentRecordDto = {
    id: 'pay-1',
    amountCents: 10000,
    feeCents: 300,
    netAmountCents: 9700,
    tipCents: 500,
    taxCents: 1300,
    currency: 'USD',
    paymentMethod: PaymentMethod.CreditCard,
    description: 'Wedding session payment',
    isOffline: false,
    isRefund: false,
    createdAt: '2026-01-15T00:00:00Z',
  };

  const mockPagedList: PagedList<PaymentRecordDto> = {
    items: [mockPaymentRecord],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const mockDashboard: RevenueDashboardDto = {
    totalRevenueCents: 500000,
    netRevenueCents: 485000,
    totalFeesCents: 15000,
    totalRefundsCents: 0,
    totalTipsCents: 5000,
    totalTaxCents: 65000,
    paymentMethodBreakdown: [
      { paymentMethod: PaymentMethod.CreditCard, totalCents: 400000, count: 10 },
    ],
    paidInvoiceCount: 8,
    pendingInvoiceCount: 2,
    overdueInvoiceCount: 1,
  };

  const mockGiftCard: GiftCardDto = {
    id: 'gc-1',
    code: 'GIFT-ABC123',
    originalAmountCents: 5000,
    balanceCents: 5000,
    recipientEmail: 'client@example.com',
    recipientName: 'Jane Doe',
    senderName: 'John Photo',
    message: 'Enjoy your session!',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockFinancing: FinancingApplicationDto = {
    id: 'fin-1',
    requestedAmountCents: 100000,
    offeredAmountCents: 100000,
    flatFeeCents: 5000,
    repaymentPercentage: 10,
    repaidCents: 0,
    status: 'Approved',
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('record', () => {
    it('should POST to /api/payments', () => {
      const command: RecordPaymentCommand = {
        amountCents: 10000,
        tipCents: 500,
        taxCents: 1300,
        currency: 'USD',
        paymentMethod: PaymentMethod.CreditCard,
        description: 'Wedding session payment',
        isOffline: false,
      };

      service.record(command).subscribe((result) => {
        expect(result).toEqual(mockPaymentRecord);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/payments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockPaymentRecord);
    });
  });

  describe('getDashboard', () => {
    it('should GET /api/payments/dashboard without params', () => {
      service.getDashboard().subscribe((result) => {
        expect(result).toEqual(mockDashboard);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/payments/dashboard`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockDashboard);
    });

    it('should GET /api/payments/dashboard with date range', () => {
      service.getDashboard({ from: '2024-01-01', to: '2024-12-31' }).subscribe((result) => {
        expect(result).toEqual(mockDashboard);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('from')).toBe('2024-01-01');
      expect(req.request.params.get('to')).toBe('2024-12-31');
      req.flush(mockDashboard);
    });

    it('should GET /api/payments/dashboard with partial params', () => {
      service.getDashboard({ from: '2024-06-01' }).subscribe((result) => {
        expect(result).toEqual(mockDashboard);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/dashboard`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('from')).toBe('2024-06-01');
      expect(req.request.params.has('to')).toBe(false);
      req.flush(mockDashboard);
    });
  });

  describe('listTransactions', () => {
    it('should GET /api/payments/transactions without params', () => {
      service.listTransactions().subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/payments/transactions`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedList);
    });

    it('should GET /api/payments/transactions with all params', () => {
      service.listTransactions({
        method: PaymentMethod.PayPal,
        search: 'wedding',
        from: '2024-01-01',
        to: '2024-12-31',
        page: 2,
        pageSize: 10,
      }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('method')).toBe('PayPal');
      expect(req.request.params.get('search')).toBe('wedding');
      expect(req.request.params.get('from')).toBe('2024-01-01');
      expect(req.request.params.get('to')).toBe('2024-12-31');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedList);
    });

    it('should GET /api/payments/transactions with partial params', () => {
      service.listTransactions({ page: 3, method: PaymentMethod.CreditCard }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/payments/transactions`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('method')).toBe('CreditCard');
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.has('from')).toBe(false);
      expect(req.request.params.has('to')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedList);
    });
  });

  describe('exportTransactions', () => {
    it('should export transactions', () => {
      const blob = new Blob(['csv-data'], { type: 'text/csv' });
      service.exportTransactions({ from: '2024-01-01', to: '2024-12-31' }).subscribe(result => {
        expect(result).toBeInstanceOf(Blob);
      });
      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/payments/export`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('from')).toBe('2024-01-01');
      expect(req.request.params.get('to')).toBe('2024-12-31');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });

    it('should export transactions without params', () => {
      const blob = new Blob(['csv-data'], { type: 'text/csv' });
      service.exportTransactions().subscribe(result => {
        expect(result).toBeInstanceOf(Blob);
      });
      const req = httpTesting.expectOne(`${baseUrl}/api/payments/export`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });
  });

  describe('createGiftCard', () => {
    it('should POST to /api/payments/gift-cards', () => {
      const command: CreateGiftCardCommand = {
        amountCents: 5000,
        recipientEmail: 'client@example.com',
        recipientName: 'Jane Doe',
        senderName: 'John Photo',
        message: 'Enjoy your session!',
      };

      service.createGiftCard(command).subscribe((result) => {
        expect(result).toEqual(mockGiftCard);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/payments/gift-cards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockGiftCard);
    });
  });

  describe('redeemGiftCard', () => {
    it('should POST to /api/payments/gift-cards/redeem', () => {
      const command: RedeemGiftCardCommand = {
        code: 'GIFT-ABC123',
        invoiceId: 'inv-1',
      };

      service.redeemGiftCard(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/payments/gift-cards/redeem`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('applyForFinancing', () => {
    it('should POST to /api/payments/financing/apply', () => {
      const command: ApplyForFinancingCommand = {
        requestedAmountCents: 100000,
      };

      service.applyForFinancing(command).subscribe((result) => {
        expect(result).toEqual(mockFinancing);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/payments/financing/apply`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockFinancing);
    });
  });

  describe('getFinancing', () => {
    it('should GET /api/payments/financing/{id}', () => {
      service.getFinancing('fin-1').subscribe((result) => {
        expect(result).toEqual(mockFinancing);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/payments/financing/fin-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFinancing);
    });
  });
});
