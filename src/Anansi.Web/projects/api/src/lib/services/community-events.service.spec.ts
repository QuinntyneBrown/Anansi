import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from '../api.config';
import { CommunityEventsService } from './community-events.service';
import { EventCategory, EventRecurrence } from '../models/enums';

describe('CommunityEventsService', () => {
  let service: CommunityEventsService;
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
    service = TestBed.inject(CommunityEventsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should list events', () => {
    service.list({ month: 7, year: 2025 }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/community-events'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('month')).toBe('7');
    expect(req.request.params.get('year')).toBe('2025');
    req.flush({ items: [], page: 1, pageSize: 50, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false });
  });

  it('should get event by id', () => {
    service.get('e-1').subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/community-events/e-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should create event', () => {
    service.create({
      name: 'Test Event',
      startDate: '2025-08-01',
      startTime: '10:00',
      endDate: '2025-08-01',
      endTime: '14:00',
      location: 'Venue',
      neighborhood: 'Scarborough',
      category: EventCategory.Community,
      recurrence: EventRecurrence.OneTime,
    }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/community-events`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update event', () => {
    service.update('e-1', {
      name: 'Updated Event',
      startDate: '2025-08-01',
      startTime: '10:00',
      endDate: '2025-08-01',
      endTime: '14:00',
      location: 'Venue',
      neighborhood: 'Scarborough',
      category: EventCategory.Festival,
      recurrence: EventRecurrence.Annual,
    }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/api/community-events/e-1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });
});
