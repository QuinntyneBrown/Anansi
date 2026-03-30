import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import {
  API_CONFIG,
  PresetDto,
  SkinToneRange,
  PresetContext,
  PresetVisibility,
  PagedList,
} from 'api';
import { PresetLibraryPageComponent } from './preset-library-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('PresetLibraryPageComponent', () => {
  let component: PresetLibraryPageComponent;
  let fixture: ComponentFixture<PresetLibraryPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockPresets: PresetDto[] = [
    {
      id: 'pr-1',
      name: 'Golden Glow',
      authorName: 'Jane',
      authorId: 'u-1',
      skinTone: SkinToneRange.Deep,
      context: PresetContext.GoldenHour,
      visibility: PresetVisibility.Public,
      isFavorited: false,
      favoriteCount: 5,
      downloadCount: 20,
      adjustments: {
        hue: 10, saturation: 15, luminance: 5, highlights: -10,
        shadows: 20, contrast: 10, temperature: 15, tint: 0,
        vibrance: 12, clarity: 8,
      },
      createdAt: '2025-06-01T00:00:00Z',
    },
  ];

  const mockPagedList: PagedList<PresetDto> = {
    items: mockPresets,
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetLibraryPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PresetLibraryPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/presets'));
    req.flush(mockPagedList);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load presets on init', () => {
    flushInitialLoad();
    expect(component.presets()).toEqual(mockPresets);
    expect(component.loading()).toBe(false);
  });

  it('should filter by skin tone', () => {
    flushInitialLoad();
    component.onSkinToneFilter(SkinToneRange.Deep);
    expect(component.activeSkinTone()).toBe(SkinToneRange.Deep);

    const req = httpTesting.expectOne((r) => r.url.includes('/api/presets') && r.params.has('skinTone'));
    expect(req.request.params.get('skinTone')).toBe(SkinToneRange.Deep);
    req.flush(mockPagedList);
  });

  it('should toggle skin tone filter off', () => {
    flushInitialLoad();
    component.onSkinToneFilter(SkinToneRange.Deep);
    const req1 = httpTesting.expectOne((r) => r.url.includes('/api/presets'));
    req1.flush(mockPagedList);

    component.onSkinToneFilter(SkinToneRange.Deep);
    expect(component.activeSkinTone()).toBeNull();
    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/presets'));
    req2.flush(mockPagedList);
  });

  it('should filter by context', () => {
    flushInitialLoad();
    component.onContextFilter(PresetContext.Studio);
    expect(component.activeContext()).toBe(PresetContext.Studio);

    const req = httpTesting.expectOne((r) => r.url.includes('/api/presets'));
    req.flush(mockPagedList);
  });

  it('should toggle favorite', () => {
    flushInitialLoad();
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.onToggleFavorite(event, mockPresets[0]);
    expect(event.stopPropagation).toHaveBeenCalled();

    const req = httpTesting.expectOne(`${baseUrl}/api/presets/pr-1/favorite`);
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(component.presets()[0].isFavorited).toBe(true);
  });
});
