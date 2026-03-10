import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  API_CONFIG,
  SessionTypeDto,
  SessionVisibility,
  BookingRecordDto,
  BookingStatus,
} from 'api';
import { BookingFormComponent } from './booking-form.component';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockSessionType: SessionTypeDto = {
    id: 'st-1',
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
  };

  const mockBookingRecord: BookingRecordDto = {
    id: 'b-1',
    sessionTypeId: 'st-1',
    sessionTypeName: 'Portrait Session',
    clientFirstName: 'Jane',
    clientLastName: 'Doe',
    clientEmail: 'jane@example.com',
    startTime: '2025-06-15T10:00:00',
    endTime: '2025-06-15T11:30:00',
    status: BookingStatus.Pending,
    amountPaidCents: 0,
    discountCents: 0,
    createdAt: '2025-06-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingFormComponent);
    fixture.componentRef.setInput('sessionType', mockSessionType);
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

  it('should start at step 1', () => {
    expect(component.currentStep()).toBe(1);
  });

  it('should display session type name in title', () => {
    const title = fixture.nativeElement.querySelector('.form-title');
    expect(title.textContent).toContain('Portrait Session');
  });

  it('should show step 1 client info fields initially', () => {
    const stepTitle = fixture.nativeElement.querySelector('.step-title');
    expect(stepTitle.textContent).toContain('Your Information');
  });

  it('should advance to step 2', () => {
    component.nextStep();
    expect(component.currentStep()).toBe(2);
    fixture.detectChanges();

    const stepTitle = fixture.nativeElement.querySelector('.step-title');
    expect(stepTitle.textContent).toContain('Select Date & Time');
  });

  it('should advance to step 3', () => {
    component.nextStep();
    component.nextStep();
    expect(component.currentStep()).toBe(3);
    fixture.detectChanges();

    const stepTitle = fixture.nativeElement.querySelector('.step-title');
    expect(stepTitle.textContent).toContain('Review & Confirm');
  });

  it('should not advance beyond step 3', () => {
    component.nextStep();
    component.nextStep();
    component.nextStep();
    expect(component.currentStep()).toBe(3);
  });

  it('should go back to step 1 from step 2', () => {
    component.nextStep();
    expect(component.currentStep()).toBe(2);
    component.previousStep();
    expect(component.currentStep()).toBe(1);
  });

  it('should not go back below step 1', () => {
    component.previousStep();
    expect(component.currentStep()).toBe(1);
  });

  it('should calculate end time correctly', () => {
    component.startTime = '10:00';
    expect(component.calculatedEndTime()).toBe('11:30');
  });

  it('should handle end time crossing midnight', () => {
    component.startTime = '23:00';
    expect(component.calculatedEndTime()).toBe('00:30');
  });

  it('should return --:-- for empty start time', () => {
    component.startTime = '';
    expect(component.calculatedEndTime()).toBe('--:--');
  });

  it('should return --:-- for invalid start time', () => {
    component.startTime = 'abc';
    expect(component.calculatedEndTime()).toBe('--:--');
  });

  it('should format duration with hours and minutes', () => {
    expect(component.formatDuration(90)).toBe('1 hr 30 min');
  });

  it('should format duration with only hours', () => {
    expect(component.formatDuration(60)).toBe('1 hr');
  });

  it('should format duration with only minutes', () => {
    expect(component.formatDuration(30)).toBe('30 min');
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(25000)).toBe('$250.00');
    expect(component.formatPrice(0)).toBe('$0.00');
  });

  it('should format date time', () => {
    expect(component.formatDateTime('2025-06-15', '10:00')).toBe('2025-06-15 at 10:00');
  });

  it('should return empty string for missing date or time', () => {
    expect(component.formatDateTime('', '10:00')).toBe('');
    expect(component.formatDateTime('2025-06-15', '')).toBe('');
  });

  it('should submit booking on step 3', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.phone = '555-1234';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);

    const spy = vi.fn();
    component.bookingCreated.subscribe(spy);

    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      sessionTypeId: 'st-1',
      clientFirstName: 'Jane',
      clientLastName: 'Doe',
      clientEmail: 'jane@example.com',
      clientPhone: '555-1234',
      startTime: '2025-06-15T10:00:00',
      endTime: '2025-06-15T11:30:00',
    });
    req.flush(mockBookingRecord);

    expect(component.confirmed()).toBe(true);
    expect(component.submitting()).toBe(false);
    expect(spy).toHaveBeenCalledWith(mockBookingRecord);
  });

  it('should submit without phone when not provided', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.phone = '';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);

    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
    expect(req.request.body.clientPhone).toBeUndefined();
    req.flush(mockBookingRecord);
  });

  it('should show error on submission failure', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);

    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
    req.flush({ message: 'Time slot unavailable' }, { status: 400, statusText: 'Bad Request' });

    expect(component.submitting()).toBe(false);
    expect(component.confirmed()).toBe(false);
    expect(component.errorMessage()).toBe('Time slot unavailable');
  });

  it('should show default error message on failure without message', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);

    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
    req.error(new ProgressEvent('Network error'));

    expect(component.errorMessage()).toBe('Failed to create booking. Please try again.');
  });

  it('should not submit if already submitting', () => {
    component.currentStep.set(3);
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.submitting.set(true);

    component.onSubmit();
    httpTesting.expectNone(`${baseUrl}/api/bookings`);
  });

  it('should not submit on step other than 3', () => {
    component.currentStep.set(2);
    component.onSubmit();
    httpTesting.expectNone(`${baseUrl}/api/bookings`);
  });

  it('should show confirmation after successful booking', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);

    component.onSubmit();
    const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
    req.flush(mockBookingRecord);

    fixture.detectChanges();

    const confirmTitle = fixture.nativeElement.querySelector('.confirmation-title');
    expect(confirmTitle.textContent).toContain('Booking Confirmed');
  });

  it('should display review information on step 3', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.phone = '555-1234';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);
    fixture.detectChanges();

    const reviewValues = fixture.nativeElement.querySelectorAll('.review-value');
    const texts = Array.from(reviewValues).map((el: any) => el.textContent.trim());

    expect(texts).toContain('Portrait Session');
    expect(texts).toContain('1 hr 30 min');
    expect(texts).toContain('$250.00');
    expect(texts).toContain('2025-06-15');
    expect(texts).toContain('Jane Doe');
    expect(texts).toContain('jane@example.com');
    expect(texts).toContain('555-1234');
  });

  it('should not show phone in review when not provided', () => {
    component.firstName = 'Jane';
    component.lastName = 'Doe';
    component.email = 'jane@example.com';
    component.phone = '';
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.currentStep.set(3);
    fixture.detectChanges();

    const reviewLabels = fixture.nativeElement.querySelectorAll('.review-label');
    const labels = Array.from(reviewLabels).map((el: any) => el.textContent.trim());
    expect(labels).not.toContain('Phone');
  });

  it('should show step indicators', () => {
    const steps = fixture.nativeElement.querySelectorAll('.step');
    expect(steps.length).toBe(3);
  });

  it('should mark current step as active', () => {
    const steps = fixture.nativeElement.querySelectorAll('.step');
    expect(steps[0].classList.contains('step--active')).toBe(true);
    expect(steps[1].classList.contains('step--active')).toBe(false);
  });

  it('should mark previous steps as completed', () => {
    component.currentStep.set(3);
    fixture.detectChanges();

    const steps = fixture.nativeElement.querySelectorAll('.step');
    expect(steps[0].classList.contains('step--completed')).toBe(true);
    expect(steps[1].classList.contains('step--completed')).toBe(true);
    expect(steps[2].classList.contains('step--active')).toBe(true);
  });

  it('should show end time display on step 2', () => {
    component.currentStep.set(2);
    component.startTime = '14:00';
    fixture.detectChanges();

    const endTimeEl = fixture.nativeElement.querySelector('.end-time-display .detail-value');
    expect(endTimeEl.textContent.trim()).toBe('15:30');
  });

  it('should clear error on new submission', () => {
    component.currentStep.set(3);
    component.startDate = '2025-06-15';
    component.startTime = '10:00';
    component.errorMessage.set('Previous error');

    component.onSubmit();

    expect(component.errorMessage()).toBeNull();

    const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
    req.flush(mockBookingRecord);
  });
});
