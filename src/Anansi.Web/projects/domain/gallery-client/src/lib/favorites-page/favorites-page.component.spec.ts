import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, FavoriteListDto, FavoriteItemDto, PagedList } from 'api';
import { FavoritesPageComponent } from './favorites-page.component';

describe('FavoritesPageComponent', () => {
  let component: FavoritesPageComponent;
  let fixture: ComponentFixture<FavoritesPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';
  const collectionId = 'col-1';

  const mockFavoriteLists: FavoriteListDto[] = [
    {
      id: 'fav-1',
      collectionId,
      name: 'My Picks',
      clientName: 'Alice Johnson',
      isPreset: false,
      isCompleted: false,
      itemCount: 5,
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-10T10:00:00Z',
    },
    {
      id: 'fav-2',
      collectionId,
      name: 'Final Selection',
      isPreset: true,
      isCompleted: true,
      itemCount: 3,
      createdAt: '2025-06-05T10:00:00Z',
      updatedAt: '2025-06-12T10:00:00Z',
    },
  ];

  const mockPagedList: PagedList<FavoriteListDto> = {
    items: mockFavoriteLists,
    page: 1,
    pageSize: 20,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const mockItems: FavoriteItemDto[] = [
    {
      id: 'item-1',
      favoriteListId: 'fav-1',
      mediaId: 'm-1',
      mediaFileName: 'photo1.jpg',
      comment: 'Love this one!',
      createdAt: '2025-06-02T10:00:00Z',
    },
    {
      id: 'item-2',
      favoriteListId: 'fav-1',
      mediaId: 'm-2',
      mediaFileName: 'photo2.jpg',
      createdAt: '2025-06-02T11:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('collectionId', collectionId);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: PagedList<FavoriteListDto> = mockPagedList): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites?collectionId=${collectionId}`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load favorite lists on init', () => {
    flushInitialLoad();
    expect(component.favoriteLists()).toEqual(mockFavoriteLists);
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/favorites?collectionId=${collectionId}`);
    req.flush(mockPagedList);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites?collectionId=${collectionId}`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should display page title', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.page-title');
    expect(title.textContent).toContain('Favorites');
  });

  it('should display favorite list names', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const names = fixture.nativeElement.querySelectorAll('.list-name');
    expect(names.length).toBe(2);
    expect(names[0].textContent).toContain('My Picks');
    expect(names[1].textContent).toContain('Final Selection');
  });

  it('should display client name when present', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const clients = fixture.nativeElement.querySelectorAll('.list-client');
    expect(clients.length).toBe(1);
    expect(clients[0].textContent).toContain('Alice Johnson');
  });

  it('should display item count', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const counts = fixture.nativeElement.querySelectorAll('.list-count');
    expect(counts[0].textContent).toContain('5 items');
    expect(counts[1].textContent).toContain('3 items');
  });

  it('should display completed badge when list is completed', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('lib-badge');
    expect(badges.length).toBe(1);
  });

  it('should show empty state when no favorite lists', () => {
    const emptyList: PagedList<FavoriteListDto> = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
    flushInitialLoad(emptyList);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should toggle create form visibility', () => {
    flushInitialLoad();
    expect(component.showCreateForm()).toBe(false);

    component.toggleCreateForm();
    expect(component.showCreateForm()).toBe(true);

    component.toggleCreateForm();
    expect(component.showCreateForm()).toBe(false);
  });

  it('should clear newListName when hiding create form', () => {
    flushInitialLoad();
    component.newListName = 'Test';
    component.showCreateForm.set(true);

    component.toggleCreateForm();
    expect(component.newListName).toBe('');
  });

  it('should create a new favorite list', () => {
    flushInitialLoad();
    component.showCreateForm.set(true);
    component.newListName = 'New List';

    component.onCreateList();
    expect(component.creating()).toBe(true);

    const req = httpTesting.expectOne(`${baseUrl}/api/favorites`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      collectionId,
      name: 'New List',
      isPreset: false,
    });

    const createdList: FavoriteListDto = {
      id: 'fav-new',
      collectionId,
      name: 'New List',
      isPreset: false,
      isCompleted: false,
      itemCount: 0,
      createdAt: '2025-06-20T10:00:00Z',
      updatedAt: '2025-06-20T10:00:00Z',
    };
    req.flush(createdList);

    expect(component.creating()).toBe(false);
    expect(component.favoriteLists().length).toBe(3);
    expect(component.newListName).toBe('');
    expect(component.showCreateForm()).toBe(false);
  });

  it('should not create list when name is empty', () => {
    flushInitialLoad();
    component.newListName = '   ';

    component.onCreateList();
    httpTesting.expectNone(`${baseUrl}/api/favorites`);
  });

  it('should not create list while already creating', () => {
    flushInitialLoad();
    component.newListName = 'Test';

    component.onCreateList();
    component.onCreateList();

    httpTesting.expectOne(`${baseUrl}/api/favorites`);
  });

  it('should set creating to false on create error', () => {
    flushInitialLoad();
    component.newListName = 'Test';

    component.onCreateList();
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites`);
    req.error(new ProgressEvent('Network error'));

    expect(component.creating()).toBe(false);
  });

  it('should select a list and load its items', () => {
    flushInitialLoad();

    component.onSelectList(mockFavoriteLists[0]);
    expect(component.selectedList()).toEqual(mockFavoriteLists[0]);
    expect(component.loadingItems()).toBe(true);

    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    expect(req.request.method).toBe('GET');
    req.flush(mockItems);

    expect(component.selectedItems()).toEqual(mockItems);
    expect(component.loadingItems()).toBe(false);
  });

  it('should set loadingItems to false on items load error', () => {
    flushInitialLoad();

    component.onSelectList(mockFavoriteLists[0]);
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.error(new ProgressEvent('Network error'));

    expect(component.loadingItems()).toBe(false);
  });

  it('should clear selected list', () => {
    flushInitialLoad();

    component.selectedList.set(mockFavoriteLists[0]);
    component.selectedItems.set(mockItems);

    component.clearSelectedList();
    expect(component.selectedList()).toBeNull();
    expect(component.selectedItems()).toEqual([]);
  });

  it('should display selected list items with filenames', () => {
    flushInitialLoad();

    component.onSelectList(mockFavoriteLists[0]);
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.flush(mockItems);
    fixture.detectChanges();

    const filenames = fixture.nativeElement.querySelectorAll('.item-filename');
    expect(filenames.length).toBe(2);
    expect(filenames[0].textContent).toContain('photo1.jpg');
    expect(filenames[1].textContent).toContain('photo2.jpg');
  });

  it('should display item comment when present', () => {
    flushInitialLoad();

    component.onSelectList(mockFavoriteLists[0]);
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.flush(mockItems);
    fixture.detectChanges();

    const comments = fixture.nativeElement.querySelectorAll('.item-comment');
    expect(comments.length).toBe(1);
    expect(comments[0].textContent).toContain('Love this one!');
  });

  it('should show empty state for selected list with no items', () => {
    flushInitialLoad();

    component.onSelectList(mockFavoriteLists[0]);
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.flush([]);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('.items-section');
    expect(section).toBeTruthy();
    const emptyState = section.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show items title matching selected list name', () => {
    flushInitialLoad();

    component.onSelectList(mockFavoriteLists[0]);
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.flush(mockItems);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.items-title');
    expect(title.textContent).toContain('My Picks');
  });

  it('should show Unknown when mediaFileName is not provided', () => {
    flushInitialLoad();

    const itemsWithNoFilename: FavoriteItemDto[] = [
      {
        id: 'item-x',
        favoriteListId: 'fav-1',
        mediaId: 'm-x',
        createdAt: '2025-06-02T10:00:00Z',
      },
    ];
    component.onSelectList(mockFavoriteLists[0]);
    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.flush(itemsWithNoFilename);
    fixture.detectChanges();

    const filename = fixture.nativeElement.querySelector('.item-filename');
    expect(filename.textContent).toContain('Unknown');
  });

  it('should render create form when showCreateForm is true', () => {
    flushInitialLoad();
    component.showCreateForm.set(true);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.create-form');
    expect(form).toBeTruthy();
    const input = form.querySelector('lib-input-group');
    expect(input).toBeTruthy();
  });

  it('should not render create form by default', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.create-form');
    expect(form).toBeFalsy();
  });

  it('should show creating spinner inside create button', () => {
    flushInitialLoad();
    component.showCreateForm.set(true);
    component.newListName = 'Test';
    fixture.detectChanges();

    component.onCreateList();
    fixture.detectChanges();

    const createFormButton = fixture.nativeElement.querySelector('.create-form lib-button');
    expect(createFormButton).toBeTruthy();
    const spinner = createFormButton.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/favorites`);
    req.flush({
      id: 'fav-new',
      collectionId,
      name: 'Test',
      isPreset: false,
      isCompleted: false,
      itemCount: 0,
      createdAt: '2025-06-20T10:00:00Z',
      updatedAt: '2025-06-20T10:00:00Z',
    });
  });

  it('should show items loading spinner when fetching items', () => {
    flushInitialLoad();
    fixture.detectChanges();

    component.onSelectList(mockFavoriteLists[0]);
    fixture.detectChanges();

    const itemsSection = fixture.nativeElement.querySelector('.items-section');
    expect(itemsSection).toBeTruthy();
    const spinner = itemsSection.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/favorites/fav-1/items`);
    req.flush(mockItems);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('.items-section lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });
});
