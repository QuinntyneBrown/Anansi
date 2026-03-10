import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, SessionTypeDto, SessionVisibility } from 'api';
import { SessionTypeSelectionComponent } from './session-type-selection.component';

describe('SessionTypeSelectionComponent', () => {
  let component: SessionTypeSelectionComponent;
  let fixture: ComponentFixture<SessionTypeSelectionComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockSessions: SessionTypeDto[] = [
    {
      id: '1',
      name: 'Portrait Session',
      description: 'A beautiful portrait session',
      durationMinutes: 90,
      priceCents: 25000,
      location: 'Studio A',
      visibility: SessionVisibility.Public,
      sortOrder: 1,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      requireManualConfirmation: false,
      isMiniSession: false,
      miniSessionGapMinutes: 0,
      miniSessionSpotsPerSlot: 1,
      requirePayment: true,
      depositAmountCents: 5000,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Mini Session',
      durationMinutes: 30,
      priceCents: 10000,
      visibility: SessionVisibility.Public,
      sortOrder: 2,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 5,
      requireManualConfirmation: true,
      isMiniSession: true,
      miniSessionGapMinutes: 10,
      miniSessionSpotsPerSlot: 3,
      requirePayment: false,
      createdAt: '2025-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'Hidden Session',
      durationMinutes: 60,
      priceCents: 15000,
      visibility: SessionVisibility.Hidden,
      sortOrder: 3,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      requireManualConfirmation: false,
      isMiniSession: false,
      miniSessionGapMinutes: 0,
      miniSessionSpotsPerSlot: 1,
      requirePayment: false,
      createdAt: '2025-01-03T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionTypeSelectionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SessionTypeSelectionComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: SessionTypeDto[] = mockSessions): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings/session-types`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load session types on init', () => {
    flushInitialLoad();
    expect(component.allSessions()).toEqual(mockSessions);
    expect(component.loading()).toBe(false);
  });

  it('should filter to only public sessions', () => {
    flushInitialLoad();
    const publicSessions = component.publicSessions();
    expect(publicSessions.length).toBe(2);
    expect(publicSessions.every((s) => s.visibility === SessionVisibility.Public)).toBe(true);
    expect(publicSessions.find((s) => s.id === '3')).toBeUndefined();
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings/session-types`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should emit sessionTypeSelected when Book is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.sessionTypeSelected.subscribe(spy);

    component.onBook(mockSessions[0]);
    expect(spy).toHaveBeenCalledWith(mockSessions[0]);
  });

  it('should format duration with hours and minutes', () => {
    flushInitialLoad();
    expect(component.formatDuration(90)).toBe('1 hr 30 min');
  });

  it('should format duration with only hours', () => {
    flushInitialLoad();
    expect(component.formatDuration(120)).toBe('2 hr');
  });

  it('should format duration with only minutes', () => {
    flushInitialLoad();
    expect(component.formatDuration(45)).toBe('45 min');
  });

  it('should format price correctly', () => {
    flushInitialLoad();
    expect(component.formatPrice(25000)).toBe('$250.00');
    expect(component.formatPrice(10050)).toBe('$100.50');
    expect(component.formatPrice(0)).toBe('$0.00');
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings/session-types`);
    req.flush(mockSessions);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should show empty state when no public sessions', () => {
    flushInitialLoad([mockSessions[2]]);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should render session cards for public sessions', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    expect(cards.length).toBe(2);
  });

  it('should display session name', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector('.session-name');
    expect(name.textContent).toContain('Portrait Session');
  });

  it('should display session description when provided', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const descriptions = fixture.nativeElement.querySelectorAll('.session-description');
    expect(descriptions.length).toBe(1);
    expect(descriptions[0].textContent).toContain('A beautiful portrait session');
  });

  it('should display location when provided', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const detailLabels = fixture.nativeElement.querySelectorAll('.detail-label');
    const locationLabels = Array.from(detailLabels).filter(
      (el: any) => el.textContent.trim() === 'Location',
    );
    expect(locationLabels.length).toBe(1);
  });

  it('should display formatted duration', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const detailValues = fixture.nativeElement.querySelectorAll('.detail-value');
    const durationValues = Array.from(detailValues).map((el: any) => el.textContent.trim());
    expect(durationValues).toContain('1 hr 30 min');
  });

  it('should display formatted price', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const priceEl = fixture.nativeElement.querySelector('.detail-value.price');
    expect(priceEl.textContent.trim()).toBe('$250.00');
  });

  it('should emit sessionTypeSelected when Book button is clicked in DOM', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.sessionTypeSelected.subscribe(spy);
    fixture.detectChanges();

    const bookBtn = fixture.nativeElement.querySelector('lib-button[variant="primary"] button');
    bookBtn.click();

    expect(spy).toHaveBeenCalledWith(mockSessions[0]);
  });

  it('should show empty state when response is empty array', () => {
    flushInitialLoad([]);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });
});
