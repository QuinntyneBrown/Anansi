import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { WebsiteTypographyService } from './website-typography.service';
import {
  ColorPaletteDto,
  CreateCustomColorPaletteCommand,
  UploadCustomFontCommand,
  WebsiteFontDto,
} from '../models/website.models';

describe('WebsiteTypographyService', () => {
  let service: WebsiteTypographyService;
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
    service = TestBed.inject(WebsiteTypographyService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockFont: WebsiteFontDto = {
    id: 'font-1',
    fontFamily: 'Custom Display',
    fileUrl: 'https://example.com/fonts/custom-display.woff2',
    fileFormat: 'woff2',
    fontWeight: '400',
    fontStyle: 'normal',
  };

  const mockPalette: ColorPaletteDto = {
    id: 'pal-1',
    name: 'Warm Tones',
    colorsJson: '["#FF5733","#FFC300","#DAF7A6"]',
    isSystem: false,
    sortOrder: 0,
  };

  describe('listFonts', () => {
    it('should GET /api/website-typography/fonts and return WebsiteFontDto[]', () => {
      service.listFonts().subscribe((result) => {
        expect(result).toEqual([mockFont]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/website-typography/fonts`);
      expect(req.request.method).toBe('GET');
      req.flush([mockFont]);
    });
  });

  describe('uploadFont', () => {
    it('should POST to /api/website-typography/fonts and return WebsiteFontDto', () => {
      const command: UploadCustomFontCommand = {
        fontFamily: 'Custom Display',
        fileUrl: 'https://example.com/fonts/custom-display.woff2',
        fileFormat: 'woff2',
        fontWeight: '400',
        fontStyle: 'normal',
      };

      service.uploadFont(command).subscribe((result) => {
        expect(result).toEqual(mockFont);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/website-typography/fonts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockFont);
    });
  });

  describe('deleteFont', () => {
    it('should DELETE /api/website-typography/fonts/{fontId}', () => {
      service.deleteFont('font-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/website-typography/fonts/font-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('listColorPalettes', () => {
    it('should GET /api/website-typography/color-palettes and return ColorPaletteDto[]', () => {
      service.listColorPalettes().subscribe((result) => {
        expect(result).toEqual([mockPalette]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/website-typography/color-palettes`);
      expect(req.request.method).toBe('GET');
      req.flush([mockPalette]);
    });
  });

  describe('createColorPalette', () => {
    it('should POST to /api/website-typography/color-palettes and return ColorPaletteDto', () => {
      const command: CreateCustomColorPaletteCommand = {
        name: 'Cool Blues',
        colorsJson: '["#0000FF","#4169E1","#87CEEB"]',
      };

      service.createColorPalette(command).subscribe((result) => {
        expect(result).toEqual(mockPalette);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/website-typography/color-palettes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockPalette);
    });
  });
});
