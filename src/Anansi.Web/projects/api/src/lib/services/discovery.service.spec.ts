import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from '../api.config';
import { DiscoveryService } from './discovery.service';

describe('DiscoveryService', () => {
  let service: DiscoveryService;
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
    service = TestBed.inject(DiscoveryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should list cultural tags', () => {
    service.listCulturalTags().subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/discovery/cultural-tags`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get profile', () => {
    service.getProfile().subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/discovery/profile`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should update profile', () => {
    service.updateProfile({
      culturalTagIds: ['tag-1'],
      customTags: [],
      neighborhood: 'Scarborough',
      serviceRadiusKm: 25,
    }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/discovery/profile`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should search directory with params', () => {
    service.searchDirectory({ search: 'wedding', page: 1, pageSize: 12 }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/discovery/directory'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('wedding');
    req.flush({ items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false });
  });
});
