import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { WebsitesService } from './websites.service';
import {
  ConfigureWebsiteCustomDomainCommand,
  CreateWebsiteCommand,
  UpdateWebsiteCommand,
  WebsiteAnalyticsDto,
  WebsiteDto,
} from '../models/website.models';
import {
  AnimationType,
  BlogLayoutType,
  WebsiteStatus,
} from '../models/enums';

describe('WebsitesService', () => {
  let service: WebsitesService;
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
    service = TestBed.inject(WebsitesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockWebsite: WebsiteDto = {
    id: 'ws-1',
    photographerId: 'photo-1',
    name: 'My Portfolio',
    description: 'A photography portfolio',
    status: WebsiteStatus.Draft,
    templateId: 'tpl-1',
    primaryFontFamily: 'Inter',
    secondaryFontFamily: 'Playfair Display',
    animationType: AnimationType.FadeIn,
    animationsEnabled: true,
    subdomain: 'my-portfolio',
    sslEnabled: true,
    customDomainVerified: false,
    rightClickProtectionEnabled: false,
    builtInAnalyticsEnabled: true,
    blogLayout: BlogLayoutType.Grid,
    blogPostsPerPage: 10,
    blogLoadMoreEnabled: true,
    hasSitePassword: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/websites without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual([mockWebsite]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([mockWebsite]);
    });

    it('should GET /api/websites with status param', () => {
      service.list({ status: WebsiteStatus.Published }).subscribe((result) => {
        expect(result).toEqual([mockWebsite]);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/websites` && r.params.get('status') === '1',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('1');
      req.flush([mockWebsite]);
    });

    it('should GET /api/websites without status param when params object has no status', () => {
      service.list({}).subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('status')).toBe(false);
      req.flush([]);
    });
  });

  describe('get', () => {
    it('should GET /api/websites/{id} and return WebsiteDto', () => {
      service.get('ws-1').subscribe((result) => {
        expect(result).toEqual(mockWebsite);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWebsite);
    });
  });

  describe('create', () => {
    it('should POST to /api/websites and return WebsiteDto', () => {
      const command: CreateWebsiteCommand = {
        name: 'My Portfolio',
        subdomain: 'my-portfolio',
        templateId: 'tpl-1',
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockWebsite);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockWebsite);
    });
  });

  describe('update', () => {
    it('should PUT to /api/websites/{id} and return WebsiteDto', () => {
      const command: UpdateWebsiteCommand = {
        id: 'ws-1',
        name: 'Updated Portfolio',
        animationType: AnimationType.ScaleUp,
        animationsEnabled: true,
        rightClickProtectionEnabled: true,
        builtInAnalyticsEnabled: true,
        blogLayout: BlogLayoutType.Stacked,
        blogPostsPerPage: 12,
        blogLoadMoreEnabled: false,
      };

      service.update('ws-1', command).subscribe((result) => {
        expect(result).toEqual(mockWebsite);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockWebsite);
    });
  });

  describe('publish', () => {
    it('should POST to /api/websites/{id}/publish and return WebsiteDto', () => {
      const publishedWebsite = { ...mockWebsite, status: WebsiteStatus.Published };

      service.publish('ws-1').subscribe((result) => {
        expect(result).toEqual(publishedWebsite);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/publish`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(publishedWebsite);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/websites/{id}', () => {
      service.delete('ws-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('configureCustomDomain', () => {
    it('should PUT to /api/websites/{id}/custom-domain and return WebsiteDto', () => {
      const command: ConfigureWebsiteCustomDomainCommand = {
        websiteId: 'ws-1',
        customDomain: 'www.example.com',
      };
      const updatedWebsite = { ...mockWebsite, customDomain: 'www.example.com' };

      service.configureCustomDomain('ws-1', command).subscribe((result) => {
        expect(result).toEqual(updatedWebsite);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/custom-domain`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(updatedWebsite);
    });
  });

  describe('getAnalytics', () => {
    const mockAnalytics: WebsiteAnalyticsDto = {
      websiteId: 'ws-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      totalVisitors: 500,
      uniqueVisitors: 350,
      pageViews: 1200,
      averageSessionDurationSeconds: 120,
      dailySnapshots: [],
    };

    it('should GET /api/websites/{id}/analytics without params', () => {
      service.getAnalytics('ws-1').subscribe((result) => {
        expect(result).toEqual(mockAnalytics);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/analytics`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockAnalytics);
    });

    it('should GET /api/websites/{id}/analytics with date params', () => {
      service.getAnalytics('ws-1', { startDate: '2026-01-01', endDate: '2026-01-31' }).subscribe((result) => {
        expect(result).toEqual(mockAnalytics);
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/websites/ws-1/analytics` &&
          r.params.get('startDate') === '2026-01-01' &&
          r.params.get('endDate') === '2026-01-31',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('startDate')).toBe('2026-01-01');
      expect(req.request.params.get('endDate')).toBe('2026-01-31');
      req.flush(mockAnalytics);
    });

    it('should GET /api/websites/{id}/analytics with only startDate', () => {
      service.getAnalytics('ws-1', { startDate: '2026-01-01' }).subscribe((result) => {
        expect(result).toEqual(mockAnalytics);
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/websites/ws-1/analytics` &&
          r.params.get('startDate') === '2026-01-01',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('startDate')).toBe('2026-01-01');
      expect(req.request.params.has('endDate')).toBe(false);
      req.flush(mockAnalytics);
    });
  });
});
