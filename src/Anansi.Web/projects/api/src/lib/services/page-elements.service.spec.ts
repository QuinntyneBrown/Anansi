import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { PageElementsService } from './page-elements.service';
import {
  CreateElementCommand,
  PageElementDto,
  UpdateElementCommand,
} from '../models/website.models';
import { ElementType } from '../models/enums';

describe('PageElementsService', () => {
  let service: PageElementsService;
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
    service = TestBed.inject(PageElementsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockElement: PageElementDto = {
    id: 'elem-1',
    pageId: 'page-1',
    elementType: ElementType.Text,
    contentJson: '{"text":"Hello World"}',
    positionX: 100,
    positionY: 200,
    width: 300,
    height: 50,
    zIndex: 1,
    sortOrder: 0,
    breakpointOverrides: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/pages/{pageId}/elements and return PageElementDto[]', () => {
      service.list('page-1').subscribe((result) => {
        expect(result).toEqual([mockElement]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/pages/page-1/elements`);
      expect(req.request.method).toBe('GET');
      req.flush([mockElement]);
    });
  });

  describe('create', () => {
    it('should POST to /api/pages/{pageId}/elements and return PageElementDto', () => {
      const command: CreateElementCommand = {
        pageId: 'page-1',
        elementType: ElementType.Image,
        contentJson: '{"src":"photo.jpg"}',
        positionX: 0,
        positionY: 0,
        width: 800,
        height: 600,
        zIndex: 2,
        sortOrder: 1,
      };

      service.create('page-1', command).subscribe((result) => {
        expect(result).toEqual(mockElement);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/pages/page-1/elements`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockElement);
    });
  });

  describe('update', () => {
    it('should PUT to /api/pages/{pageId}/elements/{elementId} and return PageElementDto', () => {
      const command: UpdateElementCommand = {
        elementId: 'elem-1',
        contentJson: '{"text":"Updated"}',
        positionX: 150,
        positionY: 250,
        width: 400,
        height: 60,
        zIndex: 3,
        sortOrder: 0,
      };

      service.update('page-1', 'elem-1', command).subscribe((result) => {
        expect(result).toEqual(mockElement);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/pages/page-1/elements/elem-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockElement);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/pages/{pageId}/elements/{elementId}', () => {
      service.delete('page-1', 'elem-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/pages/page-1/elements/elem-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
