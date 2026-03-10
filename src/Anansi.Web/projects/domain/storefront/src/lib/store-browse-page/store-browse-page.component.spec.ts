import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, ProductDto, ProductType, FulfillmentType, PagedList } from 'api';
import { StoreBrowsePageComponent } from './store-browse-page.component';

describe('StoreBrowsePageComponent', () => {
  let component: StoreBrowsePageComponent;
  let fixture: ComponentFixture<StoreBrowsePageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockProducts: ProductDto[] = [
    {
      id: 'p1',
      name: '8x10 Print',
      productType: ProductType.Print,
      fulfillmentType: FulfillmentType.Lab,
      isActive: true,
      labColorCorrectionEnabled: false,
      previewImageUrl: 'https://example.com/print.jpg',
      variations: [
        { id: 'v1', name: 'Glossy', priceCents: 2500, costCents: 500, markupCents: 2000, isCustomPriced: false, isActive: true },
        { id: 'v2', name: 'Matte', priceCents: 2800, costCents: 600, markupCents: 2200, isCustomPriced: false, isActive: true },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
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
    },
    {
      id: 'p3',
      name: 'Inactive Product',
      productType: ProductType.Print,
      fulfillmentType: FulfillmentType.Lab,
      isActive: false,
      labColorCorrectionEnabled: false,
      variations: [
        { id: 'v4', name: 'Standard', priceCents: 1000, costCents: 200, markupCents: 800, isCustomPriced: false, isActive: true },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockPagedList: PagedList<ProductDto> = {
    items: mockProducts,
    page: 1,
    pageSize: 50,
    totalCount: 3,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreBrowsePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StoreBrowsePageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: PagedList<ProductDto> = mockPagedList): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/products`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    flushInitialLoad();
    expect(component.products()).toEqual(mockProducts);
    expect(component.loading()).toBe(false);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/products`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/products`);
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should filter out inactive products in display', () => {
    flushInitialLoad();
    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(2);
    expect(filtered.every((p) => p.isActive)).toBe(true);
  });

  it('should filter by product type', () => {
    flushInitialLoad();

    component.onFilterChange(ProductType.CanvasPrint);
    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Canvas Wrap');
  });

  it('should show all active products when All filter selected', () => {
    flushInitialLoad();

    component.onFilterChange(ProductType.Print);
    expect(component.filteredProducts().length).toBe(1);

    component.onFilterChange('All');
    expect(component.filteredProducts().length).toBe(2);
  });

  it('should show empty state when no products match filter', () => {
    flushInitialLoad();

    component.onFilterChange(ProductType.Album);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show empty state when no products loaded', () => {
    flushInitialLoad({
      items: [],
      page: 1,
      pageSize: 50,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    });
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should render product cards for active products', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(cards.length).toBe(2);
  });

  it('should display product name', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const names = fixture.nativeElement.querySelectorAll('.product-name');
    expect(names[0].textContent).toContain('8x10 Print');
  });

  it('should display product price from first variation', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const prices = fixture.nativeElement.querySelectorAll('.product-price');
    expect(prices[0].textContent).toContain('$25.00');
  });

  it('should display product image when previewImageUrl is provided', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.product-image img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('print.jpg');
  });

  it('should display image placeholder when no previewImageUrl', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.product-card');
    const secondCard = cards[1];
    const placeholder = secondCard.querySelector('.image-placeholder');
    expect(placeholder).toBeTruthy();
  });

  it('should emit productSelected when product card is clicked', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const spy = vi.fn();
    component.productSelected.subscribe(spy);

    const card = fixture.nativeElement.querySelector('.product-card');
    card.click();

    expect(spy).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should emit productSelected on keydown.enter', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const spy = vi.fn();
    component.productSelected.subscribe(spy);

    const card = fixture.nativeElement.querySelector('.product-card');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should return 0 for product with no variations', () => {
    const noVariations: ProductDto = {
      ...mockProducts[0],
      variations: [],
    };
    expect(component.getStartingPrice(noVariations)).toBe(0);
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(2500)).toBe('$25.00');
    expect(component.formatPrice(0)).toBe('$0.00');
    expect(component.formatPrice(99)).toBe('$0.99');
    expect(component.formatPrice(10050)).toBe('$100.50');
  });

  it('should format product type with spaces', () => {
    expect(component.formatProductType(ProductType.CanvasPrint)).toBe('Canvas Print');
    expect(component.formatProductType(ProductType.DigitalDownload)).toBe('Digital Download');
    expect(component.formatProductType(ProductType.Print)).toBe('Print');
  });

  it('should have correct filter tabs', () => {
    flushInitialLoad();
    expect(component.filterTabs.length).toBe(6);
    expect(component.filterTabs[0]).toEqual({ label: 'All', value: 'All' });
  });

  it('should default to All filter', () => {
    flushInitialLoad();
    expect(component.activeFilter()).toBe('All');
  });

  it('should display product type text', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const types = fixture.nativeElement.querySelectorAll('.product-type');
    expect(types[0].textContent).toContain('Print');
  });
});
