import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import {
  API_CONFIG,
  CommunityEventDto,
  EventCategory,
  EventRecurrence,
  EventStatus,
  PagedList,
} from 'api';
import { EventsCalendarPageComponent } from './events-calendar-page.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('EventsCalendarPageComponent', () => {
  let component: EventsCalendarPageComponent;
  let fixture: ComponentFixture<EventsCalendarPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockEvents: CommunityEventDto[] = [
    {
      id: 'e-1',
      name: 'Caribana Warmup',
      description: 'Pre-Caribana gathering',
      startDate: '2025-07-15',
      startTime: '18:00',
      endDate: '2025-07-15',
      endTime: '22:00',
      location: 'Nathan Phillips Square',
      neighborhood: 'Downtown Toronto',
      category: EventCategory.Festival,
      recurrence: EventRecurrence.Annual,
      status: EventStatus.Approved,
      organizerName: 'Community Org',
      organizerId: 'u-1',
      createdAt: '2025-06-01T00:00:00Z',
    },
  ];

  const mockPagedList: PagedList<CommunityEventDto> = {
    items: mockEvents,
    page: 1,
    pageSize: 50,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsCalendarPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventsCalendarPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/community-events'));
    req.flush(mockPagedList);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load events on init', () => {
    flushInitialLoad();
    expect(component.upcomingEvents()).toEqual(mockEvents);
  });

  it('should generate 42 calendar cells', () => {
    flushInitialLoad();
    expect(component.calendarCells().length).toBe(42);
  });

  it('should navigate to next month', () => {
    flushInitialLoad();
    const initialMonth = component.currentMonth();
    component.onNextMonth();

    const req = httpTesting.expectOne((r) => r.url.includes('/api/community-events'));
    req.flush(mockPagedList);

    if (initialMonth === 11) {
      expect(component.currentMonth()).toBe(0);
    } else {
      expect(component.currentMonth()).toBe(initialMonth + 1);
    }
  });

  it('should navigate to previous month', () => {
    flushInitialLoad();
    const initialMonth = component.currentMonth();
    component.onPrevMonth();

    const req = httpTesting.expectOne((r) => r.url.includes('/api/community-events'));
    req.flush(mockPagedList);

    if (initialMonth === 0) {
      expect(component.currentMonth()).toBe(11);
    } else {
      expect(component.currentMonth()).toBe(initialMonth - 1);
    }
  });

  it('should toggle view mode', () => {
    flushInitialLoad();
    component.viewMode.set('list');
    expect(component.viewMode()).toBe('list');
    component.viewMode.set('month');
    expect(component.viewMode()).toBe('month');
  });

  it('should format event date', () => {
    flushInitialLoad();
    const formatted = component.formatEventDate('2025-07-15');
    expect(formatted).toContain('Jul');
    expect(formatted).toContain('15');
  });

  it('should limit event dots to 3', () => {
    flushInitialLoad();
    expect(component.getDots(5).length).toBe(3);
    expect(component.getDots(2).length).toBe(2);
  });
});
