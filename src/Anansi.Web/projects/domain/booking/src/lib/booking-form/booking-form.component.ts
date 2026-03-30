import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  BookingsService,
  SessionTypeDto,
  CreateBookingCommand,
  BookingRecordDto,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  InputGroupComponent,
  SpinnerComponent,
} from 'components';

@Component({
  selector: 'lib-booking-form',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent],
  template: `
    <div class="booking-form">
      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (!sessionType()) {
        <div class="error-container">
          <p class="error-text">Session type not found.</p>
        </div>
      } @else {
      <lib-card>
        <div card-header>
          <h2 class="form-title">Book {{ sessionType()!.name }}</h2>
          <div class="steps-indicator">
            <span class="step" [class.step--active]="currentStep() >= 1" [class.step--completed]="currentStep() > 1">1</span>
            <span class="step-line" [class.step-line--active]="currentStep() > 1"></span>
            <span class="step" [class.step--active]="currentStep() >= 2" [class.step--completed]="currentStep() > 2">2</span>
            <span class="step-line" [class.step-line--active]="currentStep() > 2"></span>
            <span class="step" [class.step--active]="currentStep() >= 3">3</span>
          </div>
        </div>

        @if (confirmed()) {
          <div class="confirmation">
            <div class="confirmation-icon">
              <lucide-icon name="check" [size]="40" color="#FFFFFF"></lucide-icon>
            </div>
            <h3 class="confirmation-title">Booking Confirmed!</h3>
            <p class="confirmation-text">
              Your {{ sessionType()!.name }} session has been booked for {{ formatDateTime(startDate, startTime) }}.
            </p>
            <p class="confirmation-text">A confirmation will be sent to {{ email }}.</p>

            <div class="confirmation-details-card">
              <div class="confirmation-detail-row">
                <span class="confirmation-detail-label">Session Type</span>
                <span class="confirmation-detail-value">{{ sessionType()!.name }}</span>
              </div>
              <div class="confirmation-detail-row">
                <span class="confirmation-detail-label">Date</span>
                <span class="confirmation-detail-value">{{ startDate }}</span>
              </div>
              <div class="confirmation-detail-row">
                <span class="confirmation-detail-label">Time</span>
                <span class="confirmation-detail-value">{{ startTime }} - {{ calculatedEndTime() }}</span>
              </div>
              @if (sessionType()!.location) {
                <div class="confirmation-detail-row">
                  <span class="confirmation-detail-label">Location</span>
                  <span class="confirmation-detail-value">{{ sessionType()!.location }}</span>
                </div>
              }
            </div>

            <div class="calendar-buttons">
              <lib-button variant="outline" icon="calendar" (clicked)="onAddToCalendar('google')">Google Calendar</lib-button>
              <lib-button variant="outline" icon="calendar" (clicked)="onAddToCalendar('apple')">Apple Calendar</lib-button>
              <lib-button variant="outline" icon="calendar" (clicked)="onAddToCalendar('outlook')">Outlook</lib-button>
            </div>
          </div>
        } @else {
          @if (errorMessage()) {
            <div class="error-banner">{{ errorMessage() }}</div>
          }

          <form (ngSubmit)="onSubmit()">
            @if (currentStep() === 1) {
              <div class="step-content">
                <h3 class="step-title">Your Information</h3>
                <div class="form-fields">
                  <lib-input-group
                    label="First Name"
                    placeholder="Enter your first name"
                    [(ngModel)]="firstName"
                    name="firstName"
                  />
                  <lib-input-group
                    label="Last Name"
                    placeholder="Enter your last name"
                    [(ngModel)]="lastName"
                    name="lastName"
                  />
                  <lib-input-group
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    [(ngModel)]="email"
                    name="email"
                  />
                  <lib-input-group
                    label="Phone (optional)"
                    type="tel"
                    placeholder="Your phone number"
                    [(ngModel)]="phone"
                    name="phone"
                  />
                </div>
                <div class="form-actions">
                  <lib-button variant="primary" (clicked)="nextStep()">Continue</lib-button>
                </div>
              </div>
            }

            @if (currentStep() === 2) {
              <div class="step-content">
                <h3 class="step-title">Select Date & Time</h3>
                <div class="form-fields">
                  <lib-input-group
                    label="Date"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    [(ngModel)]="startDate"
                    name="startDate"
                  />
                  <lib-input-group
                    label="Start Time"
                    type="text"
                    placeholder="HH:MM"
                    [(ngModel)]="startTime"
                    name="startTime"
                  />
                  <div class="end-time-display">
                    <span class="detail-label">End Time (calculated)</span>
                    <span class="detail-value">{{ calculatedEndTime() }}</span>
                  </div>
                </div>
                <div class="form-actions">
                  <lib-button variant="outline" (clicked)="previousStep()">Back</lib-button>
                  <lib-button variant="primary" (clicked)="nextStep()">Continue</lib-button>
                </div>
              </div>
            }

            @if (currentStep() === 3) {
              <div class="step-content">
                <h3 class="step-title">Review & Confirm</h3>
                <div class="review-section">
                  <div class="review-group">
                    <h4 class="review-heading">Session</h4>
                    <div class="review-row">
                      <span class="review-label">Type</span>
                      <span class="review-value">{{ sessionType()!.name }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Duration</span>
                      <span class="review-value">{{ formatDuration(sessionType()!.durationMinutes) }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Price</span>
                      <span class="review-value price">{{ formatPrice(sessionType()!.priceCents) }}</span>
                    </div>
                  </div>
                  <div class="review-group">
                    <h4 class="review-heading">Date & Time</h4>
                    <div class="review-row">
                      <span class="review-label">Date</span>
                      <span class="review-value">{{ startDate }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Time</span>
                      <span class="review-value">{{ startTime }} - {{ calculatedEndTime() }}</span>
                    </div>
                  </div>
                  <div class="review-group">
                    <h4 class="review-heading">Contact</h4>
                    <div class="review-row">
                      <span class="review-label">Name</span>
                      <span class="review-value">{{ firstName }} {{ lastName }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Email</span>
                      <span class="review-value">{{ email }}</span>
                    </div>
                    @if (phone) {
                      <div class="review-row">
                        <span class="review-label">Phone</span>
                        <span class="review-value">{{ phone }}</span>
                      </div>
                    }
                  </div>
                </div>
                <div class="form-actions">
                  <lib-button variant="outline" (clicked)="previousStep()">Back</lib-button>
                  <lib-button variant="primary" type="submit" [disabled]="submitting() || !firstName.trim() || !lastName.trim() || !email.trim() || !startDate.trim() || !startTime.trim()">
                    @if (submitting()) {
                      <lib-spinner [size]="16" />
                    }
                    Confirm Booking
                  </lib-button>
                </div>
              </div>
            }
          </form>
        }
      </lib-card>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .error-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .error-text {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
    }

    .booking-form {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    lib-card {
      display: block;
      width: 100%;
      max-width: 560px;
    }

    .form-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 16px;
    }

    .steps-indicator {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .step {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 600;
      background: #242426;
      border: 1px solid #3A3A3C;
      color: #6E6E70;
      flex-shrink: 0;
    }

    .step--active {
      background: #C9A962;
      border-color: #C9A962;
      color: #1A1A1C;
    }

    .step--completed {
      background: #6E9E6E;
      border-color: #6E9E6E;
      color: #1A1A1C;
    }

    .step-line {
      height: 2px;
      flex: 1;
      background: #3A3A3C;
    }

    .step-line--active {
      background: #6E9E6E;
    }

    .step-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .end-time-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
    }

    .detail-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .detail-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      font-weight: 500;
    }

    .review-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .review-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .review-heading {
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }

    .review-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .review-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .review-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      font-weight: 500;
    }

    .review-value.price {
      color: #C9A962;
    }

    .error-banner {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .confirmation {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 24px;
      padding: 40px 0;
    }

    .confirmation-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #6E9E6E;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .confirmation-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .confirmation-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0;
    }

    .confirmation-details-card {
      width: 500px;
      max-width: 100%;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
    }

    .confirmation-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .confirmation-detail-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .confirmation-detail-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      font-weight: 500;
    }

    .calendar-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `,
})
export class BookingFormComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);

  readonly sessionTypeId = input.required<string>();
  readonly bookingCreated = output<BookingRecordDto>();

  readonly sessionType = signal<SessionTypeDto | null>(null);
  readonly loading = signal(true);
  readonly currentStep = signal(1);
  readonly submitting = signal(false);
  readonly confirmed = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.bookingsService.listSessionTypes().subscribe({
      next: (types) => {
        const match = types.find((t) => t.id === this.sessionTypeId());
        this.sessionType.set(match ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load session type.');
      },
    });
  }

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  startDate = '';
  startTime = '';

  calculatedEndTime(): string {
    if (!this.startTime) return '--:--';
    const parts = this.startTime.split(':');
    if (parts.length < 2) return '--:--';
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return '--:--';
    const totalMinutes = hours * 60 + minutes + (this.sessionType()?.durationMinutes ?? 0);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  onSubmit(): void {
    if (this.submitting() || this.currentStep() !== 3) return;
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) return;
    if (!this.startDate.trim() || !this.startTime.trim()) return;

    const endTime = this.calculatedEndTime();
    const command: CreateBookingCommand = {
      sessionTypeId: this.sessionType()!.id,
      clientFirstName: this.firstName,
      clientLastName: this.lastName,
      clientEmail: this.email,
      clientPhone: this.phone || undefined,
      startTime: `${this.startDate}T${this.startTime}:00`,
      endTime: `${this.startDate}T${endTime}:00`,
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.bookingsService.create(command).subscribe({
      next: (record) => {
        this.submitting.set(false);
        this.confirmed.set(true);
        this.bookingCreated.emit(record);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to create booking. Please try again.');
      },
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  formatDateTime(date: string, time: string): string {
    if (!date || !time) return '';
    return `${date} at ${time}`;
  }

  onAddToCalendar(provider: 'google' | 'apple' | 'outlook'): void {
    const session = this.sessionType();
    if (!session) return;
    const title = encodeURIComponent(session.name);
    const startIso = `${this.startDate.replace(/-/g, '')}T${this.startTime.replace(/:/g, '')}00`;
    const endIso = `${this.startDate.replace(/-/g, '')}T${this.calculatedEndTime().replace(/:/g, '')}00`;

    let url = '';
    switch (provider) {
      case 'google':
        url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${this.startDate}T${this.startTime}:00&enddt=${this.startDate}T${this.calculatedEndTime()}:00`;
        break;
      case 'apple':
        // Apple Calendar uses .ics files; open a data URI
        url = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0ABEGIN:VEVENT%0ASUMMARY:${title}%0ADTSTART:${startIso}%0ADTEND:${endIso}%0AEND:VEVENT%0AEND:VCALENDAR`;
        break;
    }
    if (url) {
      window.open(url, '_blank');
    }
  }
}
