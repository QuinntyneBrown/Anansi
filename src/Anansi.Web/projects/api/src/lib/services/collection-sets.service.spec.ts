import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { CollectionSetsService } from './collection-sets.service';
import {
  CollectionSetDto,
  CreateSetRequest,
  UpdateSetRequest,
  ReorderSetsRequest,
} from '../models/gallery.models';

describe('CollectionSetsService', () => {
  let service: CollectionSetsService;
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
    service = TestBed.inject(CollectionSetsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/collections/{collectionId}/sets', () => {
      const expected: CollectionSetDto[] = [
        { id: 's1', collectionId: 'c1', title: 'Ceremony', sortOrder: 0, isClientExclusive: false, createdAt: '2026-01-01', mediaCount: 10 },
        { id: 's2', collectionId: 'c1', title: 'Reception', sortOrder: 1, isClientExclusive: false, createdAt: '2026-01-01', mediaCount: 20 },
      ];

      service.list('c1').subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/sets`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('create', () => {
    it('should POST to /api/collections/{collectionId}/sets', () => {
      const request: CreateSetRequest = {
        title: 'Ceremony',
        sortOrder: 0,
        isClientExclusive: false,
      };
      const expected = { id: 's1', title: 'Ceremony' } as CollectionSetDto;

      service.create('c1', request).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/sets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(expected);
    });
  });

  describe('update', () => {
    it('should PUT to /api/collections/{collectionId}/sets/{id}', () => {
      const request: UpdateSetRequest = {
        title: 'Updated Ceremony',
        sortOrder: 0,
        isClientExclusive: true,
      };
      const expected = { id: 's1', title: 'Updated Ceremony' } as CollectionSetDto;

      service.update('c1', 's1', request).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/sets/s1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(expected);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/collections/{collectionId}/sets/{id}', () => {
      service.delete('c1', 's1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/sets/s1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('reorder', () => {
    it('should PUT to /api/collections/{collectionId}/sets/reorder', () => {
      const request: ReorderSetsRequest = { setIdsInOrder: ['s2', 's1', 's3'] };

      service.reorder('c1', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/c1/sets/reorder`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });
});
