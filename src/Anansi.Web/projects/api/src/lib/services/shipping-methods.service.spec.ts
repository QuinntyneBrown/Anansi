import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { ShippingMethodsService } from './shipping-methods.service';
import { CreateShippingMethodRequest, ShippingMethodDto } from '../models/store.models';

describe('ShippingMethodsService', () => {
  let service: ShippingMethodsService;
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
    service = TestBed.inject(ShippingMethodsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockShippingMethod: ShippingMethodDto = {
    id: 'ship-1',
    name: 'Standard Shipping',
    description: '5-7 business days',
    costCents: 995,
    estimatedDelivery: '5-7 business days',
    isActive: true,
  };

  describe('list', () => {
    it('should GET /api/shippingmethods and return ShippingMethodDto[]', () => {
      const mockMethods = [mockShippingMethod];

      service.list().subscribe((result) => {
        expect(result).toEqual(mockMethods);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/shippingmethods`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMethods);
    });

    it('should return empty array when no shipping methods exist', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/shippingmethods`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('create', () => {
    it('should POST to /api/shippingmethods with request body', () => {
      const request: CreateShippingMethodRequest = {
        name: 'Standard Shipping',
        description: '5-7 business days',
        costCents: 995,
        estimatedDelivery: '5-7 business days',
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockShippingMethod);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/shippingmethods`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockShippingMethod);
    });
  });
});
