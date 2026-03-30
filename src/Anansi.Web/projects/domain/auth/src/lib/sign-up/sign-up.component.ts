import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse, RegisterCommand } from 'api';
import { CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent } from 'components';

@Component({
  selector: 'lib-sign-up',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent],
  template: `
    <div class="sign-up">
      <lib-card>
        <div class="sign-up__header">
          <h1 class="sign-up__title">Anansi</h1>
          <p class="sign-up__subtitle">Create your account</p>
        </div>

        @if (errorMessage()) {
          <div class="sign-up__error">{{ errorMessage() }}</div>
        }

        <form class="sign-up__form" (ngSubmit)="onSubmit()">
          <lib-input-group
            label="Business Name"
            placeholder="Your business name"
            [(ngModel)]="businessName"
            name="businessName"
          />
          <lib-input-group
            label="Full Name"
            placeholder="Your full name"
            [(ngModel)]="fullName"
            name="fullName"
          />
          <lib-input-group
            label="Email"
            type="email"
            placeholder="you@example.com"
            [(ngModel)]="email"
            name="email"
          />
          <lib-input-group
            label="Password"
            type="password"
            placeholder="Create a password"
            [(ngModel)]="password"
            name="password"
          />

          <lib-button
            type="submit"
            variant="primary"
            [disabled]="loading()"
          >
            @if (loading()) {
              <lib-spinner [size]="16" />
            }
            Create Account
          </lib-button>
        </form>

        <div class="sign-up__divider">
          <span class="sign-up__divider-line"></span>
          <span class="sign-up__divider-text">or</span>
          <span class="sign-up__divider-line"></span>
        </div>

        <lib-button
          variant="outline"
          (clicked)="onGoogleSignUp()"
          [disabled]="loading()"
        >
          Continue with Google
        </lib-button>

        <p class="sign-up__footer">
          Already have an account?
          <a class="sign-up__link" (click)="navigateToSignIn.emit()">Sign In</a>
        </p>
      </lib-card>
    </div>
  `,
  styles: `
    .sign-up {
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
      max-width: 480px;
    }

    .sign-up__header {
      text-align: center;
      margin-bottom: 32px;
    }

    .sign-up__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #C9A962;
      margin: 0 0 8px;
    }

    .sign-up__subtitle {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0;
    }

    .sign-up__error {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .sign-up__form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sign-up__form lib-button {
      width: 100%;
    }

    .sign-up__form lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }

    .sign-up__divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
    }

    .sign-up__divider-line {
      flex: 1;
      height: 1px;
      background: #3A3A3C;
    }

    .sign-up__divider-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    lib-card ~ lib-button,
    .sign-up lib-button[variant="outline"] {
      width: 100%;
    }

    .sign-up lib-button[variant="outline"] ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }

    .sign-up__footer {
      text-align: center;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 24px 0 0;
    }

    .sign-up__link {
      color: #C9A962;
      cursor: pointer;
      text-decoration: none;
    }

    .sign-up__link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .sign-up {
        padding: 0;
        align-items: stretch;
      }

      lib-card {
        max-width: 100%;
        padding: 28px;
        border-radius: 0;
      }

      .sign-up__form {
        gap: 24px;
      }
    }
  `,
})
export class SignUpComponent {
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly authSuccess = output<AuthResponse>();
  readonly navigateToSignIn = output<void>();

  businessName = '';
  fullName = '';
  email = '';
  password = '';

  onSubmit(): void {
    if (this.loading()) return;

    const nameParts = this.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const command: RegisterCommand = {
      businessName: this.businessName,
      firstName,
      lastName,
      email: this.email,
      password: this.password,
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(command).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.authSuccess.emit(response);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }

  onGoogleSignUp(): void {
    // Google OAuth placeholder
  }
}
