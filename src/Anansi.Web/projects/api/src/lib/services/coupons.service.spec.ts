import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { CouponsService } from './coupons.service';
import { CouponDto, CreateCouponRequest } from '../models/store.models';
import { CouponScope, CouponType } from '../models/enums';

describe('CouponsService', () => {
  let service: CouponsService;
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
    service = TestBed.inject(CouponsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockCoupon: CouponDto = {
    id: 'coupon-1',
    code: 'SAVE20',
    couponType: CouponType.PercentageOff,
    scope: CouponScope.EntireOrder,
    percentageValue: 20,
    fixedAmountCents: undefined,
    minimumOrderCents: 1000,
    expirationDate: '2026-12-31T00:00:00Z',
    usageLimit: 100,
    timesUsed: 5,
    isActive: true,
    bannerText: 'Save 20%!',
    bannerColorHex: '#C9A962',
    showBanner: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/coupons and return CouponDto[]', () => {
      const mockCoupons = [mockCoupon];

      service.list().subscribe((result) => {
        expect(result).toEqual(mockCoupons);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/coupons`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCoupons);
    });

    it('should return empty array when no coupons exist', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/coupons`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('create', () => {
    it('should POST to /api/coupons with request body', () => {
      const request: CreateCouponRequest = {
        code: 'SAVE20',
        couponType: CouponType.PercentageOff,
        scope: CouponScope.EntireOrder,
        percentageValue: 20,
        minimumOrderCents: 1000,
        expirationDate: '2026-12-31T00:00:00Z',
        usageLimit: 100,
        bannerText: 'Save 20%!',
        bannerColorHex: '#C9A962',
        showBanner: true,
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockCoupon);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/coupons`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockCoupon);
    });
  });
});
