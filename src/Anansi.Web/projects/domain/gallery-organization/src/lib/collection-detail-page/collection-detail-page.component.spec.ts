import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  CollectionDto,
  CollectionStatus,
  CoverStyle,
  ThemeMode,
  GridLayout,
  GalleryLanguage,
  SlideshowSpeed,
  GalleryActivityDto,
  ActivityType,
  PagedList,
} from 'api';
import { CollectionDetailPageComponent } from './collection-detail-page.component';

describe('CollectionDetailPageComponent', () => {
  let component: CollectionDetailPageComponent;
  let fixture: ComponentFixture<CollectionDetailPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockCollection: CollectionDto = {
    id: 'col-1',
    title: 'Wedding Photos',
    description: 'Beautiful wedding gallery',
    slug: 'wedding-photos',
    status: CollectionStatus.Published,
    coverStyle: CoverStyle.Reef,
    theme: ThemeMode.Dark,
    fontFamily: 'Serif',
    colorPalette: 'warm',
    layout: GridLayout.Vertical,
    downloadsEnabled: true,
    downloadPinEnabled: false,
    downloadCount: 5,
    allowedResolutions: 'Original',
    slideshowSpeed: SlideshowSpeed.Medium,
    slideshowAutoLoop: true,
    language: GalleryLanguage.English,
    embeddingEnabled: false,
    isStarred: false,
    requireEmailRegistration: false,
    hasPassword: false,
    hasClientExclusivePassword: false,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-08-15T16:00:00Z',
    setCount: 3,
    mediaCount: 150,
  };

  const mockActivities: GalleryActivityDto[] = [
    {
      id: 'a1',
      collectionId: 'col-1',
      activityType: ActivityType.Download,
      actorName: 'Alice',
      actorEmail: 'alice@example.com',
      details: 'Downloaded full gallery',
      createdAt: '2025-08-10T12:00:00Z',
    },
    {
      id: 'a2',
      collectionId: 'col-1',
      activityType: ActivityType.View,
      createdAt: '2025-08-09T09:00:00Z',
    },
    {
      id: 'a3',
      collectionId: 'col-1',
      activityType: ActivityType.Favorite,
      actorName: 'Bob',
      createdAt: '2025-08-08T15:00:00Z',
    },
  ];

  const mockActivitiesPagedList: PagedList<GalleryActivityDto> = {
    items: mockActivities,
    page: 1,
    pageSize: 20,
    totalCount: 3,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CollectionDetailPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('collectionId', 'col-1');
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushCollectionLoad(
    collection: CollectionDto = mockCollection,
  ): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(collection);
  }

  it('should create', () => {
    flushCollectionLoad();
    expect(component).toBeTruthy();
  });

  it('should load collection on init', () => {
    flushCollectionLoad();
    expect(component.collection()).toEqual(mockCollection);
    expect(component.loading()).toBe(false);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1`,
    );
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
    expect(component.collection()).toBeNull();
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1`,
    );
    req.flush(mockCollection);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector(
      '.page > .loading-container lib-spinner',
    );
    expect(spinnerAfter).toBeFalsy();
  });

  it('should display collection title', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.collection-title');
    expect(title.textContent).toContain('Wedding Photos');
  });

  it('should display collection description', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const desc = fixture.nativeElement.querySelector(
      '.collection-description',
    );
    expect(desc.textContent).toContain('Beautiful wedding gallery');
  });

  it('should not show description when not provided', () => {
    const noDesc = { ...mockCollection, description: undefined };
    flushCollectionLoad(noDesc);
    fixture.detectChanges();

    const desc = fixture.nativeElement.querySelector(
      '.collection-description',
    );
    expect(desc).toBeFalsy();
  });

  it('should display breadcrumbs', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const breadcrumb = fixture.nativeElement.querySelector('lib-breadcrumb');
    expect(breadcrumb).toBeTruthy();
  });

  it('should build correct breadcrumbs', () => {
    flushCollectionLoad();
    const crumbs = component.getBreadcrumbs(mockCollection);
    expect(crumbs).toEqual([
      { label: 'Collections', href: '/collections' },
      { label: 'Wedding Photos' },
    ]);
  });

  it('should display status badge', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector(
      '.title-row lib-badge',
    );
    expect(badge).toBeTruthy();
  });

  it('should default to media tab', () => {
    flushCollectionLoad();
    expect(component.activeTab()).toBe('media');
  });

  it('should switch tabs', () => {
    flushCollectionLoad();
    component.onTabChange('settings');
    expect(component.activeTab()).toBe('settings');
  });

  it('should have correct tabs', () => {
    flushCollectionLoad();
    expect(component.tabs).toEqual([
      { label: 'Media', value: 'media' },
      { label: 'Settings', value: 'settings' },
      { label: 'Activity', value: 'activity' },
    ]);
  });

  it('should show media count info when collection has media', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const mediaInfo = fixture.nativeElement.querySelector(
      '.media-count-info',
    );
    expect(mediaInfo.textContent).toContain('150');
  });

  it('should show empty state when collection has no media', () => {
    const noMedia = { ...mockCollection, mediaCount: 0 };
    flushCollectionLoad(noMedia);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector(
      '.media-grid-placeholder lib-empty-state',
    );
    expect(emptyState).toBeTruthy();
  });

  it('should show settings cards when settings tab selected', () => {
    flushCollectionLoad();
    component.onTabChange('settings');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll(
      '.settings-cards lib-card',
    );
    expect(cards.length).toBe(2);
  });

  it('should display general settings info', () => {
    flushCollectionLoad();
    component.onTabChange('settings');
    fixture.detectChanges();

    const settingsCards = fixture.nativeElement.querySelectorAll(
      '.settings-cards lib-card',
    );
    const generalCard = settingsCards[0];
    expect(generalCard.textContent).toContain('wedding-photos');
    expect(generalCard.textContent).toContain('Dark');
    expect(generalCard.textContent).toContain('Vertical');
    expect(generalCard.textContent).toContain('Serif');
    expect(generalCard.textContent).toContain('warm');
  });

  it('should display download settings info', () => {
    flushCollectionLoad();
    component.onTabChange('settings');
    fixture.detectChanges();

    const settingsCards = fixture.nativeElement.querySelectorAll(
      '.settings-cards lib-card',
    );
    const downloadCard = settingsCards[1];
    expect(downloadCard.textContent).toContain('Yes');
    expect(downloadCard.textContent).toContain('5');
  });

  it('should show No for downloads disabled', () => {
    const noDownloads = { ...mockCollection, downloadsEnabled: false };
    flushCollectionLoad(noDownloads);
    component.onTabChange('settings');
    fixture.detectChanges();

    const settingsCards = fixture.nativeElement.querySelectorAll(
      '.settings-cards lib-card',
    );
    const downloadCard = settingsCards[1];
    expect(downloadCard.textContent).toContain('No');
  });

  it('should load activities when activity tab is selected', () => {
    flushCollectionLoad();

    component.onTabChange('activity');

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockActivitiesPagedList);

    expect(component.activities()).toEqual(mockActivities);
    expect(component.activitiesLoading()).toBe(false);
  });

  it('should show activity spinner while loading activities', () => {
    flushCollectionLoad();
    component.onTabChange('activity');
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector(
      '.tab-content lib-spinner',
    );
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.flush(mockActivitiesPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector(
      '.tab-content lib-spinner',
    );
    expect(spinnerAfter).toBeFalsy();
  });

  it('should display activity items', () => {
    flushCollectionLoad();
    component.onTabChange('activity');

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.flush(mockActivitiesPagedList);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.activity-item');
    expect(items.length).toBe(3);
  });

  it('should display activity actor name', () => {
    flushCollectionLoad();
    component.onTabChange('activity');

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.flush(mockActivitiesPagedList);
    fixture.detectChanges();

    const actors = fixture.nativeElement.querySelectorAll('.activity-actor');
    expect(actors[0].textContent).toContain('Alice');
  });

  it('should display activity details', () => {
    flushCollectionLoad();
    component.onTabChange('activity');

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.flush(mockActivitiesPagedList);
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelectorAll(
      '.activity-detail-text',
    );
    expect(details[0].textContent).toContain('Downloaded full gallery');
  });

  it('should show empty state when no activities', () => {
    flushCollectionLoad();
    component.onTabChange('activity');

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.flush({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    });
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector(
      '.tab-content lib-empty-state',
    );
    expect(emptyState).toBeTruthy();
  });

  it('should set activitiesLoading to false on error', () => {
    flushCollectionLoad();
    component.onTabChange('activity');

    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.error(new ProgressEvent('Network error'));
    expect(component.activitiesLoading()).toBe(false);
  });

  it('should not reload activities if already loaded', () => {
    flushCollectionLoad();

    component.onTabChange('activity');
    const req = httpTesting.expectOne(
      `${baseUrl}/api/collections/col-1/activities`,
    );
    req.flush(mockActivitiesPagedList);

    component.onTabChange('settings');
    component.onTabChange('activity');

    httpTesting.expectNone(
      `${baseUrl}/api/collections/col-1/activities`,
    );
  });

  it('should display sidebar with collection info', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('.sidebar lib-card');
    expect(sidebar).toBeTruthy();
    expect(sidebar.textContent).toContain('150');
    expect(sidebar.textContent).toContain('3');
  });

  it('should display sidebar dates', () => {
    flushCollectionLoad();
    fixture.detectChanges();

    const infoValues =
      fixture.nativeElement.querySelectorAll('.sidebar .info-value');
    expect(infoValues.length).toBe(4);
    expect(infoValues[2].textContent).toContain('Jun');
    expect(infoValues[3].textContent).toContain('Aug');
  });

  it('should return correct badge variant for Published', () => {
    flushCollectionLoad();
    expect(
      component.getStatusBadgeVariant(CollectionStatus.Published),
    ).toBe('success');
  });

  it('should return correct badge variant for Draft', () => {
    flushCollectionLoad();
    expect(
      component.getStatusBadgeVariant(CollectionStatus.Draft),
    ).toBe('warning');
  });

  it('should return correct badge variant for Hidden', () => {
    flushCollectionLoad();
    expect(
      component.getStatusBadgeVariant(CollectionStatus.Hidden),
    ).toBe('neutral');
  });

  it('should return correct badge variant for Expired', () => {
    flushCollectionLoad();
    expect(
      component.getStatusBadgeVariant(CollectionStatus.Expired),
    ).toBe('error');
  });

  it('should return correct activity badge variant for Download', () => {
    flushCollectionLoad();
    expect(component.getActivityBadgeVariant('Download')).toBe('success');
  });

  it('should return correct activity badge variant for Favorite', () => {
    flushCollectionLoad();
    expect(component.getActivityBadgeVariant('Favorite')).toBe('warning');
  });

  it('should return correct activity badge variant for View', () => {
    flushCollectionLoad();
    expect(component.getActivityBadgeVariant('View')).toBe('neutral');
  });

  it('should return neutral for unknown activity type', () => {
    flushCollectionLoad();
    expect(component.getActivityBadgeVariant('Unknown')).toBe('neutral');
  });

  it('should format dates', () => {
    flushCollectionLoad();
    const formatted = component.formatDate('2025-06-01T10:00:00Z');
    expect(formatted).toContain('Jun');
    expect(formatted).toContain('2025');
  });
});
