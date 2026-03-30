import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SessionTypeDto } from 'api';
import { ButtonComponent, InputGroupComponent, SpinnerComponent } from 'components';

export interface PaymentCompleteEvent {
  success: boolean;
  transactionId?: string;
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

@Component({
  selector: 'lib-booking-payment',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ButtonComponent, InputGroupComponent, SpinnerComponent],
  template: `
    <div class="payment-page">
      <!-- Payment Form -->
      <div class="payment-form">
        <h1 class="payment-title">Payment</h1>

        <div class="deposit-frame">
          <span class="deposit-label">Deposit Amount</span>
          <span class="deposit-value">{{ formatPrice(depositAmount()) }}</span>
        </div>

        <div class="form-fields">
          <lib-input-group
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            [(ngModel)]="cardNumber"
            name="cardNumber"
          />

          <div class="row-fields">
            <lib-input-group
              label="Expiry"
              placeholder="MM/YY"
              [(ngModel)]="expiry"
              name="expiry"
            />
            <lib-input-group
              label="CVC"
              placeholder="123"
              [(ngModel)]="cvc"
              name="cvc"
            />
          </div>

          <lib-input-group
            label="Coupon Code"
            placeholder="Enter coupon code"
            [(ngModel)]="couponCode"
            name="couponCode"
          />
        </div>

        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }

        <lib-button
          variant="primary"
          [disabled]="submitting() || !cardNumber.trim() || !expiry.trim() || !cvc.trim()"
          (clicked)="onBookNow()"
        >
          @if (submitting()) {
            <lib-spinner [size]="16" />
          }
          Book Now — {{ formatPrice(depositAmount()) }}
        </lib-button>
      </div>

      <!-- Booking Summary Sidebar -->
      <div class="summary-sidebar">
        <h2 class="summary-title">Booking Summary</h2>
        <div class="divider"></div>

        <div class="summary-rows">
          <div class="summary-row">
            <span class="summary-label">Session</span>
            <span class="summary-value">{{ sessionType()?.name }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Date</span>
            <span class="summary-value">{{ selectedDate() }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Time</span>
            <span class="summary-value">{{ selectedTime() }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Client</span>
            <span class="summary-value">{{ clientInfo()?.firstName }} {{ clientInfo()?.lastName }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="summary-row total-row">
          <span class="total-label">Total</span>
          <span class="total-value">{{ formatPrice(sessionType()?.priceCents ?? 0) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .payment-page {
      display: flex;
      gap: 40px;
      padding: 32px 48px;
      background: #1A1A1C;
      min-height: 700px;
    }

    .payment-form {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .payment-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .deposit-frame {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .deposit-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .deposit-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #C9A962;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .row-fields {
      display: flex;
      gap: 16px;
    }

    .row-fields lib-input-group {
      flex: 1;
    }

    .error-banner {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
    }

    lib-button {
      width: 100%;
    }

    lib-button .btn {
      width: 100%;
      justify-content: center;
    }

    .summary-sidebar {
      width: 380px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: fit-content;
    }

    .summary-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .divider {
      height: 1px;
      background: #3A3A3C;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .summary-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      font-weight: 500;
    }

    .total-row {
      padding-top: 4px;
    }

    .total-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .total-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #C9A962;
    }

    @media (max-width: 480px) {
      .payment-page {
        flex-direction: column;
        padding: 20px;
      }

      .summary-sidebar {
        width: 100%;
      }
    }
  `,
})
export class BookingPaymentComponent {
  readonly sessionType = input<SessionTypeDto | null>(null);
  readonly selectedDate = input<string>('');
  readonly selectedTime = input<string>('');
  readonly clientInfo = input<ClientInfo | null>(null);
  readonly paymentComplete = output<PaymentCompleteEvent>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  cardNumber = '';
  expiry = '';
  cvc = '';
  couponCode = '';

  readonly depositAmount = signal(25000); // $250 default, in cents

  onBookNow(): void {
    if (this.submitting()) return;
    if (!this.cardNumber.trim() || !this.expiry.trim() || !this.cvc.trim()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    // Simulate payment processing — replace with real Stripe integration
    setTimeout(() => {
      this.submitting.set(false);
      this.paymentComplete.emit({ success: true, transactionId: crypto.randomUUID() });
    }, 1500);
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
