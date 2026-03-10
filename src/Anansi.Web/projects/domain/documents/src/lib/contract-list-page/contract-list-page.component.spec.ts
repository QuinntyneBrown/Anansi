import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG, ContractDto, ContractStatus, PagedList } from 'api';
import { ContractListPageComponent } from './contract-list-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('ContractListPageComponent', () => {
  let component: ContractListPageComponent;
  let fixture: ComponentFixture<ContractListPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockContracts: ContractDto[] = [
    {
      id: '1',
      title: 'Wedding Photography Contract',
      contactName: 'Alice Johnson',
      content: 'Contract content here',
      status: ContractStatus.Draft,
      isTemplate: false,
      autoRemindersEnabled: false,
      fields: [],
      signatures: [],
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Event Contract',
      contactName: 'Bob Smith',
      content: 'Event contract content',
      status: ContractStatus.Signed,
      isTemplate: false,
      autoRemindersEnabled: true,
      fields: [],
      signatures: [],
      createdAt: '2025-02-10T09:00:00Z',
    },
  ];

  const mockPagedList: PagedList<ContractDto> = {
    items: mockContracts,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ContractListPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: PagedList<ContractDto> = mockPagedList): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=false&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load contracts on init', () => {
    flushInitialLoad();
    expect(component.contracts()).toEqual(mockContracts);
    expect(component.loading()).toBe(false);
    expect(component.totalCount()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=false&page=1&pageSize=10`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=false&page=1&pageSize=10`);
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should switch to Templates tab', () => {
    flushInitialLoad();

    component.onTabChange('Templates');
    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=true&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe('Templates');
    expect(component.currentPage()).toBe(1);
  });

  it('should switch back to Contracts tab', () => {
    flushInitialLoad();

    component.onTabChange('Templates');
    const templateReq = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=true&page=1&pageSize=10`);
    templateReq.flush(mockPagedList);

    component.onTabChange('Contracts');
    const contractReq = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=false&page=1&pageSize=10`);
    contractReq.flush(mockPagedList);

    expect(component.activeTab()).toBe('Contracts');
  });

  it('should reset page when switching tabs', () => {
    flushInitialLoad();

    component.currentPage.set(3);
    component.onTabChange('Templates');
    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=true&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockContracts,
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=false&page=2&pageSize=10`);
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

    const req = httpTesting.expectOne(`${baseUrl}/api/contracts?isTemplate=false&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(`${baseUrl}/api/contracts?isTemplate=false&page=0&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(`${baseUrl}/api/contracts?isTemplate=false&page=2&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should return correct badge variants for each status', () => {
    flushInitialLoad();
    expect(component.getStatusBadgeVariant(ContractStatus.Draft)).toBe('neutral');
    expect(component.getStatusBadgeVariant(ContractStatus.Sent)).toBe('warning');
    expect(component.getStatusBadgeVariant(ContractStatus.Viewed)).toBe('warning');
    expect(component.getStatusBadgeVariant(ContractStatus.Signed)).toBe('success');
    expect(component.getStatusBadgeVariant(ContractStatus.Expired)).toBe('error');
    expect(component.getStatusBadgeVariant(ContractStatus.Cancelled)).toBe('error');
  });

  it('should format dates', () => {
    flushInitialLoad();
    const formatted = component.formatDate('2025-03-01T14:30:00Z');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('2025');
  });

  it('should emit createContract when button is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.createContract.subscribe(spy);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('lib-button[variant="primary"] button');
    btn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should render empty state when no contracts', () => {
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
    const contractsNoContact: ContractDto[] = [
      {
        id: '3',
        title: 'No Contact Contract',
        content: 'Content',
        status: ContractStatus.Draft,
        isTemplate: false,
        autoRemindersEnabled: false,
        fields: [],
        signatures: [],
        createdAt: '2025-01-15T10:00:00Z',
      },
    ];
    flushInitialLoad({
      items: contractsNoContact,
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

  it('should have correct tabs', () => {
    flushInitialLoad();
    expect(component.tabs).toEqual([
      { label: 'Contracts', icon: 'file-text', value: 'Contracts' },
      { label: 'Templates', icon: 'layout-template', value: 'Templates' },
    ]);
  });

  it('should default to Contracts tab', () => {
    flushInitialLoad();
    expect(component.activeTab()).toBe('Contracts');
  });

  it('should render contract rows with correct data', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('lib-table-data-row');
    expect(rows.length).toBe(2);

    const firstTitle = rows[0].querySelector('.col-title');
    expect(firstTitle.textContent.trim()).toBe('Wedding Photography Contract');

    const firstContact = rows[0].querySelector('.col-contact');
    expect(firstContact.textContent.trim()).toBe('Alice Johnson');
  });
});
