import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { OrdersService } from './orders.service';
import { PagedList } from '../models/common';
import {
  CreateOrderRequest,
  OrderDto,
  UpdateOrderStatusRequest,
} from '../models/store.models';
import { FulfillmentType, OrderStatus, PaymentMethod } from '../models/enums';

describe('OrdersService', () => {
  let service: OrdersService;
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
    service = TestBed.inject(OrdersService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockOrder: OrderDto = {
    id: 'order-1',
    clientName: 'Jane Doe',
    clientEmail: 'jane@example.com',
    clientPhone: '555-1234',
    shippingAddress: '123 Main St',
    shippingCity: 'Toronto',
    shippingProvince: 'ON',
    shippingPostalCode: 'M5V 1A1',
    shippingCountry: 'CA',
    status: OrderStatus.Pending,
    paymentMethod: PaymentMethod.CreditCard,
    fulfillmentType: FulfillmentType.Lab,
    subtotalCents: 5000,
    taxCents: 650,
    shippingCents: 500,
    discountCents: 0,
    totalCents: 6150,
    commissionCents: 0,
    commissionPercentage: 0,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: '8x10 Print',
        productVariationId: 'var-1',
        variationName: 'Glossy',
        quantity: 2,
        unitPriceCents: 2500,
        totalCents: 5000,
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  };

  const mockPagedList: PagedList<OrderDto> = {
    items: [mockOrder],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  describe('list', () => {
    it('should GET /api/orders without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedList);
    });

    it('should GET /api/orders with all params', () => {
      service.list({
        status: OrderStatus.Processing,
        search: 'jane',
        page: 1,
        pageSize: 10,
      }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/orders`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('Processing');
      expect(req.request.params.get('search')).toBe('jane');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedList);
    });

    it('should GET /api/orders with partial params', () => {
      service.list({ status: OrderStatus.Shipped }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/orders`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('Shipped');
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedList);
    });
  });

  describe('get', () => {
    it('should GET /api/orders/{id}', () => {
      service.get('order-1').subscribe((result) => {
        expect(result).toEqual(mockOrder);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/orders/order-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });
  });

  describe('create', () => {
    it('should POST to /api/orders with request body', () => {
      const request: CreateOrderRequest = {
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        clientPhone: '555-1234',
        shippingAddress: '123 Main St',
        shippingCity: 'Toronto',
        shippingProvince: 'ON',
        shippingPostalCode: 'M5V 1A1',
        shippingCountry: 'CA',
        paymentMethod: PaymentMethod.CreditCard,
        items: [
          {
            productId: 'prod-1',
            productVariationId: 'var-1',
            quantity: 2,
          },
        ],
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockOrder);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockOrder);
    });
  });

  describe('updateStatus', () => {
    it('should PUT to /api/orders/{id}/status with request body', () => {
      const request: UpdateOrderStatusRequest = {
        status: OrderStatus.Shipped,
        trackingNumber: 'TRACK-123',
        trackingUrl: 'https://tracking.example.com/TRACK-123',
      };
      const updatedOrder = { ...mockOrder, status: OrderStatus.Shipped };

      service.updateStatus('order-1', request).subscribe((result) => {
        expect(result).toEqual(updatedOrder);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/orders/order-1/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(updatedOrder);
    });
  });
});
