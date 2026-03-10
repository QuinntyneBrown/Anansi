import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AccountService,
  AccountSettings,
  UpdateAccountSettingsCommand,
  StorageUsageDto,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  InputGroupComponent,
  SpinnerComponent,
  ConfirmDialogComponent,
} from 'components';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'lib-account-settings-page',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    InputGroupComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  template: `
    @if (loading()) {
      <div class="page__loading">
        <lib-spinner [size]="32" />
      </div>
    } @else {
      <div class="page">
        <h1 class="page__title">Account Settings</h1>

        @if (successMessage()) {
          <div class="page__success">{{ successMessage() }}</div>
        }

        @if (errorMessage()) {
          <div class="page__error">{{ errorMessage() }}</div>
        }

        <lib-card>
          <div card-header>
            <h2 class="section__title">Profile</h2>
          </div>

          <form class="form" (ngSubmit)="onSave()">
            <div class="form__row">
              <lib-input-group
                label="Email"
                type="email"
                [disabled]="true"
                [(ngModel)]="email"
                name="email"
              />
            </div>
            <div class="form__row form__row--split">
              <lib-input-group
                label="First Name"
                placeholder="First name"
                [(ngModel)]="firstName"
                name="firstName"
              />
              <lib-input-group
                label="Last Name"
                placeholder="Last name"
                [(ngModel)]="lastName"
                name="lastName"
              />
            </div>
            <lib-input-group
              label="Business Name"
              placeholder="Your business name"
              [(ngModel)]="businessName"
              name="businessName"
            />
            <lib-input-group
              label="Timezone"
              placeholder="e.g. America/New_York"
              [(ngModel)]="timezone"
              name="timezone"
            />

            <div class="form__actions">
              <lib-button
                type="submit"
                variant="primary"
                [disabled]="saving()"
              >
                @if (saving()) {
                  <lib-spinner [size]="16" />
                }
                Save Changes
              </lib-button>
            </div>
          </form>
        </lib-card>

        <lib-card>
          <div card-header>
            <h2 class="section__title">Storage Usage</h2>
          </div>

          @if (storage()) {
            <div class="storage">
              <div class="storage__bar-container">
                <div
                  class="storage__bar-fill"
                  [style.width.%]="storagePercentage()"
                  [class.storage__bar-fill--warning]="storage()!.warningLevel === 'Warning80' || storage()!.warningLevel === 'Warning90'"
                  [class.storage__bar-fill--critical]="storage()!.warningLevel === 'Critical95'"
                ></div>
              </div>
              <p class="storage__text">
                {{ formatBytes(storage()!.usedBytes) }} of {{ formatBytes(storage()!.totalBytes) }} used ({{ storagePercentage() }}%)
              </p>
            </div>
          }
        </lib-card>

        <lib-card>
          <div card-header>
            <h2 class="section__title section__title--danger">Danger Zone</h2>
          </div>

          <p class="danger__text">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <div class="danger__actions">
            <lib-button
              variant="destructive"
              (clicked)="showDeleteConfirm.set(true)"
            >
              Delete Account
            </lib-button>
          </div>
        </lib-card>
      </div>
    }

    <lib-confirm-dialog
      title="Delete Account"
      message="Are you sure you want to permanently delete your account? All your data will be lost. This action cannot be undone."
      confirmLabel="Delete Account"
      [open]="showDeleteConfirm()"
      (confirmed)="onDeleteAccount()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page__loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
    }

    .page__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .page__success {
      background: rgba(110, 158, 110, 0.1);
      border: 1px solid #6E9E6E;
      border-radius: 12px;
      padding: 12px 16px;
      color: #6E9E6E;
      font-family: Inter, sans-serif;
      font-size: 14px;
    }

    .page__error {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
    }

    .section__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .section__title--danger {
      color: #C94A4A;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form__row--split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form__actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .storage {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .storage__bar-container {
      width: 100%;
      height: 8px;
      background: #3A3A3C;
      border-radius: 4px;
      overflow: hidden;
    }

    .storage__bar-fill {
      height: 100%;
      background: #C9A962;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .storage__bar-fill--warning {
      background: #C9A962;
    }

    .storage__bar-fill--critical {
      background: #C94A4A;
    }

    .storage__text {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    .danger__text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0 0 16px;
    }

    .danger__actions {
      display: flex;
    }
  `,
})
export class AccountSettingsPageComponent implements OnInit {
  private readonly accountService = inject(AccountService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly storage = signal<StorageUsageDto | null>(null);
  readonly showDeleteConfirm = signal(false);

  email = '';
  firstName = '';
  lastName = '';
  businessName = '';
  timezone = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      settings: this.accountService.getSettings(),
      storage: this.accountService.getStorageUsage(),
    }).subscribe({
      next: ({ settings, storage }) => {
        this.applySettings(settings);
        this.storage.set(storage);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load account settings.');
      },
    });
  }

  onSave(): void {
    if (this.saving()) return;

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const command: UpdateAccountSettingsCommand = {
      firstName: this.firstName,
      lastName: this.lastName,
      businessName: this.businessName,
      timezone: this.timezone || undefined,
    };

    this.accountService.updateSettings(command).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Settings saved successfully.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Failed to save settings. Please try again.');
      },
    });
  }

  onDeleteAccount(): void {
    this.showDeleteConfirm.set(false);
    this.accountService.deleteAccount().subscribe({
      next: () => {
        this.successMessage.set('Account deleted.');
      },
      error: () => {
        this.errorMessage.set('Failed to delete account. Please try again.');
      },
    });
  }

  storagePercentage(): number {
    const s = this.storage();
    if (!s || s.totalBytes === 0) return 0;
    return Math.round((s.usedBytes / s.totalBytes) * 100);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
  }

  private applySettings(settings: AccountSettings): void {
    this.email = settings.email;
    this.firstName = settings.firstName;
    this.lastName = settings.lastName;
    this.businessName = settings.businessName;
    this.timezone = settings.timezone ?? '';
  }
}
