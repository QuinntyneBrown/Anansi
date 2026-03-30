import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG, PhotographerProfileDto, PagedList } from 'api';
import { DirectorySearchPageComponent } from './directory-search-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('DirectorySearchPageComponent', () => {
  let component: DirectorySearchPageComponent;
  let fixture: ComponentFixture<DirectorySearchPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockPhotographers: PhotographerProfileDto[] = [
    {
      id: 'p-1',
      displayName: 'Jane Doe',
      neighborhood: 'Scarborough',
      serviceRadiusKm: 25,
      culturalTags: [{ id: 'tag-1', label: 'Caribbean Wedding', isCustom: false, createdAt: '' }],
      rating: 4.5,
      reviewCount: 10,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockPagedList: PagedList<PhotographerProfileDto> = {
    items: mockPhotographers,
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorySearchPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DirectorySearchPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(): void {
    fixture.detectChanges();
    // Tags request (may fail, that's ok)
    const tagsReq = httpTesting.match(`${baseUrl}/api/discovery/cultural-tags`);
    tagsReq.forEach((r) => r.flush([]));
    // Directory search
    const searchReq = httpTesting.expectOne((req) => req.url.includes('/api/discovery/directory'));
    searchReq.flush(mockPagedList);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load photographers on init', () => {
    flushInitialLoad();
    expect(component.photographers()).toEqual(mockPhotographers);
    expect(component.totalCount()).toBe(1);
  });

  it('should toggle cultural tag filter', () => {
    flushInitialLoad();
    component.onFilterTag('tag-1');
    expect(component.activeTagId()).toBe('tag-1');

    const req = httpTesting.expectOne((r) => r.url.includes('/api/discovery/directory'));
    req.flush(mockPagedList);

    component.onFilterTag('tag-1');
    expect(component.activeTagId()).toBeNull();

    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/discovery/directory'));
    req2.flush(mockPagedList);
  });

  it('should generate star array from rating', () => {
    flushInitialLoad();
    const stars = component.getStars(3.7);
    expect(stars.length).toBe(5);
    expect(stars.filter((s) => s).length).toBe(4);
  });
});
