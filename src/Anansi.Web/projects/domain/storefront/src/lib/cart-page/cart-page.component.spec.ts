import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, ProductDto, ProductType, FulfillmentType } from 'api';
import { CartPageComponent, CartItem } from './cart-page.component';

describe('CartPageComponent', () => {
  let component: CartPageComponent;
  let fixture: ComponentFixture<CartPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockProduct1: ProductDto = {
    id: 'p1',
    name: '8x10 Print',
    productType: ProductType.Print,
    fulfillmentType: FulfillmentType.Lab,
    isActive: true,
    labColorCorrectionEnabled: false,
    variations: [
      { id: 'v1', name: 'Glossy', priceCents: 2500, costCents: 500, markupCents: 2000, isCustomPriced: false, isActive: true },
      { id: 'v2', name: 'Matte', priceCents: 2800, costCents: 600, markupCents: 2200, isCustomPriced: false, isActive: true },
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
    { product: mockProduct1, variationId: 'v1', quantity: 2 },
    { product: mockProduct2, variationId: 'v3', quantity: 1 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CartPageComponent);
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

  it('should not show empty state when cart has items', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeFalsy();
  });

  it('should render cart items', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.cart-item');
    expect(items.length).toBe(2);
  });

  it('should display item name', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const names = fixture.nativeElement.querySelectorAll('.item-name');
    expect(names[0].textContent).toContain('8x10 Print');
    expect(names[1].textContent).toContain('Canvas Wrap');
  });

  it('should display variation name', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const variations = fixture.nativeElement.querySelectorAll('.item-variation');
    expect(variations[0].textContent).toContain('Glossy');
    expect(variations[1].textContent).toContain('16x20');
  });

  it('should display unit price', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const unitPrices = fixture.nativeElement.querySelectorAll('.item-unit-price');
    expect(unitPrices[0].textContent).toContain('$25.00');
  });

  it('should display line total', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const totals = fixture.nativeElement.querySelectorAll('.item-total');
    expect(totals[0].textContent).toContain('$50.00');
    expect(totals[1].textContent).toContain('$75.00');
  });

  it('should display quantity', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const qtyValues = fixture.nativeElement.querySelectorAll('.qty-value');
    expect(qtyValues[0].textContent).toContain('2');
    expect(qtyValues[1].textContent).toContain('1');
  });

  it('should compute itemCount correctly', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();
    expect(component.itemCount()).toBe(3);
  });

  it('should compute subtotal correctly', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();
    // 2500*2 + 7500*1 = 12500
    expect(component.subtotal()).toBe(12500);
  });

  it('should display subtotal in summary', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const summaryValues = fixture.nativeElement.querySelectorAll('.summary-value');
    // First summary-value is item count, second is subtotal
    expect(summaryValues[0].textContent).toContain('3');
    expect(summaryValues[1].textContent).toContain('$125.00');
  });

  it('should display estimated total in summary', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const totalPrice = fixture.nativeElement.querySelector('.total-price');
    expect(totalPrice.textContent).toContain('$125.00');
  });

  it('should emit incrementQuantity with index', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const spy = vi.fn();
    component.incrementQuantity.subscribe(spy);

    const plusBtns = fixture.nativeElement.querySelectorAll('.qty-btn:not(:disabled)');
    // The increment button is the second button in each quantity-controls group
    const incrementBtn = fixture.nativeElement.querySelectorAll('.quantity-controls')[0]
      .querySelectorAll('.qty-btn')[1];
    incrementBtn.click();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should emit decrementQuantity with index', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const spy = vi.fn();
    component.decrementQuantity.subscribe(spy);

    // First item has quantity 2, so decrement should not be disabled
    const decrementBtn = fixture.nativeElement.querySelectorAll('.quantity-controls')[0]
      .querySelectorAll('.qty-btn')[0];
    decrementBtn.click();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should disable decrement when quantity is 1', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    // Second item has quantity 1
    const decrementBtn = fixture.nativeElement.querySelectorAll('.quantity-controls')[1]
      .querySelectorAll('.qty-btn')[0];
    expect(decrementBtn.disabled).toBe(true);
  });

  it('should emit removeItem with index', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const spy = vi.fn();
    component.removeItem.subscribe(spy);

    const removeBtn = fixture.nativeElement.querySelectorAll('.remove-btn')[0];
    removeBtn.click();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should emit proceedToCheckout', () => {
    fixture.componentRef.setInput('cartItems', mockCartItems);
    fixture.detectChanges();

    const spy = vi.fn();
    component.proceedToCheckout.subscribe(spy);

    const checkoutBtn = fixture.nativeElement.querySelector('.checkout-action lib-button button');
    checkoutBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should return Unknown for non-matching variationId', () => {
    const item: CartItem = { product: mockProduct1, variationId: 'nonexistent', quantity: 1 };
    expect(component.getVariationName(item)).toBe('Unknown');
  });

  it('should return 0 price for non-matching variationId', () => {
    const item: CartItem = { product: mockProduct1, variationId: 'nonexistent', quantity: 1 };
    expect(component.getUnitPrice(item)).toBe(0);
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(2500)).toBe('$25.00');
    expect(component.formatPrice(0)).toBe('$0.00');
    expect(component.formatPrice(99)).toBe('$0.99');
  });

  it('should compute line total correctly', () => {
    const item: CartItem = { product: mockProduct1, variationId: 'v1', quantity: 3 };
    expect(component.getLineTotal(item)).toBe(7500);
  });

  it('should compute itemCount as 0 for empty cart', () => {
    fixture.detectChanges();
    expect(component.itemCount()).toBe(0);
  });

  it('should compute subtotal as 0 for empty cart', () => {
    fixture.detectChanges();
    expect(component.subtotal()).toBe(0);
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.page-title');
    expect(title.textContent).toContain('Your Cart');
  });
});
