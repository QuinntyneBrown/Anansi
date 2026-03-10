import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  PaymentsService,
  RevenueDashboardDto,
  PaymentRecordDto,
  PagedList,
} from 'api';
import {
  TopBarComponent,
  ButtonComponent,
  MetricCardComponent,
  CardComponent,
  SpinnerComponent,
  TableHeaderRowComponent,
  TableDataRowComponent,
} from 'components';

@Component({
  selector: 'lib-revenue-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    TopBarComponent,
    ButtonComponent,
    MetricCardComponent,
    CardComponent,
    SpinnerComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="48" />
      </div>
    } @else if (error()) {
      <div class="error-container">
        <p class="error-text">Failed to load reports data. Please try again.</p>
        <lib-button variant="outline" (clicked)="reload()">Retry</lib-button>
      </div>
    } @else {
      <lib-top-bar>
        <div topbar-left class="header-left">
          <h1 class="page-title">Reports</h1>
          <span class="date-range">{{ dateFrom() }} - {{ dateTo() }}</span>
        </div>
        <div topbar-right>
          <lib-button variant="outline" (clicked)="exportCsv()">Export</lib-button>
        </div>
      </lib-top-bar>

      <div class="dashboard-content">
        <div class="metrics-row">
          <lib-metric-card [value]="formatCurrency(dashboard()!.totalRevenueCents)" label="Total Revenue" />
          <lib-metric-card [value]="formatCurrency(dashboard()!.netRevenueCents)" label="Net Revenue" />
          <lib-metric-card [value]="formatCurrency(dashboard()!.totalTaxCents)" label="Tax" />
          <lib-metric-card [value]="formatCurrency(dashboard()!.totalTipsCents)" label="Tips" />
        </div>

        <lib-card>
          <h2 card-header class="section-title">Revenue Overview</h2>
          <div class="chart-container">
            @for (bar of barHeights(); track $index) {
              <div class="chart-bar-wrapper">
                <div class="chart-bar" [style.height.%]="bar"></div>
              </div>
            }
          </div>
        </lib-card>

        <lib-card>
          <h2 card-header class="section-title">Recent Transactions</h2>
          <div class="table-container">
            <lib-table-header-row>
              <span class="col-client">Client</span>
              <span class="col-desc">Description</span>
              <span class="col-date">Date</span>
              <span class="col-amount">Amount</span>
            </lib-table-header-row>
            @for (tx of transactions(); track tx.id) {
              <lib-table-data-row>
                <span class="col-client">{{ tx.contactId ?? 'N/A' }}</span>
                <span class="col-desc">{{ tx.description ?? '-' }}</span>
                <span class="col-date">{{ tx.createdAt | date:'mediumDate' }}</span>
                <span class="col-amount">{{ formatCurrency(tx.amountCents) }}</span>
              </lib-table-data-row>
            }
          </div>
        </lib-card>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      background: #1A1A1C;
      min-height: 100vh;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      gap: 16px;
    }

    .error-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #C94A4A;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0;
    }

    .date-range {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    .dashboard-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0;
    }

    .chart-container {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 200px;
      padding: 0 8px;
    }

    .chart-bar-wrapper {
      flex: 1;
      display: flex;
      align-items: flex-end;
      height: 100%;
    }

    .chart-bar {
      width: 100%;
      background: #C9A962;
      border-radius: 4px 4px 0 0;
      min-height: 4px;
      transition: height 0.3s ease;
    }

    .table-container {
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid #2A2A2C;
    }

    .col-client { flex: 2; }
    .col-desc { flex: 3; }
    .col-date { flex: 1.5; }
    .col-amount { flex: 1; text-align: right; }
  `,
})
export class RevenueDashboardPageComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);

  readonly dashboard = signal<RevenueDashboardDto | null>(null);
  readonly transactions = signal<PaymentRecordDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly dateFrom = signal('Jan 1, 2026');
  readonly dateTo = signal('Mar 10, 2026');

  readonly barHeights = computed<number[]>(() => {
    const dash = this.dashboard();
    if (!dash || !dash.paymentMethodBreakdown.length) {
      return [];
    }
    const values = dash.paymentMethodBreakdown.map((b) => b.totalCents);
    const max = Math.max(...values);
    if (max === 0) {
      return values.map(() => 0);
    }
    return values.map((v) => Math.round((v / max) * 100));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.paymentsService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loadTransactions();
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.load();
  }

  private loadTransactions(): void {
    this.paymentsService.listTransactions({ pageSize: 10 }).subscribe({
      next: (result: PagedList<PaymentRecordDto>) => {
        this.transactions.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return '$' + dollars.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  exportCsv(): void {
    this.paymentsService.exportTransactions({
      from: this.dateFrom(),
      to: this.dateTo(),
    }).subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
