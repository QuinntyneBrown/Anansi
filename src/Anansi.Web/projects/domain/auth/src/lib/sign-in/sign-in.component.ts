import { Component, inject, signal, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse, LoginCommand } from 'api';
import { CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent } from 'components';

@Component({
  selector: 'lib-sign-in',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent],
  template: `
    <div class="sign-in">
      <lib-card>
        <div class="sign-in__header">
          <h1 class="sign-in__title">Anansi</h1>
          <p class="sign-in__subtitle">Welcome back</p>
        </div>

        @if (errorMessage()) {
          <div class="sign-in__error">{{ errorMessage() }}</div>
        }

        <form class="sign-in__form" (ngSubmit)="onSubmit()">
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
            placeholder="Enter your password"
            [(ngModel)]="password"
            name="password"
          />

          <a class="sign-in__forgot-link" (click)="onForgotPassword()">
            Forgot password?
          </a>

          <lib-button
            type="submit"
            variant="primary"
            [disabled]="loading()"
          >
            @if (loading()) {
              <lib-spinner [size]="16" />
            }
            Sign In
          </lib-button>
        </form>

        <div class="sign-in__divider">
          <span class="sign-in__divider-line"></span>
          <span class="sign-in__divider-text">or</span>
          <span class="sign-in__divider-line"></span>
        </div>

        <lib-button
          variant="outline"
          (clicked)="onGoogleSignIn()"
          [disabled]="loading()"
        >
          Continue with Google
        </lib-button>

        <p class="sign-in__footer">
          Don't have an account?
          <a class="sign-in__link" (click)="onSignUp()">Sign up</a>
        </p>
      </lib-card>
    </div>
  `,
  styles: `
    .sign-in {
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

    .sign-in__header {
      text-align: center;
      margin-bottom: 32px;
    }

    .sign-in__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #C9A962;
      margin: 0 0 8px;
    }

    .sign-in__subtitle {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0;
    }

    .sign-in__error {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .sign-in__form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sign-in__forgot-link {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #C9A962;
      cursor: pointer;
      text-decoration: none;
      text-align: right;
      margin-top: -8px;
    }

    .sign-in__forgot-link:hover {
      text-decoration: underline;
    }

    .sign-in__form lib-button {
      width: 100%;
    }

    .sign-in__form lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }

    .sign-in__divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
    }

    .sign-in__divider-line {
      flex: 1;
      height: 1px;
      background: #3A3A3C;
    }

    .sign-in__divider-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .sign-in lib-button[variant="outline"] {
      width: 100%;
    }

    .sign-in lib-button[variant="outline"] ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }

    .sign-in__footer {
      text-align: center;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 24px 0 0;
    }

    .sign-in__link {
      color: #C9A962;
      cursor: pointer;
      text-decoration: none;
    }

    .sign-in__link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .sign-in {
        padding: 0;
        align-items: stretch;
      }

      lib-card {
        max-width: 100%;
        padding: 28px;
        border-radius: 0;
      }

      .sign-in__form {
        gap: 24px;
      }
    }
  `,
})
export class SignInComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly authSuccess = output<AuthResponse>();
  readonly navigateToSignUp = output<void>();
  readonly navigateToForgotPassword = output<void>();

  onForgotPassword(): void {
    this.navigateToForgotPassword.emit();
    this.router.navigate(['/forgot-password']);
  }

  onSignUp(): void {
    this.navigateToSignUp.emit();
    this.router.navigate(['/sign-up']);
  }

  email = '';
  password = '';

  onSubmit(): void {
    if (this.loading()) return;

    const command: LoginCommand = {
      email: this.email,
      password: this.password,
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(command).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.authSuccess.emit(response);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Sign in failed. Please try again.');
      },
    });
  }

  onGoogleSignIn(): void {
    // Google OAuth placeholder
  }
}
