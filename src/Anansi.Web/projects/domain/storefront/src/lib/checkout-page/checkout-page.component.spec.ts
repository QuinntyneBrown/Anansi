import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  API_CONFIG,
  ProductDto,
  ProductType,
  FulfillmentType,
  OrderDto,
  OrderStatus,
  PaymentMethod,
} from 'api';
import { CheckoutPageComponent, CartItem } from './checkout-page.component';

describe('CheckoutPageComponent', () => {
  let component: CheckoutPageComponent;
  let fixture: ComponentFixture<CheckoutPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockProduct: ProductDto = {
    id: 'p1',
    name: '8x10 Print',
    productType: ProductType.Print,
    fulfillmentType: FulfillmentType.Lab,
    isActive: true,
    labColorCorrectionEnabled: false,
    variations: [
      { id: 'v1', name: 'Glossy', priceCents: 2500, costCents: 500, markupCents: 2000, isCustomPriced: false, isActive: true },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockProduct2: ProductDto = {
    id: 'p2',
    name: 'Canvas Wrap',
    productType: ProductType.CanvasPrint,
    fulfillmentType: FulfillmentType.Lab,
    isActive: true,
    labColorCorrectionEnabled: false,
    variations: [
      { id: 'v3', name: '16x20', priceCents: 7500, costCents: 2000, markupCents: 5500, isCustomPriced: false, isActive: true },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockCartItems: CartItem[] = [
    { product: mockProduct, variationId: 'v1', quantity: 2 },
    { product: mockProduct2, variationId: 'v3', quantity: 1 },
  ];

  const mockOrderResponse: OrderDto = {
    id: 'ord-1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    status: OrderStatus.Pending,
    paymentMethod: PaymentMethod.CreditCard,
    fulfillmentType: FulfillmentType.Lab,
    subtotalCents: 12500,
    taxCents: 0,
    shippingCents: 0,
    discountCents: 0,
    totalCents: 12500,
    commissionCents: 0,
    commissionPercentage: 0,
    items: [
      {
        id: 'oi-1',
        productId: 'p1',
        productName: '8x10 Print',
        productVariationId: 'v1',
        variationName: 'Glossy',
        quantity: 2,
        unitPriceCents: 2500,
        totalCents: 5000,
      },
      {
        id: 'oi-2',
        productId: 'p2',
        productName: 'Canvas Wrap',
        productVariationId: 'v3',
        variationName: '16x20',
        quantity: 1,
        unitPriceCents: 7500,
        totalCents: 7500,
      },
    ],
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2025-03-10T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckoutPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show empty state when cart is empty', () => {
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show checkout form when cart has items', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.checkout-form');
    expect(form).toBeTruthy();
  });

  it('should show order summary when cart has items', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector('.order-summary');
    expect(summary).toBeTruthy();
  });

  it('should display summary items', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.summary-item');
    expect(items.length).toBe(2);
  });

  it('should display item names in summary', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const names = fixture.nativeElement.querySelectorAll('.summary-item-name');
    expect(names[0].textContent).toContain('8x10 Print');
    expect(names[1].textContent).toContain('Canvas Wrap');
  });

  it('should display variation and quantity in summary', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const variations = fixture.nativeElement.querySelectorAll('.summary-item-variation');
    expect(variations[0].textContent).toContain('Glossy');
    expect(variations[0].textContent).toContain('x2');
  });

  it('should display item prices in summary', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const prices = fixture.nativeElement.querySelectorAll('.summary-item-price');
    expect(prices[0].textContent).toContain('$50.00');
    expect(prices[1].textContent).toContain('$75.00');
  });

  it('should compute subtotal correctly', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();
    expect(component.subtotal()).toBe(12500);
  });

  it('should display subtotal', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const summaryValues = fixture.nativeElement.querySelectorAll('.summary-value');
    expect(summaryValues[0].textContent).toContain('$125.00');
  });

  it('should display estimated total', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const totalPrice = fixture.nativeElement.querySelector('.total-price');
    expect(totalPrice.textContent).toContain('$125.00');
  });

  it('should initialize with default state', () => {
    fixture.detectChanges();
    expect(component.submitting()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.orderPlaced()).toBe(false);
    expect(component.placedOrder()).toBeNull();
    expect(component.clientName).toBe('');
    expect(component.clientEmail).toBe('');
    expect(component.clientPhone).toBe('');
    expect(component.shippingAddress).toBe('');
  });

  describe('onSubmit', () => {
    it('should call OrdersService.create and show success on success', () => {
      fixture.componentRef.setInput('cartItems', mockCartItems);
      fixture.detectChanges();

      const orderCompleteSpy = vi.fn();
      component.orderComplete.subscribe(orderCompleteSpy);

      component.clientName = 'John Doe';
      component.clientEmail = 'john@example.com';
      component.clientPhone = '555-0101';
      component.shippingAddress = '123 Main St';
      component.shippingCity = 'Toronto';
      component.shippingProvince = 'ON';
      component.shippingPostalCode = 'M5V 1J1';
      component.shippingCountry = 'Canada';

      component.onSubmit();
      expect(component.submitting()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '555-0101',
        shippingAddress: '123 Main St',
        shippingCity: 'Toronto',
        shippingProvince: 'ON',
        shippingPostalCode: 'M5V 1J1',
        shippingCountry: 'Canada',
        paymentMethod: PaymentMethod.CreditCard,
        items: [
          { productId: 'p1', productVariationId: 'v1', quantity: 2 },
          { productId: 'p2', productVariationId: 'v3', quantity: 1 },
        ],
      });
      req.flush(mockOrderResponse);

      expect(component.submitting()).toBe(false);
      expect(component.orderPlaced()).toBe(true);
      expect(component.placedOrder()).toEqual(mockOrderResponse);
      expect(orderCompleteSpy).toHaveBeenCalledWith(mockOrderResponse);
    });

    it('should omit optional fields when empty', () => {
      fixture.componentRef.setInput('cartItems', [mockCartItems[0]]);
      fixture.detectChanges();

      component.clientName = 'Jane Doe';
      component.clientEmail = 'jane@example.com';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
      expect(req.request.body.clientPhone).toBeUndefined();
      expect(req.request.body.shippingAddress).toBeUndefined();
      expect(req.request.body.shippingCity).toBeUndefined();
      expect(req.request.body.shippingProvince).toBeUndefined();
      expect(req.request.body.shippingPostalCode).toBeUndefined();
      expect(req.request.body.shippingCountry).toBeUndefined();
      req.flush(mockOrderResponse);
    });

    it('should show error message on API error', () => {
      fixture.componentRef.setInput('cartItems', mockCartItems);
      fixture.detectChanges();

      component.clientName = 'John Doe';
      component.clientEmail = 'john@example.com';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
      req.flush(
        { message: 'Insufficient stock' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(component.submitting()).toBe(false);
      expect(component.errorMessage()).toBe('Insufficient stock');
      expect(component.orderPlaced()).toBe(false);
    });

    it('should show default error message on API error without message', () => {
      fixture.componentRef.setInput('cartItems', mockCartItems);
      fixture.detectChanges();

      component.clientName = 'John Doe';
      component.clientEmail = 'john@example.com';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage()).toBe('Failed to place order. Please try again.');
    });

    it('should not submit while already submitting', () => {
      fixture.componentRef.setInput('cartItems', mockCartItems);
      fixture.detectChanges();

      component.clientName = 'John Doe';
      component.clientEmail = 'john@example.com';

      component.onSubmit();
      component.onSubmit(); // second call should be ignored

      httpTesting.expectOne(`${baseUrl}/api/orders`);
      // Only one request should have been made
    });

    it('should clear error on new submission', () => {
      fixture.componentRef.setInput('cartItems', mockCartItems);
      fixture.detectChanges();

      component.clientName = 'John Doe';
      component.clientEmail = 'john@example.com';

      component.onSubmit();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/orders`);
      req1.flush(
        { message: 'Error' },
        { status: 400, statusText: 'Bad Request' },
      );
      expect(component.errorMessage()).toBe('Error');

      component.onSubmit();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/orders`);
      req2.flush(mockOrderResponse);
    });
  });

  it('should show success view after order is placed', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    component.clientName = 'John Doe';
    component.clientEmail = 'john@example.com';
    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
    req.flush(mockOrderResponse);
    fixture.detectChanges();

    const successTitle = fixture.nativeElement.querySelector('.success-title');
    expect(successTitle).toBeTruthy();
    expect(successTitle.textContent).toContain('Order Placed Successfully');

    const successMessage = fixture.nativeElement.querySelector('.success-message');
    expect(successMessage.textContent).toContain('john@example.com');

    const orderId = fixture.nativeElement.querySelector('.success-order-id');
    expect(orderId.textContent).toContain('ord-1');
  });

  it('should hide checkout form after order placed', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    component.clientName = 'John Doe';
    component.clientEmail = 'john@example.com';
    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
    req.flush(mockOrderResponse);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.checkout-form');
    expect(form).toBeFalsy();
  });

  it('should render error message in the DOM', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    component.clientName = 'John Doe';
    component.clientEmail = 'john@example.com';
    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/orders`);
    req.flush(
      { message: 'Bad request' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Bad request');
  });

  it('should return Unknown for non-matching variationId', () => {
    const item: CartItem = { product: mockProduct, variationId: 'nonexistent', quantity: 1 };
    expect(component.getVariationName(item)).toBe('Unknown');
  });

  it('should return 0 for non-matching variationId price', () => {
    const item: CartItem = { product: mockProduct, variationId: 'nonexistent', quantity: 1 };
    expect(component.getUnitPrice(item)).toBe(0);
  });

  it('should compute line total correctly', () => {
    const item: CartItem = { product: mockProduct, variationId: 'v1', quantity: 3 };
    expect(component.getLineTotal(item)).toBe(7500);
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(2500)).toBe('$25.00');
    expect(component.formatPrice(0)).toBe('$0.00');
  });

  it('should display page title', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.page-title');
    expect(title.textContent).toContain('Checkout');
  });
});
