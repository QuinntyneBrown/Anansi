import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { InvoicesService } from './invoices.service';
import { PagedList } from '../models/common';
import { InvoiceStatus } from '../models/enums';
import {
  CreateInvoiceCommand,
  InvoiceDto,
  InvoiceListParams,
} from '../models/crm.models';

describe('InvoicesService', () => {
  let service: InvoicesService;
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
    service = TestBed.inject(InvoicesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockInvoice: InvoiceDto = {
    id: 'invoice-1',
    invoiceNumber: 'INV-001',
    title: 'Wedding Photography',
    contactId: 'contact-1',
    contactName: 'Jane Doe',
    status: InvoiceStatus.Draft,
    dueDate: '2026-02-01T00:00:00Z',
    subtotalCents: 250000,
    taxRatePercent: 13,
    taxAmountCents: 32500,
    discountCents: 0,
    totalCents: 282500,
    paidCents: 0,
    tipsEnabled: true,
    tipAmountCents: 0,
    autoRemindersEnabled: true,
    isTemplate: false,
    lineItems: [
      {
        id: 'item-1',
        name: 'Wedding Photography Package',
        description: '8 hours of coverage',
        quantity: 1,
        unitPriceCents: 250000,
        totalCents: 250000,
        sortOrder: 1,
      },
    ],
    paymentSchedules: [
      {
        id: 'sched-1',
        label: 'Deposit',
        amountCents: 100000,
        dueDate: '2026-01-15T00:00:00Z',
        isPaid: false,
        sortOrder: 1,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('create', () => {
    it('should POST to /api/invoices and return InvoiceDto', () => {
      const command: CreateInvoiceCommand = {
        title: 'Wedding Photography',
        contactId: 'contact-1',
        dueDate: '2026-02-01T00:00:00Z',
        taxRatePercent: 13,
        discountCents: 0,
        tipsEnabled: true,
        autoRemindersEnabled: true,
        isTemplate: false,
        lineItems: [
          {
            name: 'Wedding Photography Package',
            description: '8 hours of coverage',
            quantity: 1,
            unitPriceCents: 250000,
            sortOrder: 1,
          },
        ],
        paymentSchedules: [
          {
            label: 'Deposit',
            amountCents: 100000,
            dueDate: '2026-01-15T00:00:00Z',
            sortOrder: 1,
          },
        ],
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockInvoice);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/invoices`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockInvoice);
    });
  });

  describe('get', () => {
    it('should GET /api/invoices/{id} and return InvoiceDto', () => {
      service.get('invoice-1').subscribe((result) => {
        expect(result).toEqual(mockInvoice);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/invoices/invoice-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoice);
    });
  });

  describe('list', () => {
    const mockPagedResponse: PagedList<InvoiceDto> = {
      items: [mockInvoice],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    };

    it('should GET /api/invoices without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/invoices`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedResponse);
    });

    it('should GET /api/invoices with all query params', () => {
      const params: InvoiceListParams = {
        status: InvoiceStatus.Sent,
        isTemplate: false,
        page: 1,
        pageSize: 25,
      };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/invoices`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe(InvoiceStatus.Sent);
      expect(req.request.params.get('isTemplate')).toBe('false');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('25');
      req.flush(mockPagedResponse);
    });

    it('should GET /api/invoices with partial params', () => {
      const params: InvoiceListParams = { status: InvoiceStatus.Overdue };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/invoices`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe(InvoiceStatus.Overdue);
      expect(req.request.params.has('isTemplate')).toBe(false);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedResponse);
    });
  });
});
