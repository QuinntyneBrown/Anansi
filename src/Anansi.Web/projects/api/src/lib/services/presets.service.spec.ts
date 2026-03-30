import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from '../api.config';
import { PresetsService } from './presets.service';
import { SkinToneRange, PresetContext, PresetVisibility } from '../models/enums';

describe('PresetsService', () => {
  let service: PresetsService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(PresetsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should list presets', () => {
    service.list({ page: 1, pageSize: 12 }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/presets'));
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false });
  });

  it('should filter by skin tone', () => {
    service.list({ skinTone: SkinToneRange.Deep }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/presets'));
    expect(req.request.params.get('skinTone')).toBe('Deep');
    req.flush({ items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false });
  });

  it('should get preset by id', () => {
    service.get('pr-1').subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/presets/pr-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should create preset', () => {
    service.create({
      name: 'Test',
      skinTone: SkinToneRange.Medium,
      context: PresetContext.Studio,
      visibility: PresetVisibility.Public,
      adjustments: {
        hue: 0, saturation: 0, luminance: 0, highlights: 0,
        shadows: 0, contrast: 0, temperature: 0, tint: 0,
        vibrance: 0, clarity: 0,
      },
    }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/presets`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should toggle favorite', () => {
    service.toggleFavorite('pr-1').subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/presets/pr-1/favorite`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});
