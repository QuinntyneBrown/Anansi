import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { FavoritesService } from './favorites.service';
import {
  FavoriteListDto,
  CreateFavoriteListCommand,
  FavoriteItemDto,
  AddFavoriteItemRequest,
  UpdateCommentRequest,
} from '../models/gallery.models';
import { PagedList } from '../models/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
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
    service = TestBed.inject(FavoritesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/favorites without params', () => {
      const expected = { items: [], totalCount: 0 } as unknown as PagedList<FavoriteListDto>;

      service.list().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(expected);
    });

    it('should GET /api/favorites with all params', () => {
      service.list({ collectionId: 'c1', page: 1, pageSize: 20 }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/favorites`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('collectionId')).toBe('c1');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush({ items: [] });
    });

    it('should GET /api/favorites with partial params', () => {
      service.list({ collectionId: 'c1' }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/favorites`);
      expect(req.request.params.get('collectionId')).toBe('c1');
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush({ items: [] });
    });
  });

  describe('create', () => {
    it('should POST to /api/favorites', () => {
      const command: CreateFavoriteListCommand = {
        collectionId: 'c1',
        name: 'My Favorites',
        isPreset: false,
      };
      const expected = { id: 'f1', name: 'My Favorites' } as FavoriteListDto;

      service.create(command).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(expected);
    });
  });

  describe('getItems', () => {
    it('should GET /api/favorites/{id}/items', () => {
      const expected: FavoriteItemDto[] = [
        { id: 'fi1', favoriteListId: 'f1', mediaId: 'm1', createdAt: '2026-01-01' },
        { id: 'fi2', favoriteListId: 'f1', mediaId: 'm2', comment: 'Love this one', createdAt: '2026-01-01' },
      ];

      service.getItems('f1').subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites/f1/items`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('addItem', () => {
    it('should POST to /api/favorites/{id}/items', () => {
      const request: AddFavoriteItemRequest = { mediaId: 'm1', comment: 'Beautiful shot' };
      const expected = { id: 'fi1', favoriteListId: 'f1', mediaId: 'm1', comment: 'Beautiful shot' } as FavoriteItemDto;

      service.addItem('f1', request).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites/f1/items`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(expected);
    });
  });

  describe('removeItem', () => {
    it('should DELETE /api/favorites/items/{itemId}', () => {
      service.removeItem('fi1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites/items/fi1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateComment', () => {
    it('should PUT to /api/favorites/items/{itemId}/comment', () => {
      const request: UpdateCommentRequest = { comment: 'Updated comment' };

      service.updateComment('fi1', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites/items/fi1/comment`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('markComplete', () => {
    it('should POST to /api/favorites/{id}/complete', () => {
      service.markComplete('f1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/favorites/f1/complete`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });
});
