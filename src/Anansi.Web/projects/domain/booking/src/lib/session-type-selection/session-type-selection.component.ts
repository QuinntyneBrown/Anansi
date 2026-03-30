import { Component, inject, signal, computed, OnInit, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { BookingsService, SessionTypeDto, SessionVisibility } from 'api';
import { CardComponent, ButtonComponent, SpinnerComponent, EmptyStateComponent } from 'components';

@Component({
  selector: 'lib-session-type-selection',
  standalone: true,
  imports: [LucideAngularModule, CardComponent, ButtonComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    <div class="cover-section">
      <div class="profile-image">
        <lucide-icon name="user" [size]="48"></lucide-icon>
      </div>
      <h1 class="photographer-name">Studio Name</h1>
      <p class="welcome-text">Welcome! Browse our available session types and book the perfect photography experience for you.</p>
    </div>

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
              <lib-button variant="primary" (clicked)="onBook(session)">Book Now</lib-button>
            </div>
          </lib-card>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .cover-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 60px 0;
    }

    .profile-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 2px solid #C9A962;
      background: #242426;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6E6E70;
    }

    .photographer-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
      text-align: center;
    }

    .welcome-text {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0;
      text-align: center;
      max-width: 600px;
      line-height: 1.5;
    }

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
      gap: 32px;
      padding: 0 120px;
    }

    .session-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
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
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      color: #C9A962;
    }

    @media (max-width: 480px) {
      .session-grid {
        grid-template-columns: 1fr;
        padding: 0 20px;
        gap: 20px;
      }

      .cover-section {
        padding: 40px 20px;
      }

      .photographer-name {
        font-size: 32px;
      }
    }
  `,
})
export class SessionTypeSelectionComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);

  readonly allSessions = signal<SessionTypeDto[]>([]);
  readonly loading = signal(true);
  readonly sessionTypeSelected = output<SessionTypeDto>();

  readonly publicSessions = computed(() =>
    this.allSessions().filter((s) => s.visibility === SessionVisibility.Public),
  );

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
