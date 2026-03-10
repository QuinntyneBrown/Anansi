import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { GalleryMediaService } from './gallery-media.service';
import {
  GalleryMediaDto,
  MoveMediaRequest,
  BulkStarRequest,
  TogglePrivateRequest,
} from '../models/gallery.models';
import { PagedList } from '../models/common';

describe('GalleryMediaService', () => {
  let service: GalleryMediaService;
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
    service = TestBed.inject(GalleryMediaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/collections/{collectionId}/media without params', () => {
      const expected = { items: [], totalCount: 0 } as unknown as PagedList<GalleryMediaDto>;

      service.list('c1').subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(expected);
    });

    it('should GET /api/collections/{collectionId}/media with all params', () => {
      service.list('c1', { setId: 's1', starredOnly: true, page: 2, pageSize: 50 }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections/c1/media`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('setId')).toBe('s1');
      expect(req.request.params.get('starredOnly')).toBe('true');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('50');
      req.flush({ items: [] });
    });

    it('should GET /api/collections/{collectionId}/media with partial params', () => {
      service.list('c1', { starredOnly: false }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections/c1/media`);
      expect(req.request.params.get('starredOnly')).toBe('false');
      expect(req.request.params.has('setId')).toBe(false);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush({ items: [] });
    });
  });

  describe('upload', () => {
    it('should POST multipart/form-data to /api/collections/{collectionId}/media', () => {
      const file = new File(['photo-content'], 'photo.jpg', { type: 'image/jpeg' });
      const expected = { id: 'm1', fileName: 'photo.jpg' } as GalleryMediaDto;

      service.upload('c1', file).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      expect((req.request.body as FormData).get('file')).toBeTruthy();
      req.flush(expected);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/collections/{collectionId}/media/{id}', () => {
      service.delete('c1', 'm1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media/m1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('move', () => {
    it('should POST to /api/collections/{collectionId}/media/{id}/move', () => {
      const request: MoveMediaRequest = { targetSetId: 's2' };

      service.move('c1', 'm1', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media/m1/move`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('toggleStar', () => {
    it('should POST to /api/collections/{collectionId}/media/{id}/star', () => {
      service.toggleStar('c1', 'm1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media/m1/star`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('bulkStar', () => {
    it('should POST to /api/collections/{collectionId}/media/bulk-star', () => {
      const request: BulkStarRequest = { mediaIds: ['m1', 'm2', 'm3'], star: true };

      service.bulkStar('c1', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media/bulk-star`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('togglePrivate', () => {
    it('should POST to /api/collections/{collectionId}/media/{id}/private', () => {
      const request: TogglePrivateRequest = { clientName: 'Jane', clientEmail: 'jane@example.com' };

      service.togglePrivate('c1', 'm1', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/media/m1/private`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });
});
