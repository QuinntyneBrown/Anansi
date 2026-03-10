import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { WebsiteSeoService } from './website-seo.service';
import {
  CreateUrlRedirectCommand,
  GenerateAiAltTextCommand,
  SeoAuditResultDto,
  UpdateUrlRedirectCommand,
  UrlRedirectDto,
} from '../models/website.models';
import { RedirectType } from '../models/enums';

describe('WebsiteSeoService', () => {
  let service: WebsiteSeoService;
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
    service = TestBed.inject(WebsiteSeoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockAudit: SeoAuditResultDto = {
    websiteId: 'ws-1',
    issues: [
      {
        pageTitle: 'Home',
        slug: 'home',
        pageId: 'page-1',
        issueType: 'MissingMetaDescription',
        description: 'Page is missing a meta description',
      },
    ],
  };

  const mockRedirect: UrlRedirectDto = {
    id: 'redir-1',
    websiteId: 'ws-1',
    sourcePath: '/old-page',
    destinationUrl: '/new-page',
    redirectType: RedirectType.Permanent301,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('runAudit', () => {
    it('should GET /api/websites/{websiteId}/seo/audit and return SeoAuditResultDto', () => {
      service.runAudit('ws-1').subscribe((result) => {
        expect(result).toEqual(mockAudit);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/audit`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAudit);
    });
  });

  describe('generateAltText', () => {
    it('should POST to /api/websites/{websiteId}/seo/ai-alt-text', () => {
      const command: GenerateAiAltTextCommand = {
        websiteId: 'ws-1',
        imageUrl: 'https://example.com/photo.jpg',
      };

      service.generateAltText('ws-1', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/ai-alt-text`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('generateDescription', () => {
    it('should POST to /api/websites/{websiteId}/seo/ai-description/{pageId} and return description', () => {
      const mockResponse = { description: 'A beautifully crafted portfolio page.' };

      service.generateDescription('ws-1', 'page-1').subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/ai-description/page-1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('listRedirects', () => {
    it('should GET /api/websites/{websiteId}/seo/redirects and return UrlRedirectDto[]', () => {
      service.listRedirects('ws-1').subscribe((result) => {
        expect(result).toEqual([mockRedirect]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/redirects`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRedirect]);
    });
  });

  describe('createRedirect', () => {
    it('should POST to /api/websites/{websiteId}/seo/redirects and return UrlRedirectDto', () => {
      const command: CreateUrlRedirectCommand = {
        websiteId: 'ws-1',
        sourcePath: '/old-page',
        destinationUrl: '/new-page',
        redirectType: RedirectType.Permanent301,
      };

      service.createRedirect('ws-1', command).subscribe((result) => {
        expect(result).toEqual(mockRedirect);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/redirects`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockRedirect);
    });
  });

  describe('updateRedirect', () => {
    it('should PUT to /api/websites/{websiteId}/seo/redirects/{redirectId} and return UrlRedirectDto', () => {
      const command: UpdateUrlRedirectCommand = {
        redirectId: 'redir-1',
        sourcePath: '/updated-old',
        destinationUrl: '/updated-new',
        redirectType: RedirectType.Temporary302,
        isActive: false,
      };

      service.updateRedirect('ws-1', 'redir-1', command).subscribe((result) => {
        expect(result).toEqual(mockRedirect);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/redirects/redir-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockRedirect);
    });
  });

  describe('deleteRedirect', () => {
    it('should DELETE /api/websites/{websiteId}/seo/redirects/{redirectId}', () => {
      service.deleteRedirect('ws-1', 'redir-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/seo/redirects/redir-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
