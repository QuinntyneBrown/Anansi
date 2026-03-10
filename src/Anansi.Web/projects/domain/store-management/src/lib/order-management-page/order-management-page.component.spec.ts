import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import {
  API_CONFIG,
  OrderDto,
  OrderStatus,
  PaymentMethod,
  FulfillmentType,
  PagedList,
} from 'api';
import { OrderManagementPageComponent } from './order-management-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('OrderManagementPageComponent', () => {
  let component: OrderManagementPageComponent;
  let fixture: ComponentFixture<OrderManagementPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockOrders: OrderDto[] = [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      clientName: 'Alice Johnson',
      clientEmail: 'alice@example.com',
      status: OrderStatus.Pending,
      paymentMethod: PaymentMethod.CreditCard,
      fulfillmentType: FulfillmentType.Lab,
      subtotalCents: 5000,
      taxCents: 650,
      shippingCents: 500,
      discountCents: 0,
      totalCents: 6150,
      commissionCents: 615,
      commissionPercentage: 10,
      items: [
        {
          id: 'item1',
          productId: 'p1',
          productName: '8x10 Print',
          quantity: 2,
          unitPriceCents: 2500,
          totalCents: 5000,
        },
      ],
      createdAt: '2025-03-01T14:30:00Z',
      updatedAt: '2025-03-01T14:30:00Z',
    },
    {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      clientName: 'Bob Smith',
      clientEmail: 'bob@example.com',
      status: OrderStatus.Delivered,
      paymentMethod: PaymentMethod.PayPal,
      fulfillmentType: FulfillmentType.Digital,
      subtotalCents: 2000,
      taxCents: 260,
      shippingCents: 0,
      discountCents: 0,
      totalCents: 2260,
      commissionCents: 226,
      commissionPercentage: 10,
      items: [
        {
          id: 'item2',
          productId: 'p2',
          productName: 'Digital Pack',
          quantity: 1,
          unitPriceCents: 2000,
          totalCents: 2000,
        },
        {
          id: 'item3',
          productId: 'p3',
          productName: 'Preset Pack',
          quantity: 1,
          unitPriceCents: 0,
          totalCents: 0,
        },
      ],
      createdAt: '2025-02-20T10:00:00Z',
      updatedAt: '2025-02-25T16:00:00Z',
    },
  ];

  const mockPagedList: PagedList<OrderDto> = {
    items: mockOrders,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManagementPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderManagementPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    response: PagedList<OrderDto> = mockPagedList,
  ): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?page=1&pageSize=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    flushInitialLoad();
    expect(component.orders()).toEqual(mockOrders);
    expect(component.loading()).toBe(false);
    expect(component.totalCount()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?page=1&pageSize=10`,
    );
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should filter by status tab', () => {
    flushInitialLoad();

    component.onStatusChange('Pending');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Pending&page=1&pageSize=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [mockOrders[0]],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    expect(component.orders().length).toBe(1);
    expect(component.activeStatus()).toBe('Pending');
  });

  it('should reset page when switching status tabs', () => {
    flushInitialLoad();

    component.currentPage.set(3);
    component.onStatusChange('Processing');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Processing&page=1&pageSize=10`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should search orders by client name', () => {
    flushInitialLoad();

    const event = { target: { value: 'Alice' } } as unknown as Event;
    component.onSearch(event);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?search=Alice&page=1&pageSize=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [mockOrders[0]],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    expect(component.orders().length).toBe(1);
    expect(component.searchQuery()).toBe('Alice');
  });

  it('should reset page on search', () => {
    flushInitialLoad();

    component.currentPage.set(5);
    const event = { target: { value: 'test' } } as unknown as Event;
    component.onSearch(event);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?search=test&page=1&pageSize=10`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should combine status filter and search', () => {
    flushInitialLoad();

    component.onStatusChange('Pending');
    const statusReq = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Pending&page=1&pageSize=10`,
    );
    statusReq.flush(mockPagedList);

    const event = { target: { value: 'Alice' } } as unknown as Event;
    component.onSearch(event);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Pending&search=Alice&page=1&pageSize=10`,
    );
    req.flush(mockPagedList);
  });

  it('should load all when All tab selected', () => {
    flushInitialLoad();

    component.onStatusChange('Pending');
    const pendingReq = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Pending&page=1&pageSize=10`,
    );
    pendingReq.flush(mockPagedList);

    component.onStatusChange('All');
    const allReq = httpTesting.expectOne(
      `${baseUrl}/api/orders?page=1&pageSize=10`,
    );
    allReq.flush(mockPagedList);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockOrders,
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?page=2&pageSize=10`,
    );
    req.flush({
      items: [],
      page: 2,
      pageSize: 10,
      totalCount: 20,
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
      `${baseUrl}/api/orders?page=1&pageSize=10`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(`${baseUrl}/api/orders?page=0&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(`${baseUrl}/api/orders?page=2&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should truncate long order IDs', () => {
    flushInitialLoad();
    expect(component.truncateId('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(
      'a1b2c3d4...',
    );
  });

  it('should not truncate short IDs', () => {
    flushInitialLoad();
    expect(component.truncateId('short')).toBe('short');
    expect(component.truncateId('12345678')).toBe('12345678');
  });

  it('should return correct badge variants for order statuses', () => {
    flushInitialLoad();
    expect(component.getStatusBadgeVariant(OrderStatus.Pending)).toBe(
      'warning',
    );
    expect(component.getStatusBadgeVariant(OrderStatus.Processing)).toBe(
      'warning',
    );
    expect(component.getStatusBadgeVariant(OrderStatus.Shipped)).toBe(
      'neutral',
    );
    expect(component.getStatusBadgeVariant(OrderStatus.Delivered)).toBe(
      'success',
    );
    expect(component.getStatusBadgeVariant(OrderStatus.Cancelled)).toBe(
      'error',
    );
    expect(component.getStatusBadgeVariant(OrderStatus.Refunded)).toBe(
      'error',
    );
  });

  it('should format cents correctly', () => {
    flushInitialLoad();
    expect(component.formatCents(6150)).toBe('$61.50');
    expect(component.formatCents(0)).toBe('$0.00');
    expect(component.formatCents(100)).toBe('$1.00');
    expect(component.formatCents(2260)).toBe('$22.60');
  });

  it('should format dates', () => {
    flushInitialLoad();
    const formatted = component.formatDate('2025-03-01T14:30:00Z');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('2025');
  });

  it('should emit orderSelected when row is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.orderSelected.subscribe(spy);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.clickable-row');
    row.click();

    expect(spy).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('should render order rows with correct content', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('lib-table-data-row');
    expect(rows.length).toBe(2);

    const firstRowClient = rows[0].querySelector('.col-client');
    expect(firstRowClient.textContent.trim()).toBe('Alice Johnson');

    const firstRowTotal = rows[0].querySelector('.col-total');
    expect(firstRowTotal.textContent.trim()).toBe('$61.50');

    const firstRowItems = rows[0].querySelector('.col-items');
    expect(firstRowItems.textContent.trim()).toBe('1');

    const secondRowItems = rows[1].querySelector('.col-items');
    expect(secondRowItems.textContent.trim()).toBe('2');
  });

  it('should render truncated order ID', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const orderId = fixture.nativeElement.querySelector('.order-id');
    expect(orderId.textContent.trim()).toBe('a1b2c3d4...');
  });

  it('should render empty state when no orders', () => {
    flushInitialLoad({
      items: [],
      page: 1,
      pageSize: 10,
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
      `${baseUrl}/api/orders?page=1&pageSize=10`,
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
    expect(info.textContent).toContain('Showing 2 of 2');
  });

  it('should have correct status tabs', () => {
    flushInitialLoad();
    expect(component.statusTabs.length).toBe(5);
    expect(component.statusTabs.map((t) => t.value)).toEqual([
      'All',
      'Pending',
      'Processing',
      'Shipped',
      'Delivered',
    ]);
  });

  it('should clear search by setting empty value', () => {
    flushInitialLoad();

    const event = { target: { value: 'Alice' } } as unknown as Event;
    component.onSearch(event);
    const req1 = httpTesting.expectOne(
      `${baseUrl}/api/orders?search=Alice&page=1&pageSize=10`,
    );
    req1.flush(mockPagedList);

    const clearEvent = { target: { value: '' } } as unknown as Event;
    component.onSearch(clearEvent);
    const req2 = httpTesting.expectOne(
      `${baseUrl}/api/orders?page=1&pageSize=10`,
    );
    req2.flush(mockPagedList);

    expect(component.searchQuery()).toBe('');
  });

  it('should filter by Shipped status', () => {
    flushInitialLoad();

    component.onStatusChange('Shipped');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Shipped&page=1&pageSize=10`,
    );
    req.flush(mockPagedList);

    expect(component.activeStatus()).toBe('Shipped');
  });

  it('should filter by Delivered status', () => {
    flushInitialLoad();

    component.onStatusChange('Delivered');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/orders?status=Delivered&page=1&pageSize=10`,
    );
    req.flush(mockPagedList);

    expect(component.activeStatus()).toBe('Delivered');
  });
});
