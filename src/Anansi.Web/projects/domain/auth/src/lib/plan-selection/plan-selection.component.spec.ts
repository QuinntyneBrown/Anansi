import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, PlanDto } from 'api';
import { PlanSelectionComponent } from './plan-selection.component';

describe('PlanSelectionComponent', () => {
  let component: PlanSelectionComponent;
  let fixture: ComponentFixture<PlanSelectionComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockPlans: PlanDto[] = [
    {
      id: 'plan-1',
      product: 'suite',
      tier: 'Basic',
      name: 'Basic Plan',
      description: 'For getting started',
      monthlyPriceCents: 1900,
      annualPriceCents: 19000,
      isSuiteBundle: false,
      isActive: true,
      featureGates: [
        { id: 'fg-1', featureKey: 'galleries', featureValue: '5', description: 'Up to 5 galleries' },
        { id: 'fg-2', featureKey: 'storage', featureValue: '10gb', description: '10 GB storage' },
      ],
    },
    {
      id: 'plan-2',
      product: 'suite',
      tier: 'Pro',
      name: 'Pro Plan',
      description: 'For professionals',
      monthlyPriceCents: 3900,
      annualPriceCents: 39000,
      isSuiteBundle: false,
      isActive: true,
      featureGates: [
        { id: 'fg-3', featureKey: 'galleries', featureValue: 'unlimited', description: 'Unlimited galleries' },
        { id: 'fg-4', featureKey: 'storage', featureValue: '100gb', description: '100 GB storage' },
        { id: 'fg-5', featureKey: 'custom_domain', featureValue: 'true', description: 'Custom domain' },
      ],
    },
    {
      id: 'plan-3',
      product: 'suite',
      tier: 'Ultimate',
      name: 'Ultimate Plan',
      monthlyPriceCents: 5900,
      annualPriceCents: 59000,
      isSuiteBundle: true,
      isActive: true,
      featureGates: [
        { id: 'fg-6', featureKey: 'everything', featureValue: 'true', description: 'Everything in Pro' },
        { id: 'fg-7', featureKey: 'priority_support', featureValue: 'true', description: 'Priority support' },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSelectionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PlanSelectionComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
    req.flush(mockPlans);
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading()).toBe(true);
    expect(component.plans()).toEqual([]);

    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
    req.flush(mockPlans);
  });

  describe('load', () => {
    it('should load plans on init', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlans);

      expect(component.plans()).toEqual(mockPlans);
      expect(component.loading()).toBe(false);
    });

    it('should handle API error gracefully', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.plans()).toEqual([]);
      expect(component.loading()).toBe(false);
    });

    it('should render plan cards after loading', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const cards = el.querySelectorAll('.plan-card');
      expect(cards.length).toBe(3);
    });

    it('should show spinner while loading', () => {
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('lib-spinner')).toBeTruthy();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      expect(el.querySelector('.plan-selection__loading')).toBeFalsy();
    });
  });

  describe('isFeatured', () => {
    it('should return true for Pro tier (case insensitive)', () => {
      expect(component.isFeatured(mockPlans[1])).toBe(true);
    });

    it('should return false for non-Pro tiers', () => {
      expect(component.isFeatured(mockPlans[0])).toBe(false);
      expect(component.isFeatured(mockPlans[2])).toBe(false);
    });

    it('should apply featured styling to Pro card', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const featuredCards = el.querySelectorAll('.plan-card--featured');
      expect(featuredCards.length).toBe(1);
    });

    it('should show Most Popular badge on featured card', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const badges = el.querySelectorAll('.plan-card__badge');
      expect(badges.length).toBe(1);
    });
  });

  describe('formatPrice', () => {
    it('should format cents to dollar string', () => {
      expect(component.formatPrice(1900)).toBe('19');
      expect(component.formatPrice(3900)).toBe('39');
      expect(component.formatPrice(0)).toBe('0');
      expect(component.formatPrice(9999)).toBe('99');
    });
  });

  describe('onSelectPlan', () => {
    it('should emit planSelected with the selected plan', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);

      const spy = vi.fn();
      component.planSelected.subscribe(spy);

      component.onSelectPlan(mockPlans[0]);

      expect(spy).toHaveBeenCalledWith(mockPlans[0]);
    });

    it('should emit planSelected when Select button is clicked', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const spy = vi.fn();
      component.planSelected.subscribe(spy);

      const el = fixture.nativeElement as HTMLElement;
      const buttons = el.querySelectorAll('.plan-card lib-button button');
      (buttons[0] as HTMLButtonElement).click();

      expect(spy).toHaveBeenCalledWith(mockPlans[0]);
    });
  });

  describe('progress indicator', () => {
    it('should render progress steps', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const steps = el.querySelectorAll('.plan-selection__step');
      expect(steps.length).toBe(3);
      expect(steps[0].textContent).toContain('Choose Plan');
      expect(steps[0].classList.contains('plan-selection__step--active')).toBe(true);
      expect(steps[1].textContent).toContain('Business Info');
      expect(steps[2].textContent).toContain('Get Started');
    });
  });

  describe('feature list rendering', () => {
    it('should render feature gates for each plan', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const features = el.querySelectorAll('.plan-card__feature');
      // Basic: 2, Pro: 3, Ultimate: 2 = 7 total
      expect(features.length).toBe(7);
    });

    it('should fall back to featureKey when description is undefined', () => {
      const plansWithoutDesc: PlanDto[] = [{
        ...mockPlans[0],
        featureGates: [
          { id: 'fg-x', featureKey: 'raw_key', featureValue: 'true' },
        ],
      }];

      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(plansWithoutDesc);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const feature = el.querySelector('.plan-card__feature');
      expect(feature?.textContent).toContain('raw_key');
    });

    it('should render plan description when present', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/plans`);
      req.flush(mockPlans);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const descriptions = el.querySelectorAll('.plan-card__description');
      // Only Basic and Pro have descriptions
      expect(descriptions.length).toBe(2);
      expect(descriptions[0].textContent).toContain('For getting started');
    });
  });
});
