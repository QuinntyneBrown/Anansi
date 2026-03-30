import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import {
  InteracService,
  InteracConfigDto,
  InteracPaymentRequestDto,
  InteracRequestStatus,
} from 'api';
import {
  ButtonComponent,
  BadgeComponent,
  ToggleComponent,
  TabBarComponent,
  TabItem,
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'lib-interac-payments-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    ToggleComponent,
    TabBarComponent,
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
          <h1 class="header__title">Interac e-Transfer</h1>
          <div class="header__actions">
            <lib-button variant="ghost" icon="settings" (clicked)="navigateTo('/settings')">Settings</lib-button>
            <lib-button variant="primary" icon="plus" (clicked)="onNewRequest()">New Request</lib-button>
          </div>
        </header>

        <!-- Body -->
        <div class="body">
          @if (loading()) {
            <div class="loading-container">
              <lib-spinner [size]="48" />
            </div>
          } @else {
            <!-- Interac Config Card -->
            @if (config()) {
              <div class="config-card">
                <div class="config-card__row">
                  <div class="config-card__info">
                    <span class="config-card__label">Registered Email</span>
                    <span class="config-card__value">{{ config()!.registeredEmail }}</span>
                  </div>
                  <div class="config-card__toggle">
                    <lib-toggle
                      [checked]="config()!.isEnabled"
                      [label]="config()!.isEnabled ? 'Enabled' : 'Disabled'"
                    />
                  </div>
                </div>
              </div>
            }

            <!-- Filter Tabs -->
            <lib-tab-bar
              [tabs]="filterTabs"
              [activeTab]="activeFilter()"
              (tabChange)="onFilterChange($event)"
            />

            <!-- Payment Requests Table -->
            <div class="table-card">
              <table class="table">
                <thead>
                  <tr class="table__header-row">
                    <th class="table__th">Reference</th>
                    <th class="table__th">Client</th>
                    <th class="table__th table__th--right">Amount</th>
                    <th class="table__th">Status</th>
                    <th class="table__th">Date</th>
                    <th class="table__th table__th--right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (request of filteredRequests(); track request.id) {
                    <tr class="table__row">
                      <td class="table__td table__td--mono">{{ request.reference }}</td>
                      <td class="table__td">
                        <div class="client-cell">
                          <span class="client-cell__name">{{ request.clientName }}</span>
                          <span class="client-cell__email">{{ request.clientEmail }}</span>
                        </div>
                      </td>
                      <td class="table__td table__td--right table__td--amount">{{ formatCurrency(request.amountCents) }}</td>
                      <td class="table__td">
                        <lib-badge [variant]="statusVariant(request.status)">{{ request.status }}</lib-badge>
                      </td>
                      <td class="table__td table__td--muted">{{ formatDate(request.createdAt) }}</td>
                      <td class="table__td table__td--right">
                        <button class="action-btn" (click)="onViewRequest(request)">
                          <lucide-icon name="eye" [size]="16"></lucide-icon>
                        </button>
                        @if (request.status === 'Pending') {
                          <button class="action-btn action-btn--danger" (click)="onCancelRequest(request)">
                            <lucide-icon name="x" [size]="16"></lucide-icon>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                  @if (filteredRequests().length === 0) {
                    <tr>
                      <td class="table__td table__td--empty" colspan="6">No payment requests found</td>
                    </tr>
                  }
                </tbody>
              </table>
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

    .header__actions {
      display: flex;
      gap: 12px;
      align-items: center;
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

    /* Config Card */
    .config-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      padding: 20px;
    }

    .config-card__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .config-card__info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .config-card__label {
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .config-card__value {
      font-size: 14px;
      color: #F5F5F0;
    }

    .config-card__toggle {
      display: flex;
      align-items: center;
    }

    /* Table Card */
    .table-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      overflow: hidden;
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
      transition: background 0.1s;
    }

    .table__row:last-child {
      border-bottom: none;
    }

    .table__row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .table__td {
      padding: 14px 16px;
      font-size: 14px;
      color: #F5F5F0;
      vertical-align: middle;
    }

    .table__td--right {
      text-align: right;
    }

    .table__td--mono {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 13px;
      color: #C9A962;
    }

    .table__td--amount {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 500;
    }

    .table__td--muted {
      color: #6E6E70;
      font-size: 13px;
    }

    .table__td--empty {
      text-align: center;
      color: #6E6E70;
      padding: 48px 16px;
      font-size: 14px;
    }

    .client-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .client-cell__name {
      font-size: 14px;
      color: #F5F5F0;
    }

    .client-cell__email {
      font-size: 12px;
      color: #6E6E70;
    }

    .action-btn {
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      color: #6E6E70;
      padding: 6px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }

    .action-btn:hover {
      color: #F5F5F0;
      border-color: #6E6E70;
    }

    .action-btn--danger:hover {
      color: #C94A4A;
      border-color: #C94A4A;
    }
  `,
})
export class InteracPaymentsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly interacService = inject(InteracService);

  readonly config = signal<InteracConfigDto | null>(null);
  readonly requests = signal<InteracPaymentRequestDto[]>([]);
  readonly loading = signal(true);
  readonly activeFilter = signal('all');

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  readonly navItems: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard', active: false },
    { label: 'Interac Payments', icon: 'banknote', route: '/interac', active: true },
    { label: 'Invoices', icon: 'file-text', route: '/documents/invoices', active: false },
    { label: 'Tax & HST', icon: 'receipt', route: '/tax', active: false },
    { label: 'Settings', icon: 'settings', route: '/settings', active: false },
  ];

  readonly filterTabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Expired', value: 'Expired' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const emptyConfig: InteracConfigDto = {
      id: '',
      registeredEmail: 'payments@studio.ca',
      isEnabled: true,
      autoDepositEnabled: true,
      updatedAt: new Date().toISOString(),
    };

    const emptyPage = { items: [], totalCount: 0, page: 1, pageSize: 25, totalPages: 0, hasPrevious: false, hasNext: false };

    forkJoin({
      config: this.interacService.getConfig().pipe(catchError(() => of(emptyConfig))),
      requests: this.interacService.listRequests({ pageSize: 25 }).pipe(catchError(() => of(emptyPage))),
    }).subscribe({
      next: (result) => {
        this.config.set(result.config);
        this.requests.set(result.requests.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  filteredRequests(): InteracPaymentRequestDto[] {
    const filter = this.activeFilter();
    if (filter === 'all') {
      return this.requests();
    }
    return this.requests().filter((r) => r.status === filter);
  }

  onFilterChange(value: string): void {
    this.activeFilter.set(value);
  }

  statusVariant(status: InteracRequestStatus | string): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Expired':
      case 'Cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  }

  onNewRequest(): void {
    // Will open a dialog or navigate to creation form
  }

  onViewRequest(request: InteracPaymentRequestDto): void {
    // Will navigate to request detail or open dialog
  }

  onCancelRequest(request: InteracPaymentRequestDto): void {
    this.interacService.cancelRequest(request.id).subscribe(() => {
      this.load();
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
