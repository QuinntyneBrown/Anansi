import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { GiftCardsService } from './gift-cards.service';
import { CreateGiftCardRequest, GiftCardDto } from '../models/store.models';

describe('GiftCardsService', () => {
  let service: GiftCardsService;
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
    service = TestBed.inject(GiftCardsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockGiftCard: GiftCardDto = {
    id: 'gc-1',
    code: 'GIFT-ABCD-1234',
    originalAmountCents: 5000,
    balanceCents: 3500,
    expiryDate: '2027-01-01T00:00:00Z',
    recipientEmail: 'recipient@example.com',
    recipientName: 'Alice',
    senderName: 'Bob',
    message: 'Happy Birthday!',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/giftcards and return GiftCardDto[]', () => {
      const mockGiftCards = [mockGiftCard];

      service.list().subscribe((result) => {
        expect(result).toEqual(mockGiftCards);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/giftcards`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGiftCards);
    });

    it('should return empty array when no gift cards exist', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/giftcards`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('create', () => {
    it('should POST to /api/giftcards with request body', () => {
      const request: CreateGiftCardRequest = {
        amountCents: 5000,
        expiryDate: '2027-01-01T00:00:00Z',
        recipientEmail: 'recipient@example.com',
        recipientName: 'Alice',
        senderName: 'Bob',
        message: 'Happy Birthday!',
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockGiftCard);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/giftcards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockGiftCard);
    });
  });
});
