import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import {
  InteracService,
  InteracPaymentRequestDto,
} from 'api';
import {
  ButtonComponent,
  SpinnerComponent,
} from 'components';

function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

@Component({
  selector: 'lib-interac-instructions',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="page">
      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="48" />
        </div>
      } @else if (request()) {
        <div class="card">
          <!-- Icon -->
          <div class="icon-circle">
            <lucide-icon name="banknote" [size]="28" color="#C9A962"></lucide-icon>
          </div>

          <!-- Title -->
          <h1 class="title">Pay via Interac e-Transfer</h1>
          <p class="subtitle">Send your payment to the email below</p>

          <div class="divider"></div>

          <!-- Amount -->
          <div class="amount-row">
            <span class="amount-label">Amount Due</span>
            <span class="amount-value">{{ formatCurrency(request()!.amountCents) }}</span>
          </div>

          <!-- Send To -->
          <div class="section">
            <span class="section-label">SEND TO</span>
            <div class="copy-box">
              <span class="copy-box__text">{{ recipientEmail() }}</span>
              <button class="copy-btn" (click)="copyToClipboard(recipientEmail())">
                <lucide-icon [name]="copiedEmail() ? 'check' : 'copy'" [size]="16"></lucide-icon>
              </button>
            </div>
          </div>

          <!-- Payment Reference -->
          <div class="section">
            <span class="section-label">PAYMENT REFERENCE</span>
            <div class="copy-box">
              <span class="copy-box__text copy-box__text--mono">{{ request()!.reference }}</span>
              <button class="copy-btn" (click)="copyToClipboard(request()!.reference, true)">
                <lucide-icon [name]="copiedRef() ? 'check' : 'copy'" [size]="16"></lucide-icon>
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- How To Pay -->
          <div class="how-to-pay">
            <span class="how-to-pay__title">HOW TO PAY</span>
            <ol class="steps">
              <li class="step">
                <span class="step__number">1</span>
                <span class="step__text">Open your banking app and select Interac e-Transfer</span>
              </li>
              <li class="step">
                <span class="step__number">2</span>
                <span class="step__text">Send the exact amount to the email above, using the reference as the message</span>
              </li>
              <li class="step">
                <span class="step__number">3</span>
                <span class="step__text">Click the button below to confirm you've sent the transfer</span>
              </li>
            </ol>
          </div>

          <!-- Confirm Button -->
          <lib-button
            variant="primary"
            (clicked)="onConfirmSent()"
            [disabled]="confirming()"
            style="width: 100%"
          >
            @if (confirming()) {
              Confirming...
            } @else if (confirmed()) {
              Transfer Confirmed
            } @else {
              I've Sent the Transfer
            }
          </lib-button>
        </div>
      } @else {
        <div class="card">
          <div class="error-container">
            <p class="error-text">Payment request not found or has expired.</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      font-family: Inter, sans-serif;
    }

    .page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #1A1A1C;
      padding: 32px 16px;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 500px;
      height: 400px;
    }

    .card {
      width: 500px;
      max-width: 100%;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
    }

    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(201, 169, 98, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0;
      text-align: center;
    }

    .subtitle {
      font-size: 13px;
      color: #6E6E70;
      margin: -16px 0 0;
      text-align: center;
    }

    .divider {
      width: 100%;
      height: 1px;
      background: #3A3A3C;
    }

    .amount-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .amount-label {
      font-size: 14px;
      color: #6E6E70;
    }

    .amount-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 500;
      color: #C9A962;
    }

    .section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #6E6E70;
      text-transform: uppercase;
    }

    .copy-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .copy-box__text {
      font-size: 14px;
      color: #F5F5F0;
      word-break: break-all;
    }

    .copy-box__text--mono {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 13px;
      color: #C9A962;
    }

    .copy-btn {
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      color: #6E6E70;
      padding: 6px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: 12px;
    }

    .copy-btn:hover {
      color: #C9A962;
      border-color: #C9A962;
    }

    .how-to-pay {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .how-to-pay__title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #6E6E70;
      text-transform: uppercase;
    }

    .steps {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .step__number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(201, 169, 98, 0.12);
      color: #C9A962;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step__text {
      font-size: 13px;
      color: #F5F5F0;
      line-height: 1.5;
      padding-top: 2px;
    }

    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }

    .error-text {
      color: #6E6E70;
      font-size: 14px;
      margin: 0;
    }

    /* Full-width button override */
    :host ::ng-deep lib-button {
      width: 100%;
    }

    :host ::ng-deep lib-button .btn {
      width: 100%;
      justify-content: center;
    }
  `,
})
export class InteracInstructionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly interacService = inject(InteracService);

  readonly request = signal<InteracPaymentRequestDto | null>(null);
  readonly recipientEmail = signal('');
  readonly loading = signal(true);
  readonly confirming = signal(false);
  readonly confirmed = signal(false);
  readonly copiedEmail = signal(false);
  readonly copiedRef = signal(false);

  readonly formatCurrency = formatCurrency;

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.interacService.getRequest(requestId).pipe(
        catchError(() => of(null)),
      ).subscribe((result) => {
        this.request.set(result);
        // In a real app, recipientEmail would come from config or the request
        this.recipientEmail.set('payments@studio.ca');
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  copyToClipboard(text: string, isRef = false): void {
    navigator.clipboard.writeText(text).then(() => {
      if (isRef) {
        this.copiedRef.set(true);
        setTimeout(() => this.copiedRef.set(false), 2000);
      } else {
        this.copiedEmail.set(true);
        setTimeout(() => this.copiedEmail.set(false), 2000);
      }
    });
  }

  onConfirmSent(): void {
    const req = this.request();
    if (!req) return;

    this.confirming.set(true);
    this.interacService.confirmTransfer({ requestId: req.id }).subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirmed.set(true);
      },
      error: () => {
        this.confirming.set(false);
      },
    });
  }
}
