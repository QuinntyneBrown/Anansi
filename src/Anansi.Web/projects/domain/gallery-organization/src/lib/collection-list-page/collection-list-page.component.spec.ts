import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  CollectionSummaryDto,
  CollectionStatus,
  CoverStyle,
  GalleryLanguage,
  PagedList,
} from 'api';
import { LUCIDE_ICONS } from 'lucide-angular';
import { CollectionListPageComponent } from './collection-list-page.component';

const DUMMY_ICON = [['path', { d: 'M0 0' }]] as const;

class AllIconsProvider {
  hasIcon(): boolean {
    return true;
  }
  getIcon() {
    return DUMMY_ICON;
  }
}

describe('CollectionListPageComponent', () => {
  let component: CollectionListPageComponent;
  let fixture: ComponentFixture<CollectionListPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockCollections: CollectionSummaryDto[] = [
    {
      id: 'c1',
      title: 'Wedding Photos',
      slug: 'wedding-photos',
      status: CollectionStatus.Published,
      coverStyle: CoverStyle.Reef,
      isStarred: false,
      language: GalleryLanguage.English,
      createdAt: '2025-06-01T10:00:00Z',
      setCount: 3,
      mediaCount: 150,
    },
    {
      id: 'c2',
      title: 'Portrait Session',
      slug: 'portrait-session',
      status: CollectionStatus.Draft,
      coverStyle: CoverStyle.West,
      isStarred: true,
      language: GalleryLanguage.English,
      createdAt: '2025-07-15T14:00:00Z',
      setCount: 1,
      mediaCount: 42,
    },
  ];

  const mockPagedList: PagedList<CollectionSummaryDto> = {
    items: mockCollections,
    page: 1,
    pageSize: 12,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CollectionListPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    response: PagedList<CollectionSummaryDto> = mockPagedList,
  ): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?page=1&pageSize=12`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load collections on init', () => {
    flushInitialLoad();
    expect(component.collections()).toEqual(mockCollections);
    expect(component.loading()).toBe(false);
    expect(component.totalCount()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?page=1&pageSize=12`,
    );
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?page=1&pageSize=12`,
    );
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should filter by status tab', () => {
    flushInitialLoad();

    component.onStatusChange(CollectionStatus.Draft);
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?status=Draft&page=1&pageSize=12`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList);

    expect(component.activeStatus()).toBe(CollectionStatus.Draft);
    expect(component.currentPage()).toBe(1);
  });

  it('should reset page when switching status tabs', () => {
    flushInitialLoad();

    component.currentPage.set(3);
    component.onStatusChange(CollectionStatus.Published);
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?status=Published&page=1&pageSize=12`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should load all when All tab selected', () => {
    flushInitialLoad();

    component.onStatusChange(CollectionStatus.Draft);
    const draftReq = httpTesting.expectOne(
      `${baseUrl}/api/collections?status=Draft&page=1&pageSize=12`,
    );
    draftReq.flush(mockPagedList);

    component.onStatusChange('All');
    const allReq = httpTesting.expectOne(
      `${baseUrl}/api/collections?page=1&pageSize=12`,
    );
    allReq.flush(mockPagedList);
  });

  it('should search collections', () => {
    flushInitialLoad();

    const event = { target: { value: 'Wedding' } } as unknown as Event;
    component.onSearch(event);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?search=Wedding&page=1&pageSize=12`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [mockCollections[0]],
      page: 1,
      pageSize: 12,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    expect(component.collections().length).toBe(1);
    expect(component.searchQuery()).toBe('Wedding');
  });

  it('should reset page on search', () => {
    flushInitialLoad();

    component.currentPage.set(5);
    const event = { target: { value: 'test' } } as unknown as Event;
    component.onSearch(event);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?search=test&page=1&pageSize=12`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should combine status filter and search', () => {
    flushInitialLoad();

    component.onStatusChange(CollectionStatus.Published);
    const statusReq = httpTesting.expectOne(
      `${baseUrl}/api/collections?status=Published&page=1&pageSize=12`,
    );
    statusReq.flush(mockPagedList);

    const event = { target: { value: 'Wedding' } } as unknown as Event;
    component.onSearch(event);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?status=Published&search=Wedding&page=1&pageSize=12`,
    );
    req.flush(mockPagedList);
  });

  it('should clear search by setting empty value', () => {
    flushInitialLoad();

    const event = { target: { value: 'Wedding' } } as unknown as Event;
    component.onSearch(event);
    const req1 = httpTesting.expectOne(
      `${baseUrl}/api/collections?search=Wedding&page=1&pageSize=12`,
    );
    req1.flush(mockPagedList);

    const clearEvent = { target: { value: '' } } as unknown as Event;
    component.onSearch(clearEvent);
    const req2 = httpTesting.expectOne(
      `${baseUrl}/api/collections?page=1&pageSize=12`,
    );
    req2.flush(mockPagedList);

    expect(component.searchQuery()).toBe('');
  });

  it('should toggle star on a collection', () => {
    flushInitialLoad();

    component.onToggleStar(mockCollections[0]);
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/c1/star`,
    );
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(component.collections()[0].isStarred).toBe(true);
    expect(component.collections()[1].isStarred).toBe(true);
  });

  it('should toggle star off a starred collection', () => {
    flushInitialLoad();

    component.onToggleStar(mockCollections[1]);
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/c2/star`,
    );
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(component.collections()[1].isStarred).toBe(false);
  });

  it('should navigate to next page', () => {
    flushInitialLoad({
      items: mockCollections,
      page: 1,
      pageSize: 12,
      totalCount: 24,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });

    component.onNextPage();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections?page=2&pageSize=12`,
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
      `${baseUrl}/api/collections?page=1&pageSize=12`,
    );
    req.flush(mockPagedList);

    expect(component.currentPage()).toBe(1);
  });

  it('should not go below page 1', () => {
    flushInitialLoad();

    component.onPreviousPage();
    httpTesting.expectNone(
      `${baseUrl}/api/collections?page=0&pageSize=12`,
    );
    expect(component.currentPage()).toBe(1);
  });

  it('should not go above total pages', () => {
    flushInitialLoad();

    component.onNextPage();
    httpTesting.expectNone(
      `${baseUrl}/api/collections?page=2&pageSize=12`,
    );
    expect(component.currentPage()).toBe(1);
  });

  it('should return correct badge variant for Published', () => {
    flushInitialLoad();
    expect(
      component.getStatusBadgeVariant(CollectionStatus.Published),
    ).toBe('success');
  });

  it('should return correct badge variant for Draft', () => {
    flushInitialLoad();
    expect(component.getStatusBadgeVariant(CollectionStatus.Draft)).toBe(
      'warning',
    );
  });

  it('should return correct badge variant for Hidden', () => {
    flushInitialLoad();
    expect(component.getStatusBadgeVariant(CollectionStatus.Hidden)).toBe(
      'neutral',
    );
  });

  it('should return correct badge variant for Expired', () => {
    flushInitialLoad();
    expect(
      component.getStatusBadgeVariant(CollectionStatus.Expired),
    ).toBe('error');
  });

  it('should format dates', () => {
    flushInitialLoad();
    const formatted = component.formatDate('2025-06-01T10:00:00Z');
    expect(formatted).toContain('Jun');
    expect(formatted).toContain('2025');
  });

  it('should have correct status tabs', () => {
    flushInitialLoad();
    expect(component.statusTabs.map((t) => t.value)).toEqual([
      'All',
      'Draft',
      'Published',
      'Hidden',
    ]);
  });

  it('should emit createCollection output', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.createCollection.subscribe(spy);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      'lib-button[variant="primary"] button',
    );
    btn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should display collection cards', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    expect(cards.length).toBe(2);
  });

  it('should display collection titles', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const titles = fixture.nativeElement.querySelectorAll('.collection-title');
    expect(titles[0].textContent).toContain('Wedding Photos');
    expect(titles[1].textContent).toContain('Portrait Session');
  });

  it('should display media and set counts', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const stats = fixture.nativeElement.querySelectorAll('.card-stats');
    expect(stats[0].textContent).toContain('150');
    expect(stats[0].textContent).toContain('3');
  });

  it('should show empty state when no collections', () => {
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

  it('should display correct pagination info', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const info = fixture.nativeElement.querySelector('.pagination-info');
    expect(info.textContent).toContain('Showing 2 of 2');
  });

  it('should show starred icon for starred collection', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const starBtns = fixture.nativeElement.querySelectorAll('.star-btn');
    expect(starBtns[0].classList.contains('starred')).toBe(false);
    expect(starBtns[1].classList.contains('starred')).toBe(true);
  });

  it('should display status badges', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('lib-badge');
    expect(badges.length).toBe(2);
  });
});
