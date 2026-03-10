import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import {
  API_CONFIG,
  ProductDto,
  ProductType,
  FulfillmentType,
  PagedList,
} from 'api';
import { ProductCatalogPageComponent } from './product-catalog-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('ProductCatalogPageComponent', () => {
  let component: ProductCatalogPageComponent;
  let fixture: ComponentFixture<ProductCatalogPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockProducts: ProductDto[] = [
    {
      id: '1',
      name: '8x10 Print',
      productType: ProductType.Print,
      fulfillmentType: FulfillmentType.Lab,
      isActive: true,
      labColorCorrectionEnabled: false,
      previewImageUrl: 'https://example.com/img.jpg',
      variations: [
        {
          id: 'v1',
          name: 'Glossy',
          costCents: 500,
          markupCents: 1000,
          priceCents: 1500,
          isCustomPriced: false,
          isActive: true,
        },
        {
          id: 'v2',
          name: 'Matte',
          costCents: 500,
          markupCents: 1200,
          priceCents: 1700,
          isCustomPriced: false,
          isActive: true,
        },
      ],
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: '2',
      name: 'Digital Download Pack',
      productType: ProductType.DigitalDownload,
      fulfillmentType: FulfillmentType.Digital,
      isActive: false,
      labColorCorrectionEnabled: false,
      variations: [
        {
          id: 'v3',
          name: 'Standard',
          costCents: 0,
          markupCents: 2000,
          priceCents: 2000,
          isCustomPriced: false,
          isActive: true,
        },
      ],
      createdAt: '2025-02-15T10:00:00Z',
      updatedAt: '2025-02-15T10:00:00Z',
    },
    {
      id: '3',
      name: 'Custom Album',
      productType: ProductType.SelfFulfilled,
      fulfillmentType: FulfillmentType.SelfFulfilled,
      isActive: true,
      labColorCorrectionEnabled: false,
      variations: [],
      createdAt: '2025-03-01T10:00:00Z',
      updatedAt: '2025-03-01T10:00:00Z',
    },
  ];

  const mockPagedList: PagedList<ProductDto> = {
    items: mockProducts,
    page: 1,
    pageSize: 12,
    totalCount: 3,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCatalogPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCatalogPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    response: PagedList<ProductDto> = mockPagedList,
  ): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?page=1&pageSize=12`,
    );
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
    expect(component.totalCount()).toBe(3);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?page=1&pageSize=12`,
    );
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should filter by Digital tab using productType param', () => {
    flushInitialLoad();

    component.onFilterChange('Digital');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?productType=DigitalDownload&page=1&pageSize=12`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [mockProducts[1]],
      page: 1,
      pageSize: 12,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    expect(component.products().length).toBe(1);
    expect(component.activeFilter()).toBe('Digital');
  });

  it('should filter by SelfFulfilled tab using productType param', () => {
    flushInitialLoad();

    component.onFilterChange('SelfFulfilled');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?productType=SelfFulfilled&page=1&pageSize=12`,
    );
    req.flush({
      items: [mockProducts[2]],
      page: 1,
      pageSize: 12,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    expect(component.products().length).toBe(1);
  });

  it('should filter by Print tab and client-side filter results', () => {
    flushInitialLoad();

    component.onFilterChange('Print');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?page=1&pageSize=12`,
    );
    req.flush(mockPagedList);

    // Only the Print product should remain after client-side filter
    expect(component.products().length).toBe(1);
    expect(component.products()[0].productType).toBe(ProductType.Print);
  });

  it('should load all products when All tab selected', () => {
    flushInitialLoad();

    component.onFilterChange('Digital');
    const digitalReq = httpTesting.expectOne(
      `${baseUrl}/api/products?productType=DigitalDownload&page=1&pageSize=12`,
    );
    digitalReq.flush({
      items: [mockProducts[1]],
      page: 1,
      pageSize: 12,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    component.onFilterChange('All');
    const allReq = httpTesting.expectOne(
      `${baseUrl}/api/products?page=1&pageSize=12`,
    );
    allReq.flush(mockPagedList);

    expect(component.products().length).toBe(3);
  });

  it('should reset page when switching filter tabs', () => {
    flushInitialLoad();

    component.currentPage.set(3);
    component.onFilterChange('Digital');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?productType=DigitalDownload&page=1&pageSize=12`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockProducts,
      page: 1,
      pageSize: 12,
      totalCount: 24,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?page=2&pageSize=12`,
    );
    req.flush({
      items: [],
      page: 2,
      pageSize: 12,
      totalCount: 24,
      totalPages: 2,
      hasPrevious: true,
      hasNext: false,
    });

    expect(component.currentPage()).toBe(2);
  });

  it('should navigate to previous page', () => {
    flushInitialLoad();

    component.currentPage.set(2);
    component.totalPages.set(3);
    component.onPreviousPage();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?page=1&pageSize=12`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(`${baseUrl}/api/products?page=0&pageSize=12`);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(`${baseUrl}/api/products?page=2&pageSize=12`);
    expect(component.currentPage()).toBe(1);
  });

  it('should format product types correctly', () => {
    flushInitialLoad();
    expect(component.formatProductType(ProductType.MountedPrint)).toBe(
      'Mounted Print',
    );
    expect(component.formatProductType(ProductType.CanvasPrint)).toBe(
      'Canvas Print',
    );
    expect(component.formatProductType(ProductType.MetalPrint)).toBe(
      'Metal Print',
    );
    expect(component.formatProductType(ProductType.WoodPrint)).toBe(
      'Wood Print',
    );
    expect(component.formatProductType(ProductType.FramedPrint)).toBe(
      'Framed Print',
    );
    expect(component.formatProductType(ProductType.WallArt)).toBe('Wall Art');
    expect(component.formatProductType(ProductType.LargeFormat)).toBe(
      'Large Format',
    );
    expect(component.formatProductType(ProductType.SquarePrint)).toBe(
      'Square Print',
    );
    expect(component.formatProductType(ProductType.BambooPanel)).toBe(
      'Bamboo Panel',
    );
    expect(component.formatProductType(ProductType.DigitalDownload)).toBe(
      'Digital Download',
    );
    expect(component.formatProductType(ProductType.GreetingCard)).toBe(
      'Greeting Card',
    );
    expect(component.formatProductType(ProductType.SelfFulfilled)).toBe(
      'Self Fulfilled',
    );
    expect(component.formatProductType(ProductType.Print)).toBe('Print');
    expect(component.formatProductType(ProductType.Album)).toBe('Album');
    expect(component.formatProductType(ProductType.Book)).toBe('Book');
    expect(component.formatProductType(ProductType.Package)).toBe('Package');
    expect(component.formatProductType(ProductType.Standout)).toBe('Standout');
  });

  it('should return correct badge variants for product types', () => {
    flushInitialLoad();
    expect(
      component.getProductTypeBadgeVariant(ProductType.DigitalDownload),
    ).toBe('success');
    expect(
      component.getProductTypeBadgeVariant(ProductType.SelfFulfilled),
    ).toBe('warning');
    expect(component.getProductTypeBadgeVariant(ProductType.Print)).toBe(
      'neutral',
    );
    expect(
      component.getProductTypeBadgeVariant(ProductType.CanvasPrint),
    ).toBe('neutral');
  });

  it('should return correct fulfillment labels', () => {
    flushInitialLoad();
    expect(component.getFulfillmentLabel(FulfillmentType.Lab)).toBe(
      'Lab Fulfilled',
    );
    expect(component.getFulfillmentLabel(FulfillmentType.Digital)).toBe(
      'Digital',
    );
    expect(component.getFulfillmentLabel(FulfillmentType.SelfFulfilled)).toBe(
      'Self Fulfilled',
    );
  });

  it('should emit addProduct output', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.addProduct.subscribe(spy);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      'lib-button[variant="primary"] button',
    );
    btn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should render product cards with correct content', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    expect(cards.length).toBe(3);

    const firstCardName = cards[0].querySelector('.product-card__name');
    expect(firstCardName.textContent.trim()).toBe('8x10 Print');

    const firstCardVariations = cards[0].querySelector(
      '.product-card__variations',
    );
    expect(firstCardVariations.textContent.trim()).toBe('2 variations');
  });

  it('should show singular variation text for single variation', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    const secondCardVariations = cards[1].querySelector(
      '.product-card__variations',
    );
    expect(secondCardVariations.textContent.trim()).toBe('1 variation');
  });

  it('should show 0 variations text', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    const thirdCardVariations = cards[2].querySelector(
      '.product-card__variations',
    );
    expect(thirdCardVariations.textContent.trim()).toBe('0 variations');
  });

  it('should show active status indicator', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const activeStatus = fixture.nativeElement.querySelector(
      '.product-card__status--active',
    );
    expect(activeStatus).toBeTruthy();
    expect(activeStatus.textContent.trim()).toContain('Active');
  });

  it('should show inactive status indicator', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const inactiveStatus = fixture.nativeElement.querySelector(
      '.product-card__status--inactive',
    );
    expect(inactiveStatus).toBeTruthy();
    expect(inactiveStatus.textContent.trim()).toContain('Inactive');
  });

  it('should show image when previewImageUrl is present', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.product-card__img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/img.jpg');
  });

  it('should show placeholder when previewImageUrl is absent', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const placeholders = fixture.nativeElement.querySelectorAll(
      '.product-card__placeholder',
    );
    expect(placeholders.length).toBe(2);
  });

  it('should render empty state when no products', () => {
    flushInitialLoad({
      items: [],
      page: 1,
      pageSize: 12,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    });
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/products?page=1&pageSize=12`,
    );
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should display correct pagination info', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const info = fixture.nativeElement.querySelector('.pagination__info');
    expect(info.textContent).toContain('Showing 3 of 3');
  });

  it('should have correct filter tabs', () => {
    flushInitialLoad();
    expect(component.filterTabs.length).toBe(4);
    expect(component.filterTabs.map((t) => t.value)).toEqual([
      'All',
      'Print',
      'Digital',
      'SelfFulfilled',
    ]);
  });
});
