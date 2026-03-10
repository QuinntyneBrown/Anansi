import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NotificationsService,
  NotificationPreferenceItemDto,
  NotificationDeliveryMethod,
  EmailDigestOption,
  UpdateNotificationPreferenceCommand,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  SpinnerComponent,
  ToggleComponent,
} from 'components';

@Component({
  selector: 'lib-notification-settings-page',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    ToggleComponent,
  ],
  template: `
    @if (loading()) {
      <div class="page__loading">
        <lib-spinner [size]="32" />
      </div>
    } @else {
      <div class="page">
        <h1 class="page__title">Notification Preferences</h1>

        @if (successMessage()) {
          <div class="page__success">{{ successMessage() }}</div>
        }

        @if (errorMessage()) {
          <div class="page__error">{{ errorMessage() }}</div>
        }

        <lib-card>
          <div class="prefs">
            <div class="prefs__header">
              <span class="prefs__header-label prefs__header-label--event">Event</span>
              <span class="prefs__header-label">In-App</span>
              <span class="prefs__header-label">Email</span>
              <span class="prefs__header-label">Push</span>
              <span class="prefs__header-label prefs__header-label--digest">Email Digest</span>
            </div>

            @for (pref of preferences(); track pref.eventType) {
              <div class="prefs__row">
                <span class="prefs__event-name">{{ formatEventType(pref.eventType) }}</span>
                <div class="prefs__toggle-cell">
                  <lib-toggle
                    [checked]="hasMethod(pref, 'InApp')"
                    (checkedChange)="onToggleMethod(pref, 'InApp', $event)"
                  />
                </div>
                <div class="prefs__toggle-cell">
                  <lib-toggle
                    [checked]="hasMethod(pref, 'Email')"
                    (checkedChange)="onToggleMethod(pref, 'Email', $event)"
                  />
                </div>
                <div class="prefs__toggle-cell">
                  <lib-toggle
                    [checked]="hasMethod(pref, 'Push')"
                    (checkedChange)="onToggleMethod(pref, 'Push', $event)"
                  />
                </div>
                <div class="prefs__digest-cell">
                  <select
                    class="prefs__digest-select"
                    [ngModel]="pref.emailDigest"
                    (ngModelChange)="onDigestChange(pref, $event)"
                    [attr.name]="'digest-' + pref.eventType"
                  >
                    <option value="RealTime">Real Time</option>
                    <option value="DailySummary">Daily Summary</option>
                  </select>
                </div>
              </div>
            }
          </div>
        </lib-card>

        <div class="page__actions">
          <lib-button
            variant="primary"
            [disabled]="saving()"
            (clicked)="onSave()"
          >
            @if (saving()) {
              <lib-spinner [size]="16" />
            }
            Save Preferences
          </lib-button>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .page {
      max-width: 820px;
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

    .prefs {
      display: flex;
      flex-direction: column;
    }

    .prefs__header {
      display: grid;
      grid-template-columns: 1fr 60px 60px 60px 140px;
      gap: 12px;
      align-items: center;
      padding: 0 0 12px;
      border-bottom: 1px solid #3A3A3C;
    }

    .prefs__header-label {
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }

    .prefs__header-label--event {
      text-align: left;
    }

    .prefs__header-label--digest {
      text-align: left;
    }

    .prefs__row {
      display: grid;
      grid-template-columns: 1fr 60px 60px 60px 140px;
      gap: 12px;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #2A2A2C;
    }

    .prefs__row:last-child {
      border-bottom: none;
    }

    .prefs__event-name {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }

    .prefs__toggle-cell {
      display: flex;
      justify-content: center;
    }

    .prefs__digest-cell {
      display: flex;
    }

    .prefs__digest-select {
      width: 100%;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 6px 8px;
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
      cursor: pointer;
      outline: none;
    }

    .prefs__digest-select:focus {
      border-color: #C9A962;
    }

    .page__actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class NotificationSettingsPageComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly preferences = signal<NotificationPreferenceItemDto[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.notificationsService.getPreferences().subscribe({
      next: (dto) => {
        this.preferences.set(dto.preferences);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load notification preferences.');
      },
    });
  }

  hasMethod(pref: NotificationPreferenceItemDto, method: string): boolean {
    return pref.deliveryMethods.includes(method as NotificationDeliveryMethod);
  }

  onToggleMethod(
    pref: NotificationPreferenceItemDto,
    method: string,
    enabled: boolean,
  ): void {
    const deliveryMethod = method as NotificationDeliveryMethod;
    this.preferences.update((prefs) =>
      prefs.map((p) => {
        if (p.eventType !== pref.eventType) return p;
        const methods = enabled
          ? [...p.deliveryMethods, deliveryMethod]
          : p.deliveryMethods.filter((m) => m !== deliveryMethod);
        return { ...p, deliveryMethods: methods };
      }),
    );
  }

  onDigestChange(
    pref: NotificationPreferenceItemDto,
    digest: EmailDigestOption,
  ): void {
    this.preferences.update((prefs) =>
      prefs.map((p) =>
        p.eventType === pref.eventType ? { ...p, emailDigest: digest } : p,
      ),
    );
  }

  onSave(): void {
    if (this.saving()) return;

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const prefs = this.preferences();
    let completed = 0;
    let hasError = false;

    if (prefs.length === 0) {
      this.saving.set(false);
      this.successMessage.set('Preferences saved successfully.');
      return;
    }

    for (const pref of prefs) {
      const command: UpdateNotificationPreferenceCommand = {
        eventType: pref.eventType,
        deliveryMethods: pref.deliveryMethods,
        emailDigest: pref.emailDigest,
      };
      this.notificationsService.updatePreferences(command).subscribe({
        next: () => {
          completed++;
          if (completed === prefs.length && !hasError) {
            this.saving.set(false);
            this.successMessage.set('Preferences saved successfully.');
          }
        },
        error: () => {
          if (!hasError) {
            hasError = true;
            this.saving.set(false);
            this.errorMessage.set(
              'Failed to save preferences. Please try again.',
            );
          }
        },
      });
    }
  }

  formatEventType(eventType: string): string {
    return eventType.replace(/([A-Z])/g, ' $1').trim();
  }
}
