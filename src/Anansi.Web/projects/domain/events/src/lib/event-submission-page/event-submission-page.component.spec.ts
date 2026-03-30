import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import {
  API_CONFIG,
  EventCategory,
  EventRecurrence,
  EventStatus,
  CommunityEventDto,
} from 'api';
import { EventSubmissionPageComponent } from './event-submission-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('EventSubmissionPageComponent', () => {
  let component: EventSubmissionPageComponent;
  let fixture: ComponentFixture<EventSubmissionPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSubmissionPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventSubmissionPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form values', () => {
    expect(component.form.category).toBe(EventCategory.Community);
    expect(component.form.recurrence).toBe(EventRecurrence.OneTime);
    expect(component.form.name).toBe('');
  });

  it('should have correct categories', () => {
    expect(component.categories.length).toBe(5);
    expect(component.categories.map((c) => c.value)).toEqual([
      EventCategory.Festival,
      EventCategory.Cultural,
      EventCategory.Community,
      EventCategory.Religious,
      EventCategory.Market,
    ]);
  });

  it('should have correct recurrence options', () => {
    expect(component.recurrences.length).toBe(4);
  });

  it('should submit event', () => {
    component.form.name = 'Test Event';
    component.form.startDate = '2025-08-01';
    component.form.startTime = '10:00';
    component.form.endDate = '2025-08-01';
    component.form.endTime = '14:00';
    component.form.location = 'Test Venue';
    component.form.neighborhood = 'Scarborough';

    component.onSubmit();
    expect(component.saving()).toBe(true);

    const req = httpTesting.expectOne(`${baseUrl}/api/community-events`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Test Event');

    const response: CommunityEventDto = {
      id: 'e-new',
      name: 'Test Event',
      startDate: '2025-08-01',
      startTime: '10:00',
      endDate: '2025-08-01',
      endTime: '14:00',
      location: 'Test Venue',
      neighborhood: 'Scarborough',
      category: EventCategory.Community,
      recurrence: EventRecurrence.OneTime,
      status: EventStatus.Pending,
      organizerName: 'Test',
      organizerId: 'u-1',
      createdAt: '2025-08-01T00:00:00Z',
    };
    req.flush(response);

    expect(component.saving()).toBe(false);
  });

  it('should set saving to false on error', () => {
    component.form.name = 'Fail Event';
    component.form.startDate = '2025-08-01';
    component.form.startTime = '10:00';
    component.form.endDate = '2025-08-01';
    component.form.endTime = '14:00';
    component.form.location = 'Venue';
    component.form.neighborhood = 'North York';

    component.onSubmit();
    expect(component.saving()).toBe(true);

    const req = httpTesting.expectOne(`${baseUrl}/api/community-events`);
    req.error(new ProgressEvent('Network error'));

    expect(component.saving()).toBe(false);
  });
});
