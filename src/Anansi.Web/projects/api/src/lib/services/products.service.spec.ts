import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { ProductsService } from './products.service';
import { PagedList } from '../models/common';
import {
  BulkMarkupRequest,
  CreateProductRequest,
  ProductDto,
  UpdateProductRequest,
} from '../models/store.models';
import { FulfillmentType, ProductType } from '../models/enums';

describe('ProductsService', () => {
  let service: ProductsService;
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
    service = TestBed.inject(ProductsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockProduct: ProductDto = {
    id: 'prod-1',
    name: '8x10 Print',
    description: 'Glossy 8x10 print',
    productType: ProductType.Print,
    fulfillmentType: FulfillmentType.Lab,
    isActive: true,
    labPartner: undefined,
    labColorCorrectionEnabled: false,
    previewImageUrl: undefined,
    digitalResolutionOptions: undefined,
    variations: [
      {
        id: 'var-1',
        name: 'Glossy',
        sku: 'PRINT-8x10-G',
        costCents: 500,
        markupCents: 1000,
        priceCents: 1500,
        isCustomPriced: false,
        isActive: true,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockPagedList: PagedList<ProductDto> = {
    items: [mockProduct],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  describe('list', () => {
    it('should GET /api/products without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/products`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedList);
    });

    it('should GET /api/products with all params', () => {
      service.list({ productType: ProductType.Print, page: 2, pageSize: 10 }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/products`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('productType')).toBe('Print');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedList);
    });

    it('should GET /api/products with partial params', () => {
      service.list({ page: 3 }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/products`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.has('productType')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedList);
    });
  });

  describe('get', () => {
    it('should GET /api/products/{id}', () => {
      service.get('prod-1').subscribe((result) => {
        expect(result).toEqual(mockProduct);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/products/prod-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });

  describe('create', () => {
    it('should POST to /api/products with request body', () => {
      const request: CreateProductRequest = {
        name: '8x10 Print',
        productType: ProductType.Print,
        fulfillmentType: FulfillmentType.Lab,
        labColorCorrectionEnabled: false,
        variations: [
          {
            name: 'Glossy',
            sku: 'PRINT-8x10-G',
            costCents: 500,
            markupCents: 1000,
            priceCents: 1500,
          },
        ],
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockProduct);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockProduct);
    });
  });

  describe('update', () => {
    it('should PUT to /api/products/{id} with request body', () => {
      const request: UpdateProductRequest = {
        name: 'Updated 8x10 Print',
        isActive: true,
        labColorCorrectionEnabled: true,
      };

      service.update('prod-1', request).subscribe((result) => {
        expect(result).toEqual(mockProduct);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/products/prod-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockProduct);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/products/{id}', () => {
      service.delete('prod-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/products/prod-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('bulkMarkup', () => {
    it('should POST to /api/products/bulk-markup with request body', () => {
      const request: BulkMarkupRequest = {
        productType: ProductType.Print,
        markupPercentage: 200,
        overrideCustomPriced: false,
      };
      const mockResponse = { updatedCount: 15 };

      service.bulkMarkup(request).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/products/bulk-markup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });
});
