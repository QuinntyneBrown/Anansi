import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, ForgotPasswordCommand, ResetPasswordCommand } from 'api';
import { CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent } from 'components';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lib-password-recovery',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent, LucideAngularModule],
  template: `
    <div class="recovery">
      <lib-card>
        @switch (step()) {
          @case ('request') {
            <div class="recovery__header">
              <h1 class="recovery__title">Anansi</h1>
              <p class="recovery__subtitle">Reset your password</p>
              <p class="recovery__description">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            @if (errorMessage()) {
              <div class="recovery__error">{{ errorMessage() }}</div>
            }

            <form class="recovery__form" (ngSubmit)="onSendResetLink()">
              <lib-input-group
                label="Email"
                type="email"
                placeholder="you@example.com"
                [(ngModel)]="email"
                name="email"
              />
              <lib-button
                type="submit"
                variant="primary"
                [disabled]="loading()"
              >
                @if (loading()) {
                  <lib-spinner [size]="16" />
                }
                Send Reset Link
              </lib-button>
            </form>

            <p class="recovery__footer">
              <a class="recovery__link" (click)="navigateToSignIn.emit()">Back to Sign In</a>
            </p>
          }

          @case ('check-email') {
            <div class="recovery__header">
              <div class="recovery__icon"><lucide-icon name="mail" [size]="48"></lucide-icon></div>
              <h2 class="recovery__check-title">Check your email</h2>
              <p class="recovery__description">
                We've sent a password reset link to <strong>{{ email }}</strong>.
                Please check your inbox and follow the instructions.
              </p>
            </div>

            <p class="recovery__footer">
              <a class="recovery__link" (click)="navigateToSignIn.emit()">Back to Sign In</a>
            </p>
          }

          @case ('new-password') {
            <div class="recovery__header">
              <h1 class="recovery__title">Anansi</h1>
              <p class="recovery__subtitle">Set new password</p>
              <p class="recovery__description">
                Enter your reset token and choose a new password.
              </p>
            </div>

            @if (errorMessage()) {
              <div class="recovery__error">{{ errorMessage() }}</div>
            }

            <form class="recovery__form" (ngSubmit)="onResetPassword()">
              <lib-input-group
                label="Reset Token"
                type="text"
                placeholder="Paste your reset token"
                [(ngModel)]="token"
                name="token"
              />
              <lib-input-group
                label="New Password"
                type="password"
                placeholder="Enter new password"
                [(ngModel)]="newPassword"
                name="newPassword"
              />
              <lib-input-group
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
              />
              <lib-button
                type="submit"
                variant="primary"
                [disabled]="loading()"
              >
                @if (loading()) {
                  <lib-spinner [size]="16" />
                }
                Reset Password
              </lib-button>
            </form>

            <p class="recovery__footer">
              <a class="recovery__link" (click)="navigateToSignIn.emit()">Back to Sign In</a>
            </p>
          }
        }
      </lib-card>
    </div>
  `,
  styles: `
    .recovery {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #1A1A1C;
      padding: 24px;
    }

    lib-card {
      display: block;
      width: 100%;
      max-width: 440px;
    }

    .recovery__header {
      text-align: center;
      margin-bottom: 32px;
    }

    .recovery__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 8px;
    }

    .recovery__subtitle {
      font-family: Inter, sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0 0 8px;
    }

    .recovery__description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0;
      line-height: 1.5;
    }

    .recovery__description strong {
      color: #F5F5F0;
    }

    .recovery__icon {
      margin-bottom: 16px;
      color: #C9A962;
    }

    .recovery__check-title {
      font-family: Inter, sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 12px;
    }

    .recovery__error {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .recovery__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .recovery__form lib-button {
      width: 100%;
    }

    .recovery__form lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }

    .recovery__footer {
      text-align: center;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 24px 0 0;
    }

    .recovery__link {
      color: #C9A962;
      cursor: pointer;
      text-decoration: none;
    }

    .recovery__link:hover {
      text-decoration: underline;
    }
  `,
})
export class PasswordRecoveryComponent {
  private readonly authService = inject(AuthService);

  readonly step = signal<'request' | 'check-email' | 'new-password'>('request');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly recoveryComplete = output<void>();
  readonly navigateToSignIn = output<void>();

  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';

  onSendResetLink(): void {
    if (this.loading()) return;

    const command: ForgotPasswordCommand = { email: this.email };

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(command).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('check-email');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to send reset link. Please try again.');
      },
    });
  }

  onResetPassword(): void {
    if (this.loading()) return;

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    const command: ResetPasswordCommand = {
      token: this.token,
      newPassword: this.newPassword,
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword(command).subscribe({
      next: () => {
        this.loading.set(false);
        this.recoveryComplete.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to reset password. Please try again.');
      },
    });
  }
}
