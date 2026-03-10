import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { PriceSheetsService } from './price-sheets.service';
import { CreatePriceSheetRequest, PriceSheetDto } from '../models/store.models';

describe('PriceSheetsService', () => {
  let service: PriceSheetsService;
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
    service = TestBed.inject(PriceSheetsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockPriceSheet: PriceSheetDto = {
    id: 'ps-1',
    name: 'Standard Pricing',
    description: 'Default price sheet for all galleries',
    isDownloadOnly: false,
    isDefault: true,
    items: [
      {
        id: 'psi-1',
        productVariationId: 'var-1',
        productVariationName: '8x10 Glossy',
        priceCents: 2500,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/pricesheets and return PriceSheetDto[]', () => {
      const mockPriceSheets = [mockPriceSheet];

      service.list().subscribe((result) => {
        expect(result).toEqual(mockPriceSheets);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/pricesheets`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPriceSheets);
    });

    it('should return empty array when no price sheets exist', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/pricesheets`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('create', () => {
    it('should POST to /api/pricesheets with request body', () => {
      const request: CreatePriceSheetRequest = {
        name: 'Standard Pricing',
        description: 'Default price sheet for all galleries',
        isDownloadOnly: false,
        isDefault: true,
        items: [
          {
            productVariationId: 'var-1',
            priceCents: 2500,
          },
        ],
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockPriceSheet);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/pricesheets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockPriceSheet);
    });
  });
});
