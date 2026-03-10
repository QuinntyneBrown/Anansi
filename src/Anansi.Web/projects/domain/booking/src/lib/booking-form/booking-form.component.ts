import { Component, inject, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent],
  template: `
    <div class="booking-form">
      <lib-card>
        <div card-header>
          <h2 class="form-title">Book {{ sessionType().name }}</h2>
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
            <div class="confirmation-icon">&#10003;</div>
            <h3 class="confirmation-title">Booking Confirmed!</h3>
            <p class="confirmation-text">
              Your {{ sessionType().name }} session has been booked for {{ formatDateTime(startDate, startTime) }}.
            </p>
            <p class="confirmation-text">A confirmation will be sent to {{ email }}.</p>
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
                      <span class="review-value">{{ sessionType().name }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Duration</span>
                      <span class="review-value">{{ formatDuration(sessionType().durationMinutes) }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Price</span>
                      <span class="review-value price">{{ formatPrice(sessionType().priceCents) }}</span>
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
                  <lib-button variant="primary" type="submit" [disabled]="submitting()">
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
    </div>
  `,
  styles: `
    :host { display: block; }

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
      gap: 12px;
      padding: 24px 0;
    }

    .confirmation-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #6E9E6E;
      color: #1A1A1C;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }

    .confirmation-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
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
  `,
})
export class BookingFormComponent {
  private readonly bookingsService = inject(BookingsService);

  readonly sessionType = input.required<SessionTypeDto>();
  readonly bookingCreated = output<BookingRecordDto>();

  readonly currentStep = signal(1);
  readonly submitting = signal(false);
  readonly confirmed = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
    const totalMinutes = hours * 60 + minutes + this.sessionType().durationMinutes;
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

    const endTime = this.calculatedEndTime();
    const command: CreateBookingCommand = {
      sessionTypeId: this.sessionType().id,
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
}
