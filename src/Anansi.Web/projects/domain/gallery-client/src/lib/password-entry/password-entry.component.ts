import { Component, inject, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollectionsService, TranslationService } from 'api';
import { CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent } from 'components';

@Component({
  selector: 'lib-password-entry',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, InputGroupComponent, SpinnerComponent],
  template: `
    <div class="password-entry">
      <lib-card>
        <div class="password-entry__header">
          <h1 class="password-entry__title">Protected Gallery</h1>
          <p class="password-entry__subtitle">Enter the password to view this gallery</p>
        </div>

        @if (errorMessage()) {
          <div class="password-entry__error">{{ errorMessage() }}</div>
        }

        <form class="password-entry__form" (ngSubmit)="onSubmit()">
          <lib-input-group
            label="Password"
            type="password"
            placeholder="Enter gallery password"
            [(ngModel)]="password"
            name="password"
          />

          <lib-button
            type="submit"
            variant="primary"
            [disabled]="loading() || !password.trim()"
          >
            @if (loading()) {
              <lib-spinner [size]="16" />
            }
            Enter Gallery
          </lib-button>
        </form>
      </lib-card>
    </div>
  `,
  styles: `
    .password-entry {
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

    .password-entry__header {
      text-align: center;
      margin-bottom: 32px;
    }

    .password-entry__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 8px;
    }

    .password-entry__subtitle {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0;
    }

    .password-entry__error {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .password-entry__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .password-entry__form lib-button {
      width: 100%;
    }

    .password-entry__form lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }
  `,
})
export class PasswordEntryComponent {
  private readonly collectionsService = inject(CollectionsService);

  readonly collectionId = input.required<string>();
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly verified = output<void>();

  password = '';

  onSubmit(): void {
    if (this.loading() || !this.password.trim()) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.collectionsService.verifyPassword(this.collectionId(), { password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.verified.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Incorrect password. Please try again.');
      },
    });
  }
}
