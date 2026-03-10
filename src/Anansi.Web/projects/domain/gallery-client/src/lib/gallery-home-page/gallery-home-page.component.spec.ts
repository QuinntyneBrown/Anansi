import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, CollectionDto, GalleryMediaDto, PagedList } from 'api';
import { GalleryHomePageComponent } from './gallery-home-page.component';

describe('GalleryHomePageComponent', () => {
  let component: GalleryHomePageComponent;
  let fixture: ComponentFixture<GalleryHomePageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';
  const collectionId = 'col-1';

  const mockCollection: CollectionDto = {
    id: collectionId,
    title: 'Wedding Gallery',
    description: 'A beautiful wedding',
    slug: 'wedding-gallery',
    status: 'Published' as any,
    coverStyle: 'Photo' as any,
    theme: 'Light' as any,
    fontFamily: 'Inter',
    colorPalette: 'Default',
    layout: 'Grid' as any,
    downloadsEnabled: true,
    downloadPinEnabled: false,
    downloadCount: 0,
    allowedResolutions: 'Original',
    slideshowSpeed: 'Medium' as any,
    slideshowAutoLoop: false,
    language: 'English' as any,
    embeddingEnabled: false,
    isStarred: false,
    requireEmailRegistration: false,
    hasPassword: false,
    hasClientExclusivePassword: false,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-15T10:00:00Z',
    setCount: 2,
    mediaCount: 10,
  };

  const mockMedia: GalleryMediaDto[] = [
    {
      id: 'm-1',
      collectionId,
      fileName: 'photo1.jpg',
      originalFileName: 'IMG_0001.jpg',
      mediaType: 'Photo' as any,
      contentType: 'image/jpeg',
      fileSizeBytes: 4096000,
      width: 4000,
      height: 3000,
      sortOrder: 1,
      isStarred: true,
      isPrivate: false,
      createdAt: '2025-06-01T10:00:00Z',
    },
    {
      id: 'm-2',
      collectionId,
      fileName: 'photo2.jpg',
      originalFileName: 'IMG_0002.jpg',
      mediaType: 'Photo' as any,
      contentType: 'image/jpeg',
      fileSizeBytes: 3500000,
      width: 3000,
      height: 2000,
      sortOrder: 2,
      isStarred: false,
      isPrivate: false,
      createdAt: '2025-06-01T11:00:00Z',
    },
  ];

  const mockMediaPagedList: PagedList<GalleryMediaDto> = {
    items: mockMedia,
    page: 1,
    pageSize: 20,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryHomePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(GalleryHomePageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('collectionId', collectionId);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    collection: CollectionDto = mockCollection,
    mediaList: PagedList<GalleryMediaDto> = mockMediaPagedList,
  ): void {
    fixture.detectChanges();
    const colReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}`);
    expect(colReq.request.method).toBe('GET');
    colReq.flush(collection);
    const mediaReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/media`);
    expect(mediaReq.request.method).toBe('GET');
    mediaReq.flush(mediaList);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load collection and media on init', () => {
    flushInitialLoad();
    expect(component.collection()).toEqual(mockCollection);
    expect(component.media()).toEqual(mockMedia);
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const colReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}`);
    colReq.flush(mockCollection);
    const mediaReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/media`);
    mediaReq.flush(mockMediaPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should display collection title', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.gallery-title');
    expect(title.textContent).toContain('Wedding Gallery');
  });

  it('should display collection description', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const desc = fixture.nativeElement.querySelector('.gallery-description');
    expect(desc.textContent).toContain('A beautiful wedding');
  });

  it('should not display description when not present', () => {
    const colNoDesc: CollectionDto = { ...mockCollection, description: undefined };
    flushInitialLoad(colNoDesc);
    fixture.detectChanges();

    const desc = fixture.nativeElement.querySelector('.gallery-description');
    expect(desc).toBeFalsy();
  });

  it('should render photo cards for each media item', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.photo-card');
    expect(cards.length).toBe(2);
  });

  it('should display original file name on thumbnail', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const filenames = fixture.nativeElement.querySelectorAll('.photo-filename');
    expect(filenames[0].textContent).toContain('IMG_0001.jpg');
    expect(filenames[1].textContent).toContain('IMG_0002.jpg');
  });

  it('should show star indicator for starred photos', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.photo-card');
    const star0 = cards[0].querySelector('.star-indicator');
    expect(star0).toBeTruthy();

    const star1 = cards[1].querySelector('.star-indicator');
    expect(star1).toBeFalsy();
  });

  it('should emit photoSelected when photo is clicked', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const spy = vi.fn();
    component.photoSelected.subscribe(spy);

    const card = fixture.nativeElement.querySelector('.photo-card');
    card.click();

    expect(spy).toHaveBeenCalledWith(mockMedia[0]);
  });

  it('should emit photoSelected on keydown enter', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const spy = vi.fn();
    component.photoSelected.subscribe(spy);

    const card = fixture.nativeElement.querySelector('.photo-card');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).toHaveBeenCalledWith(mockMedia[0]);
  });

  it('should show empty state when no media', () => {
    const emptyList: PagedList<GalleryMediaDto> = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
    flushInitialLoad(mockCollection, emptyList);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should set loading to false on collection load error', () => {
    fixture.detectChanges();
    const colReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}`);
    colReq.error(new ProgressEvent('Network error'));

    expect(component.loading()).toBe(false);
    expect(component.collection()).toBeNull();
  });

  it('should set loading to false on media load error', () => {
    fixture.detectChanges();
    const colReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}`);
    colReq.flush(mockCollection);

    const mediaReq = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/media`);
    mediaReq.error(new ProgressEvent('Network error'));

    expect(component.loading()).toBe(false);
    expect(component.collection()).toEqual(mockCollection);
    expect(component.media()).toEqual([]);
  });

  it('should not show photo grid when no media', () => {
    const emptyList: PagedList<GalleryMediaDto> = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
    flushInitialLoad(mockCollection, emptyList);
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.photo-grid');
    expect(grid).toBeFalsy();
  });

  it('should call onPhotoClick which emits the media item', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.photoSelected.subscribe(spy);

    component.onPhotoClick(mockMedia[1]);
    expect(spy).toHaveBeenCalledWith(mockMedia[1]);
  });
});
