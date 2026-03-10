import { Component, inject, signal, output, OnInit } from '@angular/core';
import { OrdersService, OrderDto, OrderStatus, PagedList } from 'api';
import {
  BadgeComponent,
  SpinnerComponent,
  PillTabBarComponent,
  TableHeaderRowComponent,
  TableDataRowComponent,
  EmptyStateComponent,
} from 'components';

type StatusFilter = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered';

@Component({
  selector: 'lib-order-management-page',
  standalone: true,
  imports: [
    BadgeComponent,
    SpinnerComponent,
    PillTabBarComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Orders</h1>
        <div class="page__search">
          <input
            class="search-input"
            type="text"
            placeholder="Search by client name..."
            [value]="searchQuery()"
            (input)="onSearch($event)"
          />
        </div>
      </div>

      <lib-pill-tab-bar
        [tabs]="statusTabs"
        [activeTab]="activeStatus()"
        (tabChange)="onStatusChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No orders found"
            description="Orders will appear here once clients make purchases."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-id">Order ID</span>
            <span class="col-client">Client</span>
            <span class="col-status">Status</span>
            <span class="col-total">Total</span>
            <span class="col-items">Items</span>
            <span class="col-date">Date</span>
          </lib-table-header-row>

          @for (order of orders(); track order.id) {
            <lib-table-data-row
              class="clickable-row"
              (click)="orderSelected.emit(order)"
              (keydown.enter)="orderSelected.emit(order)"
              tabindex="0"
            >
              <span class="col-id order-id">{{ truncateId(order.id) }}</span>
              <span class="col-client">{{ order.clientName }}</span>
              <span class="col-status">
                <lib-badge [variant]="getStatusBadgeVariant(order.status)">{{ order.status }}</lib-badge>
              </span>
              <span class="col-total">{{ formatCents(order.totalCents) }}</span>
              <span class="col-items">{{ order.items.length }}</span>
              <span class="col-date">{{ formatDate(order.createdAt) }}</span>
            </lib-table-data-row>
          }
        </div>

        <div class="pagination">
          <span class="pagination__info">Showing {{ orders().length }} of {{ totalCount() }}</span>
          <div class="pagination__buttons">
            <button class="page-btn" [disabled]="currentPage() <= 1" (click)="onPreviousPage()">Previous</button>
            <button class="page-btn" [disabled]="currentPage() >= totalPages()" (click)="onNextPage()">Next</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
    }

    .page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    .page__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .search-input {
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      width: 240px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .search-input::placeholder {
      color: #6E6E70;
    }

    .search-input:focus {
      border-color: #C9A962;
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

    .table-container {
      margin: 0 24px;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
      margin-top: 24px;
    }

    .col-id { flex: 1.2; }
    .col-client { flex: 2; }
    .col-status { flex: 1.2; }
    .col-total { flex: 1; }
    .col-items { flex: 0.8; }
    .col-date { flex: 1.5; }

    .order-id {
      font-family: monospace;
      font-size: 13px;
      color: #C9A962;
    }

    .clickable-row {
      cursor: pointer;
    }

    .clickable-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }

    .pagination__info {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .pagination__buttons {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: #2A2A2C;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class OrderManagementPageComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<OrderDto[]>([]);
  readonly loading = signal(true);
  readonly activeStatus = signal<string>('All');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly orderSelected = output<OrderDto>();

  readonly statusTabs = [
    { label: 'All', icon: 'layers', value: 'All' },
    { label: 'Pending', icon: 'clock', value: 'Pending' },
    { label: 'Processing', icon: 'loader', value: 'Processing' },
    { label: 'Shipped', icon: 'truck', value: 'Shipped' },
    { label: 'Delivered', icon: 'check-circle', value: 'Delivered' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const tab = this.activeStatus();
    const status =
      tab === 'All' ? undefined : (tab as OrderStatus);
    const search = this.searchQuery() || undefined;
    this.ordersService
      .list({ status, search, page: this.currentPage(), pageSize: 10 })
      .subscribe({
        next: (result: PagedList<OrderDto>) => {
          this.orders.set(result.items);
          this.totalPages.set(result.totalPages);
          this.totalCount.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onStatusChange(status: string): void {
    this.activeStatus.set(status);
    this.currentPage.set(1);
    this.load();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.load();
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.load();
    }
  }

  onNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.load();
    }
  }

  truncateId(id: string): string {
    return id.length > 8 ? id.substring(0, 8) + '...' : id;
  }

  getStatusBadgeVariant(
    status: OrderStatus,
  ): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case OrderStatus.Pending:
        return 'warning';
      case OrderStatus.Processing:
        return 'warning';
      case OrderStatus.Shipped:
        return 'neutral';
      case OrderStatus.Delivered:
        return 'success';
      case OrderStatus.Cancelled:
        return 'error';
      case OrderStatus.Refunded:
        return 'error';
    }
  }

  formatCents(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
