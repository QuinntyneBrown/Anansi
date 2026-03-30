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
} from 'api';
import { PresetDetailPageComponent } from './preset-detail-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('PresetDetailPageComponent', () => {
  let component: PresetDetailPageComponent;
  let fixture: ComponentFixture<PresetDetailPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockPreset: PresetDto = {
    id: 'pr-1',
    name: 'Warm Portrait',
    authorName: 'John',
    authorId: 'u-1',
    skinTone: SkinToneRange.Medium,
    context: PresetContext.Studio,
    visibility: PresetVisibility.Public,
    isFavorited: false,
    favoriteCount: 3,
    downloadCount: 10,
    adjustments: {
      hue: 5, saturation: 10, luminance: 0, highlights: -5,
      shadows: 15, contrast: 8, temperature: 12, tint: 2,
      vibrance: 7, clarity: 5,
    },
    createdAt: '2025-06-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PresetDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have no selected preset initially', () => {
    expect(component.selectedPreset()).toBeNull();
  });

  it('should extract adjustment entries', () => {
    const entries = component.getAdjustmentEntries(mockPreset.adjustments);
    expect(entries.length).toBe(10);
    expect(entries[0]).toEqual({ key: 'Hue', value: 5 });
  });

  it('should save a new preset', () => {
    component.newPreset.name = 'Test Preset';
    component.newPreset.description = 'A test';
    component.onSavePreset();

    const req = httpTesting.expectOne(`${baseUrl}/api/presets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Test Preset');
    req.flush(mockPreset);

    expect(component.selectedPreset()).toEqual(mockPreset);
    expect(component.newPreset.name).toBe('');
  });

  it('should toggle favorite on selected preset', () => {
    component.selectedPreset.set(mockPreset);
    component.onToggleFavorite(mockPreset);

    const req = httpTesting.expectOne(`${baseUrl}/api/presets/pr-1/favorite`);
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(component.selectedPreset()!.isFavorited).toBe(true);
  });
});
