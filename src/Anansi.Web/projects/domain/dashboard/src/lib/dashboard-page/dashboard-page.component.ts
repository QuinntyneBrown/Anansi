import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin, of, catchError } from 'rxjs';
import {
  PaymentsService,
  BookingsService,
  NotificationsService,
  RevenueDashboardDto,
  BookingRecordDto,
  NotificationDto,
} from 'api';
import {
  MetricCardComponent,
  CardComponent,
  AvatarComponent,
  BadgeComponent,
  SpinnerComponent,
} from 'components';

export function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) {
    return 'just now';
  }
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }
  if (diffHr < 24) {
    return `${diffHr} hr ago`;
  }
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

function bookingBadgeVariant(
  status: string,
): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
    case 'Declined':
    case 'NoShow':
      return 'error';
    default:
      return 'neutral';
  }
}

function notificationDotColor(category: string): string {
  switch (category) {
    case 'ClientGallery':
      return '#C9A962';
    case 'Store':
      return '#6E9E6E';
    case 'StudioManager':
      return '#5B8DEF';
    default:
      return '#6E6E70';
  }
}

@Component({
  selector: 'lib-dashboard-page',
  standalone: true,
  imports: [
    MetricCardComponent,
    CardComponent,
    AvatarComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="48" />
      </div>
    } @else if (error()) {
      <div class="error-container">
        <p class="error-text">Something went wrong. Please try again.</p>
      </div>
    } @else {
      <div class="metrics-row">
        <lib-metric-card [value]="formatCurrency(dashboard()!.totalRevenueCents)" label="Revenue" />
        <lib-metric-card [value]="'' + upcomingSessions().length" label="Sessions" />
        <lib-metric-card [value]="'' + dashboard()!.pendingInvoiceCount" label="Pending Invoices" />
        <lib-metric-card [value]="'' + newLeadsCount()" label="New Leads" />
      </div>

      <div class="two-column">
        <lib-card>
          <h3 card-header class="card-title">Upcoming Sessions</h3>
          @for (session of upcomingSessions(); track session.id) {
            <div class="session-row">
              <span class="session-time">{{ formatSessionTime(session.startTime) }}</span>
              <lib-avatar [initials]="sessionInitials(session)" [size]="32" />
              <span class="session-client">{{ session.clientFirstName }} {{ session.clientLastName }}</span>
              <span class="session-type">{{ session.sessionTypeName }}</span>
              <lib-badge [variant]="getBadgeVariant(session.status)">{{ session.status }}</lib-badge>
            </div>
          }
          @if (upcomingSessions().length === 0) {
            <p class="empty-text">No upcoming sessions</p>
          }
        </lib-card>

        <lib-card>
          <h3 card-header class="card-title">Recent Activity</h3>
          @for (notification of recentActivity(); track notification.id) {
            <div class="activity-row">
              <span class="activity-dot" [style.background]="getDotColor(notification.category)"></span>
              <div class="activity-content">
                <span class="activity-title">{{ notification.title }}</span>
                <span class="activity-desc">{{ notification.message }}</span>
              </div>
              <span class="activity-time">{{ relativeTime(notification.createdAt) }}</span>
            </div>
          }
          @if (recentActivity().length === 0) {
            <p class="empty-text">No recent activity</p>
          }
        </lib-card>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 32px;
      font-family: Inter, sans-serif;
    }
    .loading-container,
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }
    .error-text {
      color: #C94A4A;
      font-size: 14px;
    }
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
    }
    .session-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #2A2A2C;
    }
    .session-row:last-child {
      border-bottom: none;
    }
    .session-time {
      font-size: 12px;
      color: #6E6E70;
      min-width: 56px;
    }
    .session-client {
      font-size: 14px;
      color: #F5F5F0;
      flex: 1;
    }
    .session-type {
      font-size: 12px;
      color: #6E6E70;
    }
    .activity-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #2A2A2C;
    }
    .activity-row:last-child {
      border-bottom: none;
    }
    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 5px;
    }
    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .activity-title {
      font-size: 14px;
      color: #F5F5F0;
    }
    .activity-desc {
      font-size: 12px;
      color: #6E6E70;
    }
    .activity-time {
      font-size: 12px;
      color: #6E6E70;
      white-space: nowrap;
    }
    .empty-text {
      color: #6E6E70;
      font-size: 14px;
      text-align: center;
      padding: 24px 0;
      margin: 0;
    }
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);
  private readonly bookingsService = inject(BookingsService);
  private readonly notificationsService = inject(NotificationsService);

  readonly dashboard = signal<RevenueDashboardDto | null>(null);
  readonly upcomingSessions = signal<BookingRecordDto[]>([]);
  readonly recentActivity = signal<NotificationDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly formatCurrency = formatCurrency;
  readonly relativeTime = relativeTime;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);

    const emptyDashboard: RevenueDashboardDto = {
      totalRevenueCents: 0,
      pendingInvoiceCount: 0,
      paidInvoiceCount: 0,
      overdueInvoiceCount: 0,
    } as RevenueDashboardDto;
    const emptyPage = { items: [], totalCount: 0, page: 1, pageSize: 5, totalPages: 0 };

    forkJoin({
      dashboard: this.paymentsService.getDashboard().pipe(catchError(() => of(emptyDashboard))),
      sessions: this.bookingsService.list({ pageSize: 5 }).pipe(catchError(() => of(emptyPage))),
      activity: this.notificationsService.list({ pageSize: 5 }).pipe(catchError(() => of(emptyPage))),
    }).subscribe({
      next: (result) => {
        this.dashboard.set(result.dashboard);
        this.upcomingSessions.set(result.sessions.items);
        this.recentActivity.set(result.activity.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  newLeadsCount(): number {
    return this.recentActivity().filter(
      (n) => n.eventType === 'FormSubmissionReceived' || n.eventType === 'SessionBooked',
    ).length;
  }

  formatSessionTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  sessionInitials(session: BookingRecordDto): string {
    return (
      (session.clientFirstName?.[0] ?? '') + (session.clientLastName?.[0] ?? '')
    ).toUpperCase();
  }

  getBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    return bookingBadgeVariant(status);
  }

  getDotColor(category: string): string {
    return notificationDotColor(category);
  }
}
