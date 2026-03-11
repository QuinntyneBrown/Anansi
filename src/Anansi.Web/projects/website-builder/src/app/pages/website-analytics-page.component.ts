import { Component, inject, input, signal, OnInit } from '@angular/core';
import {
  DailyAnalyticsDto,
  WebsiteAnalyticsDto,
  WebsitesService,
} from 'api';
import {
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  SpinnerComponent,
  TableDataRowComponent,
  TableHeaderRowComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wb-website-analytics-page',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    FormsModule,
    SpinnerComponent,
    TableDataRowComponent,
    TableHeaderRowComponent,
  ],
  template: `
    <div class="page">
      <div class="page__header">
        <div>
          <h1 class="page__title">Analytics</h1>
          <p class="page__subtitle">Track visitors, page views, and engagement over time.</p>
        </div>
        <div class="filters">
          <label class="filter-field">
            <span>Start</span>
            <input type="date" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" />
          </label>
          <label class="filter-field">
            <span>End</span>
            <input type="date" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" />
          </label>
          <lib-button variant="primary" (clicked)="load()">Refresh</lib-button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (!analytics()) {
        <div class="empty-container">
          <lib-empty-state
            heading="Analytics unavailable"
            description="No analytics data is available for the selected date range."
          />
        </div>
      } @else if (analytics(); as summary) {
        <div class="stats-grid">
          <lib-card>
            <div class="stat-card">
              <span class="stat-card__label">Total Visitors</span>
              <span class="stat-card__value">{{ summary.totalVisitors }}</span>
            </div>
          </lib-card>
          <lib-card>
            <div class="stat-card">
              <span class="stat-card__label">Unique Visitors</span>
              <span class="stat-card__value">{{ summary.uniqueVisitors }}</span>
            </div>
          </lib-card>
          <lib-card>
            <div class="stat-card">
              <span class="stat-card__label">Page Views</span>
              <span class="stat-card__value">{{ summary.pageViews }}</span>
            </div>
          </lib-card>
          <lib-card>
            <div class="stat-card">
              <span class="stat-card__label">Avg Session</span>
              <span class="stat-card__value">{{ formatDuration(summary.averageSessionDurationSeconds) }}</span>
            </div>
          </lib-card>
        </div>

        @if (summary.dailySnapshots.length === 0) {
          <div class="empty-container">
            <lib-empty-state
              heading="No daily analytics snapshots"
              description="Traffic snapshots will appear here once visitor data is available."
            />
          </div>
        } @else {
          <div class="table-container">
            <lib-table-header-row>
              <span class="col-date">Date</span>
              <span class="col-total">Visitors</span>
              <span class="col-unique">Unique</span>
              <span class="col-pageviews">Page Views</span>
              <span class="col-duration">Avg Session</span>
            </lib-table-header-row>

            @for (snapshot of summary.dailySnapshots; track snapshot.date) {
              <lib-table-data-row>
                <span class="col-date">{{ formatDate(snapshot.date) }}</span>
                <span class="col-total">{{ snapshot.totalVisitors }}</span>
                <span class="col-unique">{{ snapshot.uniqueVisitors }}</span>
                <span class="col-pageviews">{{ snapshot.pageViews }}</span>
                <span class="col-duration">{{ formatDuration(snapshot.averageSessionDurationSeconds) }}</span>
              </lib-table-data-row>
            }
          </div>
        }
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 24px;
    }

    .page__header {
      align-items: flex-start;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .page__title {
      color: #F5F5F0;
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .page__subtitle {
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin: 8px 0 0;
    }

    .filters {
      display: flex;
      gap: 12px;
    }

    .filter-field {
      color: #6E6E70;
      display: flex;
      flex-direction: column;
      font-family: Inter, sans-serif;
      font-size: 12px;
      gap: 6px;
    }

    .filter-field input {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 10px;
      color: #F5F5F0;
      padding: 10px 12px;
    }

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .stats-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }

    .stat-card__label {
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 13px;
    }

    .stat-card__value {
      color: #F5F5F0;
      font-family: 'Cormorant Garamond', serif;
      font-size: 30px;
      font-weight: 600;
    }

    .table-container {
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
    }

    .col-date { flex: 1.2; }
    .col-total { flex: 1; }
    .col-unique { flex: 1; }
    .col-pageviews { flex: 1; }
    .col-duration { flex: 1.2; }
  `,
})
export class WebsiteAnalyticsPageComponent implements OnInit {
  private readonly websitesService = inject(WebsitesService);

  readonly websiteId = input.required<string>();
  readonly analytics = signal<WebsiteAnalyticsDto | null>(null);
  readonly loading = signal(true);
  readonly startDate = signal('');
  readonly endDate = signal('');

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.startDate.set(this.toDateInputValue(thirtyDaysAgo));
    this.endDate.set(this.toDateInputValue(today));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.websitesService.getAnalytics(this.websiteId(), {
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
    }).subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
        this.loading.set(false);
      },
      error: () => {
        this.analytics.set(null);
        this.loading.set(false);
      },
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
