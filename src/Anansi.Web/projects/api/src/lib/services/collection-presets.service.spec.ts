import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { CollectionPresetsService } from './collection-presets.service';
import {
  CollectionPresetDto,
  CreatePresetCommand,
  UpdatePresetCommand,
} from '../models/gallery.models';
import {
  CoverStyle,
  ThemeMode,
  GridLayout,
  GalleryLanguage,
} from '../models/enums';

describe('CollectionPresetsService', () => {
  let service: CollectionPresetsService;
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
    service = TestBed.inject(CollectionPresetsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/collection-presets', () => {
      const expected: CollectionPresetDto[] = [
        {
          id: 'p1',
          name: 'Default',
          coverStyle: CoverStyle.Reef,
          theme: ThemeMode.Light,
          fontFamily: 'Serif',
          colorPalette: 'default',
          layout: GridLayout.Vertical,
          downloadsEnabled: true,
          downloadPinEnabled: false,
          allowedResolutions: 'Original',
          requireEmailRegistration: false,
          language: GalleryLanguage.English,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ];

      service.list().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collection-presets`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('create', () => {
    it('should POST to /api/collection-presets', () => {
      const command: CreatePresetCommand = {
        name: 'Wedding Default',
        coverStyle: CoverStyle.West,
        theme: ThemeMode.Dark,
        fontFamily: 'Sans',
        colorPalette: 'warm',
        layout: GridLayout.Horizontal,
        downloadsEnabled: true,
        downloadPinEnabled: true,
        allowedResolutions: 'Web2048,Original',
        requireEmailRegistration: true,
        language: GalleryLanguage.English,
      };
      const expected = { id: 'p2', name: 'Wedding Default' } as CollectionPresetDto;

      service.create(command).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collection-presets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(expected);
    });
  });

  describe('update', () => {
    it('should PUT to /api/collection-presets/{id}', () => {
      const command: UpdatePresetCommand = {
        id: 'p1',
        name: 'Updated Preset',
        coverStyle: CoverStyle.Reef,
        theme: ThemeMode.Light,
        fontFamily: 'Serif',
        colorPalette: 'default',
        layout: GridLayout.Vertical,
        downloadsEnabled: false,
        downloadPinEnabled: false,
        allowedResolutions: 'Original',
        requireEmailRegistration: false,
        language: GalleryLanguage.French,
      };
      const expected = { id: 'p1', name: 'Updated Preset' } as CollectionPresetDto;

      service.update('p1', command).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collection-presets/p1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(expected);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/collection-presets/{id}', () => {
      service.delete('p1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collection-presets/p1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
