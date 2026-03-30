import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import {
  TaxService,
  TaxDashboardDto,
  TaxProfileDto,
  QuarterlyBreakdownDto,
  TaxRegistrationStatus,
} from 'api';
import {
  ButtonComponent,
  ToggleComponent,
  SpinnerComponent,
} from 'components';

function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatCompactCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'lib-tax-profile-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    ToggleComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="page-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar__nav">
          @for (item of navItems; track item.route) {
            <button
              class="sidebar__item"
              [class.sidebar__item--active]="item.active"
              (click)="navigateTo(item.route)"
            >
              <lucide-icon [name]="item.icon" [size]="20"></lucide-icon>
              <span>{{ item.label }}</span>
            </button>
          }
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main">
        <!-- Header -->
        <header class="header">
          <h1 class="header__title">Tax & HST</h1>
        </header>

        <!-- Body -->
        <div class="body">
          @if (loading()) {
            <div class="loading-container">
              <lib-spinner [size]="48" />
            </div>
          } @else {
            <!-- Metric Cards -->
            <div class="metrics-row">
              <div class="metric-card">
                <span class="metric-card__label">HST Rate</span>
                <span class="metric-card__value">{{ profile()?.hstRate ?? 13 }}%</span>
              </div>
              <div class="metric-card">
                <span class="metric-card__label">Revenue YTD</span>
                <span class="metric-card__value">{{ formatCompactCurrency(profile()?.revenueYtdCents ?? 0) }}</span>
              </div>
              <div class="metric-card metric-card--threshold">
                <span class="metric-card__label">Threshold</span>
                <span class="metric-card__value">{{ thresholdPercentage() }}%</span>
                <div class="progress-bar">
                  <div class="progress-bar__fill" [style.width.%]="thresholdPercentage()"></div>
                </div>
                <span class="metric-card__sub">{{ formatCompactCurrency(profile()?.revenueYtdCents ?? 0) }} of $30,000</span>
              </div>
            </div>

            <!-- Alert Banner -->
            @if (thresholdPercentage() >= 75) {
              <div class="alert-banner">
                <lucide-icon name="alert-triangle" [size]="20" color="#C9A962"></lucide-icon>
                <span class="alert-banner__text">
                  You've reached {{ thresholdPercentage() }}% of the $30,000 CRA threshold.
                  @if (thresholdPercentage() >= 100) {
                    HST registration is now mandatory.
                  } @else {
                    Consider registering for HST voluntarily to claim Input Tax Credits.
                  }
                </span>
              </div>
            }

            <!-- Tax Profile Card -->
            <div class="card">
              <h3 class="card__title">Tax Profile</h3>
              <div class="card__body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Registration Number</label>
                    <div class="form-value">{{ profile()?.registrationNumber || 'Not registered' }}</div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">HST Rate</label>
                    <div class="form-value">{{ profile()?.hstRate ?? 13 }}%</div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Status</label>
                    <div class="status-toggle">
                      <span
                        class="status-option"
                        [class.status-option--active]="profile()?.status === 'Voluntary'"
                      >Voluntary</span>
                      <span class="status-divider">/</span>
                      <span
                        class="status-option"
                        [class.status-option--active]="profile()?.status === 'Mandatory'"
                      >Mandatory</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quarterly Breakdown Card -->
            <div class="card">
              <h3 class="card__title">Quarterly Breakdown</h3>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr class="table__header-row">
                      <th class="table__th">Quarter</th>
                      <th class="table__th table__th--right">Revenue</th>
                      <th class="table__th table__th--right">HST Collected</th>
                      <th class="table__th table__th--right">ITCs Claimed</th>
                      <th class="table__th table__th--right">Net HST Owing</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (q of quarterlyBreakdowns(); track q.quarter) {
                      <tr class="table__row">
                        <td class="table__td">{{ q.quarter }}</td>
                        <td class="table__td table__td--right">{{ formatCurrency(q.revenueCents) }}</td>
                        <td class="table__td table__td--right">{{ formatCurrency(q.hstCollectedCents) }}</td>
                        <td class="table__td table__td--right table__td--green">{{ formatCurrency(q.itcClaimedCents) }}</td>
                        <td class="table__td table__td--right table__td--gold">{{ formatCurrency(q.netHstOwingCents) }}</td>
                      </tr>
                    }
                    @if (quarterlyBreakdowns().length === 0) {
                      <tr>
                        <td class="table__td table__td--empty" colspan="5">No quarterly data available</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      font-family: Inter, sans-serif;
    }

    .page-layout {
      display: flex;
      height: 100%;
    }

    /* Sidebar */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: #1A1A1C;
      border-right: 1px solid #3A3A3C;
      padding: 24px 0;
    }

    .sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0 12px;
    }

    .sidebar__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border: none;
      background: none;
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      width: 100%;
      text-align: left;
    }

    .sidebar__item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: #F5F5F0;
    }

    .sidebar__item--active {
      background: rgba(201, 169, 98, 0.12);
      color: #C9A962;
    }

    .sidebar__item--active:hover {
      background: rgba(201, 169, 98, 0.16);
      color: #C9A962;
    }

    /* Main */
    .main {
      flex: 1;
      overflow-y: auto;
      min-width: 0;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid #3A3A3C;
    }

    .header__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
    }

    /* Body */
    .body {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    /* Metric Cards */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .metric-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .metric-card__label {
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-card__value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 300;
      color: #F5F5F0;
      line-height: 1;
    }

    .metric-card__sub {
      font-size: 11px;
      color: #6E6E70;
      margin-top: 4px;
    }

    .metric-card--threshold .metric-card__value {
      font-size: 36px;
    }

    /* Progress Bar */
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #3A3A3C;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 8px;
    }

    .progress-bar__fill {
      height: 100%;
      background: #C9A962;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    /* Alert Banner */
    .alert-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(201, 169, 98, 0.07);
      border: 1px solid rgba(201, 169, 98, 0.24);
      border-radius: 16px;
    }

    .alert-banner__text {
      font-size: 14px;
      color: #F5F5F0;
      line-height: 1.5;
    }

    /* Card */
    .card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      overflow: hidden;
    }

    .card__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #3A3A3C;
    }

    .card__body {
      padding: 24px;
    }

    /* Form Row */
    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-value {
      font-size: 14px;
      color: #F5F5F0;
    }

    .status-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-option {
      font-size: 14px;
      color: #6E6E70;
    }

    .status-option--active {
      color: #C9A962;
      font-weight: 500;
    }

    .status-divider {
      color: #3A3A3C;
    }

    /* Table */
    .table-container {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table__header-row {
      border-bottom: 1px solid #3A3A3C;
    }

    .table__th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6E6E70;
      text-align: left;
    }

    .table__th--right {
      text-align: right;
    }

    .table__row {
      border-bottom: 1px solid #2A2A2C;
    }

    .table__row:last-child {
      border-bottom: none;
    }

    .table__td {
      padding: 14px 16px;
      font-size: 14px;
      color: #F5F5F0;
    }

    .table__td--right {
      text-align: right;
    }

    .table__td--green {
      color: #6E9E6E;
    }

    .table__td--gold {
      color: #C9A962;
      font-weight: 500;
    }

    .table__td--empty {
      text-align: center;
      color: #6E6E70;
      padding: 48px 16px;
    }
  `,
})
export class TaxProfilePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly taxService = inject(TaxService);

  readonly profile = signal<TaxProfileDto | null>(null);
  readonly quarterlyBreakdowns = signal<QuarterlyBreakdownDto[]>([]);
  readonly loading = signal(true);

  readonly formatCurrency = formatCurrency;
  readonly formatCompactCurrency = formatCompactCurrency;

  readonly navItems: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard', active: false },
    { label: 'Interac Payments', icon: 'banknote', route: '/interac', active: false },
    { label: 'Tax & HST', icon: 'receipt', route: '/tax', active: true },
    { label: 'Expenses', icon: 'wallet', route: '/tax/expenses', active: false },
    { label: 'Settings', icon: 'settings', route: '/settings', active: false },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const emptyDashboard: TaxDashboardDto = {
      profile: {
        id: '',
        registrationNumber: undefined,
        hstRate: 13,
        status: TaxRegistrationStatus.NotRegistered,
        revenueYtdCents: 0,
        thresholdCents: 3000000,
        thresholdPercentage: 0,
        isRegistered: false,
        updatedAt: new Date().toISOString(),
      },
      quarterlyBreakdowns: [],
    };

    this.taxService.getDashboard().pipe(
      catchError(() => of(emptyDashboard)),
    ).subscribe((dashboard) => {
      this.profile.set(dashboard.profile);
      this.quarterlyBreakdowns.set(dashboard.quarterlyBreakdowns);
      this.loading.set(false);
    });
  }

  thresholdPercentage(): number {
    const p = this.profile();
    if (!p) return 0;
    return Math.min(100, Math.round(p.thresholdPercentage));
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
