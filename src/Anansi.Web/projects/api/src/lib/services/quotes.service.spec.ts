import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { QuotesService } from './quotes.service';
import { QuoteStatus } from '../models/enums';
import {
  CreateQuoteCommand,
  QuoteDto,
} from '../models/crm.models';

describe('QuotesService', () => {
  let service: QuotesService;
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
    service = TestBed.inject(QuotesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockQuote: QuoteDto = {
    id: 'quote-1',
    title: 'Wedding Photography Quote',
    contactId: 'contact-1',
    contactName: 'Jane Doe',
    status: QuoteStatus.Draft,
    totalCents: 300000,
    isTemplate: false,
    items: [
      {
        id: 'item-1',
        name: 'Full Day Coverage',
        description: '10 hours of photography',
        quantity: 1,
        unitPriceCents: 300000,
        totalCents: 300000,
        sortOrder: 1,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('create', () => {
    it('should POST to /api/quotes and return QuoteDto', () => {
      const command: CreateQuoteCommand = {
        title: 'Wedding Photography Quote',
        contactId: 'contact-1',
        isTemplate: false,
        items: [
          {
            name: 'Full Day Coverage',
            description: '10 hours of photography',
            quantity: 1,
            unitPriceCents: 300000,
            sortOrder: 1,
          },
        ],
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockQuote);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/quotes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockQuote);
    });
  });

  describe('get', () => {
    it('should GET /api/quotes/{id} and return QuoteDto', () => {
      service.get('quote-1').subscribe((result) => {
        expect(result).toEqual(mockQuote);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/quotes/quote-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockQuote);
    });
  });

  describe('accept', () => {
    it('should POST to /api/quotes/{id}/accept and return QuoteDto', () => {
      const acceptedQuote: QuoteDto = {
        ...mockQuote,
        status: QuoteStatus.Accepted,
        acceptedAt: '2026-01-15T00:00:00Z',
      };

      service.accept('quote-1').subscribe((result) => {
        expect(result).toEqual(acceptedQuote);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/quotes/quote-1/accept`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(acceptedQuote);
    });
  });
});
