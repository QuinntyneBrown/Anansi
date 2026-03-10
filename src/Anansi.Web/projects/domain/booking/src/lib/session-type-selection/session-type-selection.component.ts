import { Component, inject, signal, OnInit, output } from '@angular/core';
import { BookingsService, SessionTypeDto, SessionVisibility } from 'api';
import { CardComponent, ButtonComponent, SpinnerComponent, EmptyStateComponent } from 'components';

@Component({
  selector: 'lib-session-type-selection',
  standalone: true,
  imports: [CardComponent, ButtonComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="32" />
      </div>
    } @else if (publicSessions().length === 0) {
      <div class="empty-container">
        <lib-empty-state
          heading="No Sessions Available"
          description="There are no session types available for booking at this time."
        />
      </div>
    } @else {
      <div class="session-grid">
        @for (session of publicSessions(); track session.id) {
          <lib-card>
            <div card-header>
              <h3 class="session-name">{{ session.name }}</h3>
            </div>
            <div class="session-body">
              @if (session.description) {
                <p class="session-description">{{ session.description }}</p>
              }
              <div class="session-details">
                <span class="detail-item">
                  <span class="detail-label">Duration</span>
                  <span class="detail-value">{{ formatDuration(session.durationMinutes) }}</span>
                </span>
                <span class="detail-item">
                  <span class="detail-label">Price</span>
                  <span class="detail-value price">{{ formatPrice(session.priceCents) }}</span>
                </span>
                @if (session.location) {
                  <span class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">{{ session.location }}</span>
                  </span>
                }
              </div>
            </div>
            <div card-actions>
              <lib-button variant="primary" (clicked)="onBook(session)">Book</lib-button>
            </div>
          </lib-card>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .session-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      padding: 24px;
    }

    .session-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .session-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .session-description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0;
      line-height: 1.5;
    }

    .session-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .detail-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      font-weight: 500;
    }

    .detail-value.price {
      color: #C9A962;
    }
  `,
})
export class SessionTypeSelectionComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);

  readonly allSessions = signal<SessionTypeDto[]>([]);
  readonly loading = signal(true);
  readonly sessionTypeSelected = output<SessionTypeDto>();

  publicSessions = () =>
    this.allSessions().filter((s) => s.visibility === SessionVisibility.Public);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bookingsService.listSessionTypes().subscribe({
      next: (sessions) => {
        this.allSessions.set(sessions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onBook(session: SessionTypeDto): void {
    this.sessionTypeSelected.emit(session);
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
}
