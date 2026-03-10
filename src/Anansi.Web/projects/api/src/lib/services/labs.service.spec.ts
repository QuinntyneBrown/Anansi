import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { LabsService } from './labs.service';
import { LabPricingDto, SubmitLabOrderCommand } from '../models/store.models';
import { LabPartner } from '../models/enums';

describe('LabsService', () => {
  let service: LabsService;
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
    service = TestBed.inject(LabsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockLabPricing: LabPricingDto = {
    labName: 'WHCC',
    products: [
      {
        productName: '8x10 Print',
        variations: [
          { name: 'Glossy', costCents: 500 },
          { name: 'Matte', costCents: 550 },
        ],
      },
      {
        productName: '11x14 Print',
        variations: [
          { name: 'Glossy', costCents: 900 },
        ],
      },
    ],
  };

  describe('getPricing', () => {
    it('should GET /api/labs/pricing/{labName} and return LabPricingDto', () => {
      service.getPricing('WHCC').subscribe((result) => {
        expect(result).toEqual(mockLabPricing);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/labs/pricing/WHCC`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLabPricing);
    });

    it('should encode lab name in URL', () => {
      service.getPricing('ProDPI').subscribe((result) => {
        expect(result).toEqual({ ...mockLabPricing, labName: 'ProDPI' });
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/labs/pricing/ProDPI`);
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockLabPricing, labName: 'ProDPI' });
    });
  });

  describe('submitOrder', () => {
    it('should POST to /api/labs/orders with command body', () => {
      const command: SubmitLabOrderCommand = {
        orderId: 'order-1',
        labPartner: LabPartner.WHCC,
      };

      service.submitOrder(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/labs/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });
});
