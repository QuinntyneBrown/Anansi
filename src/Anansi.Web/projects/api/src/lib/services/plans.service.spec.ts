import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { PlansService } from './plans.service';
import {
  ChangeSubscriptionRequest,
  CreatePlanRequest,
  CreateSubscriptionRequest,
  FeatureCheckResult,
  PlanDto,
  SubscriptionDto,
  UpdatePlanRequest,
} from '../models/system.models';

describe('PlansService', () => {
  let service: PlansService;
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
    service = TestBed.inject(PlansService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockPlan: PlanDto = {
    id: 'plan-1',
    product: 'Gallery',
    tier: 'Pro',
    name: 'Gallery Pro',
    description: 'Professional gallery plan',
    monthlyPriceCents: 2999,
    annualPriceCents: 29990,
    isSuiteBundle: false,
    isActive: true,
    featureGates: [
      {
        id: 'fg-1',
        featureKey: 'max_galleries',
        featureValue: 'unlimited',
        description: 'Unlimited galleries',
      },
    ],
  };

  const mockSubscription: SubscriptionDto = {
    id: 'sub-1',
    planId: 'plan-1',
    planName: 'Gallery Pro',
    planProduct: 'Gallery',
    planTier: 'Pro',
    billingInterval: 'Monthly',
    status: 'Active',
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    priceCents: 2999,
    prorationCreditCents: 0,
    cancelAtPeriodEnd: false,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockFeatureCheck: FeatureCheckResult = {
    featureKey: 'max_galleries',
    isAllowed: true,
    currentValue: 'unlimited',
  };

  describe('list', () => {
    it('should GET /api/plans without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([mockPlan]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([mockPlan]);
    });

    it('should GET /api/plans with product param', () => {
      service.list({ product: 'Gallery' }).subscribe((result) => {
        expect(result).toEqual([mockPlan]);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/plans`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('product')).toBe('Gallery');
      req.flush([mockPlan]);
    });
  });

  describe('create', () => {
    it('should POST to /api/plans', () => {
      const request: CreatePlanRequest = {
        product: 'Gallery',
        tier: 'Pro',
        name: 'Gallery Pro',
        description: 'Professional gallery plan',
        monthlyPriceCents: 2999,
        annualPriceCents: 29990,
        isSuiteBundle: false,
        featureGates: [
          {
            featureKey: 'max_galleries',
            featureValue: 'unlimited',
            description: 'Unlimited galleries',
          },
        ],
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockPlan);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockPlan);
    });
  });

  describe('update', () => {
    it('should PUT to /api/plans/{id}', () => {
      const request: UpdatePlanRequest = {
        name: 'Gallery Pro Updated',
        monthlyPriceCents: 3499,
        annualPriceCents: 34990,
        isActive: true,
      };

      service.update('plan-1', request).subscribe((result) => {
        expect(result).toEqual(mockPlan);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans/plan-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockPlan);
    });
  });

  describe('getSubscription', () => {
    it('should GET /api/plans/subscription', () => {
      service.getSubscription().subscribe((result) => {
        expect(result).toEqual(mockSubscription);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans/subscription`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSubscription);
    });
  });

  describe('createSubscription', () => {
    it('should POST to /api/plans/subscription', () => {
      const request: CreateSubscriptionRequest = {
        planId: 'plan-1',
        billingInterval: 'Monthly',
      };

      service.createSubscription(request).subscribe((result) => {
        expect(result).toEqual(mockSubscription);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans/subscription`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockSubscription);
    });
  });

  describe('changeSubscription', () => {
    it('should PUT to /api/plans/subscription', () => {
      const request: ChangeSubscriptionRequest = {
        newPlanId: 'plan-2',
        billingInterval: 'Annual',
      };

      service.changeSubscription(request).subscribe((result) => {
        expect(result).toEqual(mockSubscription);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans/subscription`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockSubscription);
    });
  });

  describe('cancelSubscription', () => {
    it('should DELETE /api/plans/subscription without params', () => {
      service.cancelSubscription().subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans/subscription`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(null);
    });

    it('should DELETE /api/plans/subscription with immediate=true', () => {
      service.cancelSubscription(true).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/plans/subscription`,
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.get('immediate')).toBe('true');
      req.flush(null);
    });

    it('should DELETE /api/plans/subscription with immediate=false', () => {
      service.cancelSubscription(false).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/plans/subscription`,
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.get('immediate')).toBe('false');
      req.flush(null);
    });
  });

  describe('checkFeature', () => {
    it('should GET /api/plans/features/{featureKey}', () => {
      service.checkFeature('max_galleries').subscribe((result) => {
        expect(result).toEqual(mockFeatureCheck);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/plans/features/max_galleries`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeatureCheck);
    });
  });
});
