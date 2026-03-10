import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, ContactDto, ContactType, PagedList } from 'api';
import { ContactListPageComponent } from './contact-list-page.component';

describe('ContactListPageComponent', () => {
  let component: ContactListPageComponent;
  let fixture: ComponentFixture<ContactListPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockContacts: ContactDto[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      phone: '555-0101',
      contactType: ContactType.Client,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-03-01T14:30:00Z',
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      contactType: ContactType.Lead,
      createdAt: '2025-02-10T09:00:00Z',
      updatedAt: '2025-02-28T11:00:00Z',
    },
  ];

  const mockPagedList: PagedList<ContactDto> = {
    items: mockContacts,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ContactListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactListPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    httpTesting.verify();
  });

  function flushInitialLoad(response: PagedList<ContactDto> = mockPagedList): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load contacts on init', () => {
    flushInitialLoad();
    expect(component.contacts()).toEqual(mockContacts);
    expect(component.loading()).toBe(false);
    expect(component.totalCount()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?page=1&pageSize=10`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should filter by tab', () => {
    flushInitialLoad();

    component.onTabChange(ContactType.Client);
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?type=Client&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList);

    expect(component.activeTab()).toBe(ContactType.Client);
    expect(component.currentPage()).toBe(1);
  });

  it('should reset page when switching tabs', () => {
    flushInitialLoad();

    component.currentPage.set(3);
    component.onTabChange(ContactType.Lead);
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?type=Lead&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should search contacts after debounce', () => {
    flushInitialLoad();

    const event = { target: { value: 'Alice' } } as unknown as Event;
    component.onSearch(event);

    vi.advanceTimersByTime(300);

    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?search=Alice&page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [mockContacts[0]],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    expect(component.contacts().length).toBe(1);
    expect(component.searchQuery()).toBe('Alice');
  });

  it('should reset page on search', () => {
    flushInitialLoad();

    component.currentPage.set(5);
    const event = { target: { value: 'test' } } as unknown as Event;
    component.onSearch(event);

    vi.advanceTimersByTime(300);

    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?search=test&page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should search with filter combined', () => {
    flushInitialLoad();

    component.onTabChange(ContactType.Client);
    const tabReq = httpTesting.expectOne(`${baseUrl}/api/contacts?type=Client&page=1&pageSize=10`);
    tabReq.flush(mockPagedList);

    const event = { target: { value: 'Alice' } } as unknown as Event;
    component.onSearch(event);

    vi.advanceTimersByTime(300);

    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?type=Client&search=Alice&page=1&pageSize=10`);
    req.flush(mockPagedList);
  });

  it('should load all when All tab selected', () => {
    flushInitialLoad();

    component.onTabChange(ContactType.Client);
    const clientReq = httpTesting.expectOne(`${baseUrl}/api/contacts?type=Client&page=1&pageSize=10`);
    clientReq.flush(mockPagedList);

    component.onTabChange('All');
    const allReq = httpTesting.expectOne(`${baseUrl}/api/contacts?page=1&pageSize=10`);
    allReq.flush(mockPagedList);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockContacts,
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?page=2&pageSize=10`);
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

    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?page=1&pageSize=10`);
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(`${baseUrl}/api/contacts?page=0&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(`${baseUrl}/api/contacts?page=2&pageSize=10`);
    expect(component.currentPage()).toBe(1);
  });

  it('should compute initials correctly', () => {
    flushInitialLoad();
    expect(component.getInitials(mockContacts[0])).toBe('AJ');
    expect(component.getInitials(mockContacts[1])).toBe('BS');
  });

  it('should return correct badge variants', () => {
    flushInitialLoad();
    expect(component.getBadgeVariant(ContactType.Client)).toBe('success');
    expect(component.getBadgeVariant(ContactType.Lead)).toBe('warning');
    expect(component.getBadgeVariant(ContactType.Other)).toBe('neutral');
  });

  it('should format dates', () => {
    flushInitialLoad();
    const formatted = component.formatDate('2025-03-01T14:30:00Z');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('2025');
  });

  it('should emit contactSelected when row is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.contactSelected.subscribe(spy);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.clickable-row');
    row.click();

    expect(spy).toHaveBeenCalledWith(mockContacts[0]);
  });

  it('should emit addContact when button is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.addContact.subscribe(spy);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('lib-button[variant="primary"] button');
    btn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should render empty state when no contacts', () => {
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

    const emptyEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('No contacts found');
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/contacts?page=1&pageSize=10`);
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should display correct pagination info', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const info = fixture.nativeElement.querySelector('.pagination-info');
    expect(info.textContent).toContain('Showing 2 of 2');
  });

  it('should display phone as dash when not provided', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('lib-table-data-row');
    const secondRowPhone = rows[1].querySelector('.col-phone');
    expect(secondRowPhone.textContent.trim()).toContain('—');
  });

  it('should have correct tabs', () => {
    flushInitialLoad();
    expect(component.tabs).toEqual([
      { label: 'All', value: 'All' },
      { label: 'Clients', value: 'Client' },
      { label: 'Leads', value: 'Lead' },
      { label: 'Other', value: 'Other' },
    ]);
  });

  it('should clear search by setting empty value', () => {
    flushInitialLoad();

    const event = { target: { value: 'Alice' } } as unknown as Event;
    component.onSearch(event);
    vi.advanceTimersByTime(300);
    const req1 = httpTesting.expectOne(`${baseUrl}/api/contacts?search=Alice&page=1&pageSize=10`);
    req1.flush(mockPagedList);

    const clearEvent = { target: { value: '' } } as unknown as Event;
    component.onSearch(clearEvent);
    vi.advanceTimersByTime(300);
    const req2 = httpTesting.expectOne(`${baseUrl}/api/contacts?page=1&pageSize=10`);
    req2.flush(mockPagedList);

    expect(component.searchQuery()).toBe('');
  });
});
