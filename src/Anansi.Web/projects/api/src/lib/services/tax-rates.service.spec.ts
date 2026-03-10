import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { TaxRatesService } from './tax-rates.service';
import { CreateTaxRateRequest, TaxRateDto } from '../models/store.models';

describe('TaxRatesService', () => {
  let service: TaxRatesService;
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
    service = TestBed.inject(TaxRatesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockTaxRate: TaxRateDto = {
    id: 'tax-1',
    name: 'Ontario HST',
    region: 'ON',
    percentage: 13,
    isActive: true,
  };

  describe('list', () => {
    it('should GET /api/taxrates and return TaxRateDto[]', () => {
      const mockRates = [mockTaxRate];

      service.list().subscribe((result) => {
        expect(result).toEqual(mockRates);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/taxrates`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRates);
    });

    it('should return empty array when no tax rates exist', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/taxrates`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('create', () => {
    it('should POST to /api/taxrates with request body', () => {
      const request: CreateTaxRateRequest = {
        name: 'Ontario HST',
        region: 'ON',
        percentage: 13,
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockTaxRate);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/taxrates`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockTaxRate);
    });
  });
});
