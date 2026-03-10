import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { WebsiteTemplatesService } from './website-templates.service';
import {
  LandingPageTemplateDto,
  WebsiteTemplateDto,
} from '../models/website.models';
import { TemplateCategory } from '../models/enums';

describe('WebsiteTemplatesService', () => {
  let service: WebsiteTemplatesService;
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
    service = TestBed.inject(WebsiteTemplatesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockTemplate: WebsiteTemplateDto = {
    id: 'tpl-1',
    name: 'Modern Portfolio',
    description: 'A clean modern portfolio template',
    category: TemplateCategory.Portfolio,
    previewImageUrl: 'https://example.com/preview.jpg',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    isActive: true,
    sortOrder: 0,
  };

  const mockLandingPage: LandingPageTemplateDto = {
    id: 'lp-1',
    name: 'Wedding Promo',
    description: 'A wedding promotion landing page',
    useCase: 'Mini Sessions',
    previewImageUrl: 'https://example.com/lp-preview.jpg',
    isActive: true,
    sortOrder: 0,
  };

  describe('list', () => {
    it('should GET /api/websitetemplates without category param', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([mockTemplate]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websitetemplates`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([mockTemplate]);
    });

    it('should GET /api/websitetemplates with category param', () => {
      service.list(TemplateCategory.Portfolio).subscribe((result) => {
        expect(result).toEqual([mockTemplate]);
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/websitetemplates` &&
          r.params.get('category') === '1',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('category')).toBe('1');
      req.flush([mockTemplate]);
    });

    it('should GET /api/websitetemplates with category 0 (Business)', () => {
      service.list(TemplateCategory.Business).subscribe((result) => {
        expect(result).toEqual([mockTemplate]);
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/websitetemplates` &&
          r.params.get('category') === '0',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('category')).toBe('0');
      req.flush([mockTemplate]);
    });
  });

  describe('getPreview', () => {
    it('should GET /api/websitetemplates/{id}/preview and return WebsiteTemplateDto', () => {
      service.getPreview('tpl-1').subscribe((result) => {
        expect(result).toEqual(mockTemplate);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websitetemplates/tpl-1/preview`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('listLandingPages', () => {
    it('should GET /api/websitetemplates/landing-pages and return LandingPageTemplateDto[]', () => {
      service.listLandingPages().subscribe((result) => {
        expect(result).toEqual([mockLandingPage]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websitetemplates/landing-pages`);
      expect(req.request.method).toBe('GET');
      req.flush([mockLandingPage]);
    });
  });
});
