import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG, InvoiceDto, InvoiceStatus, PagedList } from 'api';
import { InvoiceListPageComponent } from './invoice-list-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockInvoices: InvoiceDto[] = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      title: 'Wedding Photography',
      contactName: 'Alice Johnson',
      status: InvoiceStatus.Paid,
      dueDate: '2025-04-01T00:00:00Z',
      subtotalCents: 200000,
      taxRatePercent: 13,
      taxAmountCents: 26000,
      discountCents: 0,
      totalCents: 226000,
      paidCents: 226000,
      tipsEnabled: false,
      tipAmountCents: 0,
      autoRemindersEnabled: false,
      isTemplate: false,
      lineItems: [],
      paymentSchedules: [],
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      title: 'Portrait Session',
      contactName: 'Bob Smith',
      status: InvoiceStatus.Overdue,
      dueDate: '2025-02-01T00:00:00Z',
      subtotalCents: 50000,
      taxRatePercent: 13,
      taxAmountCents: 6500,
      discountCents: 0,
      totalCents: 56500,
      paidCents: 0,
      tipsEnabled: false,
      tipAmountCents: 0,
      autoRemindersEnabled: true,
      isTemplate: false,
      lineItems: [],
      paymentSchedules: [],
      createdAt: '2025-02-10T09:00:00Z',
    },
  ];

  const mockPagedList: PagedList<InvoiceDto> = {
    items: mockInvoices,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(InvoiceListPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: PagedList<InvoiceDto> = mockPagedList): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load invoices on init', () => {
    flushInitialLoad();
    expect(component.invoices()).toEqual(mockInvoices);
    expect(component.loading()).toBe(false);
    expect(component.totalCount()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?page=1&pageSize=10`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?page=1&pageSize=10`);
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should filter by Draft status tab', () => {
    flushInitialLoad();

    component.onTabChange(InvoiceStatus.Draft);
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?status=Draft&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe(InvoiceStatus.Draft);
  });

  it('should filter by Sent status tab', () => {
    flushInitialLoad();

    component.onTabChange(InvoiceStatus.Sent);
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?status=Sent&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe(InvoiceStatus.Sent);
  });

  it('should filter by Paid status tab', () => {
    flushInitialLoad();

    component.onTabChange(InvoiceStatus.Paid);
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?status=Paid&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe(InvoiceStatus.Paid);
  });

  it('should filter by Overdue status tab', () => {
    flushInitialLoad();

    component.onTabChange(InvoiceStatus.Overdue);
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?status=Overdue&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe(InvoiceStatus.Overdue);
  });

  it('should switch back to All tab', () => {
    flushInitialLoad();

    component.onTabChange(InvoiceStatus.Paid);
    const paidReq = httpTesting.expectOne(`${baseUrl}/api/invoices?status=Paid&page=1&pageSize=10`);
    paidReq.flush(mockPagedList);

    component.onTabChange('All');
    const allReq = httpTesting.expectOne(`${baseUrl}/api/invoices?page=1&pageSize=10`);
    allReq.flush(mockPagedList);

    expect(component.activeTab()).toBe('All');
  });

  it('should reset page when switching tabs', () => {
    flushInitialLoad();

    component.currentPage.set(3);
    component.onTabChange(InvoiceStatus.Draft);
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?status=Draft&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockInvoices,
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?page=2&pageSize=10`);
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

    const req = httpTesting.expectOne(`${baseUrl}/api/invoices?page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(`${baseUrl}/api/invoices?page=0&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(`${baseUrl}/api/invoices?page=2&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should return correct badge variants for each status', () => {
    flushInitialLoad();
    expect(component.getStatusBadgeVariant(InvoiceStatus.Draft)).toBe('neutral');
    expect(component.getStatusBadgeVariant(InvoiceStatus.Sent)).toBe('warning');
    expect(component.getStatusBadgeVariant(InvoiceStatus.Viewed)).toBe('warning');
    expect(component.getStatusBadgeVariant(InvoiceStatus.PartiallyPaid)).toBe('warning');
    expect(component.getStatusBadgeVariant(InvoiceStatus.Paid)).toBe('success');
    expect(component.getStatusBadgeVariant(InvoiceStatus.Overdue)).toBe('error');
    expect(component.getStatusBadgeVariant(InvoiceStatus.Cancelled)).toBe('error');
    expect(component.getStatusBadgeVariant(InvoiceStatus.Refunded)).toBe('neutral');
  });

  it('should format status labels', () => {
    flushInitialLoad();
    expect(component.formatStatus(InvoiceStatus.PartiallyPaid)).toBe('Partially Paid');
    expect(component.formatStatus(InvoiceStatus.Draft)).toBe('Draft');
    expect(component.formatStatus(InvoiceStatus.Paid)).toBe('Paid');
    expect(component.formatStatus(InvoiceStatus.Overdue)).toBe('Overdue');
  });

  it('should format currency correctly', () => {
    flushInitialLoad();
    expect(component.formatCurrency(226000)).toBe('$2260.00');
    expect(component.formatCurrency(56500)).toBe('$565.00');
    expect(component.formatCurrency(0)).toBe('$0.00');
    expect(component.formatCurrency(99)).toBe('$0.99');
  });

  it('should format dates', () => {
    flushInitialLoad();
    const formatted = component.formatDate('2025-03-15T14:30:00Z');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('2025');
  });

  it('should emit createInvoice when button is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.createInvoice.subscribe(spy);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('lib-button[variant="primary"] button');
    btn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should render empty state when no invoices', () => {
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

    const emptyEl = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyEl).toBeTruthy();
  });

  it('should display correct pagination info', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const info = fixture.nativeElement.querySelector('.pagination-info');
    expect(info.textContent).toContain('Showing 2 of 2');
  });

  it('should display dash for missing contact name', () => {
    const invoicesNoContact: InvoiceDto[] = [
      {
        id: '3',
        invoiceNumber: 'INV-003',
        title: 'No Contact Invoice',
        status: InvoiceStatus.Draft,
        subtotalCents: 10000,
        taxRatePercent: 0,
        taxAmountCents: 0,
        discountCents: 0,
        totalCents: 10000,
        paidCents: 0,
        tipsEnabled: false,
        tipAmountCents: 0,
        autoRemindersEnabled: false,
        isTemplate: false,
        lineItems: [],
        paymentSchedules: [],
        createdAt: '2025-01-15T10:00:00Z',
      },
    ];
    flushInitialLoad({
      items: invoicesNoContact,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('lib-table-data-row');
    const contactCol = row.querySelector('.col-contact');
    expect(contactCol.textContent.trim()).toContain('—');
  });

  it('should display dash for missing due date', () => {
    const invoicesNoDue: InvoiceDto[] = [
      {
        id: '4',
        invoiceNumber: 'INV-004',
        title: 'No Due Date',
        status: InvoiceStatus.Draft,
        subtotalCents: 10000,
        taxRatePercent: 0,
        taxAmountCents: 0,
        discountCents: 0,
        totalCents: 10000,
        paidCents: 0,
        tipsEnabled: false,
        tipAmountCents: 0,
        autoRemindersEnabled: false,
        isTemplate: false,
        lineItems: [],
        paymentSchedules: [],
        createdAt: '2025-01-15T10:00:00Z',
      },
    ];
    flushInitialLoad({
      items: invoicesNoDue,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('lib-table-data-row');
    const dueCol = row.querySelector('.col-due');
    expect(dueCol.textContent.trim()).toContain('—');
  });

  it('should have correct tabs', () => {
    flushInitialLoad();
    expect(component.tabs).toEqual([
      { label: 'All', icon: 'list', value: 'All' },
      { label: 'Draft', icon: 'file-edit', value: 'Draft' },
      { label: 'Sent', icon: 'send', value: 'Sent' },
      { label: 'Paid', icon: 'check-circle', value: 'Paid' },
      { label: 'Overdue', icon: 'alert-circle', value: 'Overdue' },
    ]);
  });

  it('should default to All tab', () => {
    flushInitialLoad();
    expect(component.activeTab()).toBe('All');
  });

  it('should render invoice rows with correct data', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('lib-table-data-row');
    expect(rows.length).toBe(2);

    const firstNumber = rows[0].querySelector('.col-number');
    expect(firstNumber.textContent.trim()).toBe('INV-001');

    const firstTitle = rows[0].querySelector('.col-title');
    expect(firstTitle.textContent.trim()).toBe('Wedding Photography');

    const firstTotal = rows[0].querySelector('.col-total');
    expect(firstTotal.textContent.trim()).toBe('$2260.00');
  });
});
