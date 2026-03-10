import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { WebsitePagesService } from './website-pages.service';
import {
  CreatePageCommand,
  UpdatePageCommand,
  WebsitePageDto,
} from '../models/website.models';
import { WebsitePageType } from '../models/enums';

describe('WebsitePagesService', () => {
  let service: WebsitePagesService;
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
    service = TestBed.inject(WebsitePagesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockPage: WebsitePageDto = {
    id: 'page-1',
    websiteId: 'ws-1',
    title: 'Home',
    slug: 'home',
    pageType: WebsitePageType.Homepage,
    sortOrder: 0,
    isVisible: true,
    showInNavigation: true,
    hasPassword: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/websites/{websiteId}/pages and return WebsitePageDto[]', () => {
      service.list('ws-1').subscribe((result) => {
        expect(result).toEqual([mockPage]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/pages`);
      expect(req.request.method).toBe('GET');
      req.flush([mockPage]);
    });
  });

  describe('create', () => {
    it('should POST to /api/websites/{websiteId}/pages and return WebsitePageDto', () => {
      const command: CreatePageCommand = {
        websiteId: 'ws-1',
        title: 'About',
        slug: 'about',
        pageType: WebsitePageType.About,
        showInNavigation: true,
        metaTitle: 'About Us',
      };

      service.create('ws-1', command).subscribe((result) => {
        expect(result).toEqual(mockPage);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/pages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockPage);
    });
  });

  describe('update', () => {
    it('should PUT to /api/websites/{websiteId}/pages/{pageId} and return WebsitePageDto', () => {
      const command: UpdatePageCommand = {
        pageId: 'page-1',
        title: 'Updated Home',
        slug: 'home',
        sortOrder: 0,
        isVisible: true,
        showInNavigation: true,
        metaTitle: 'Welcome',
      };

      service.update('ws-1', 'page-1', command).subscribe((result) => {
        expect(result).toEqual(mockPage);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/pages/page-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockPage);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/websites/{websiteId}/pages/{pageId}', () => {
      service.delete('ws-1', 'page-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/pages/page-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
