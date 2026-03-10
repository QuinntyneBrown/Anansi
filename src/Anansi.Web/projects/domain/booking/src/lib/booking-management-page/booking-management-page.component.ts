import { Component, inject, signal, OnInit } from '@angular/core';
import {
  BookingsService,
  BookingRecordDto,
  BookingStatus,
  BookingListParams,
  PagedList,
} from 'api';
import {
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  InputGroupComponent,
  PillTabBarComponent,
  PillTabItem,
  TableHeaderRowComponent,
  TableDataRowComponent,
  EmptyStateComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-booking-management-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    InputGroupComponent,
    PillTabBarComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Bookings</h1>
      </div>

      <div class="filters-section">
        <lib-pill-tab-bar
          [tabs]="tabs"
          [activeTab]="activeTab()"
          (tabChange)="onTabChange($event)"
        />
        <div class="date-filters">
          <lib-input-group
            label="From"
            type="text"
            placeholder="YYYY-MM-DD"
            [(ngModel)]="fromDate"
            name="fromDate"
          />
          <lib-input-group
            label="To"
            type="text"
            placeholder="YYYY-MM-DD"
            [(ngModel)]="toDate"
            name="toDate"
          />
          <lib-button variant="secondary" (clicked)="applyDateFilter()">Filter</lib-button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (bookings().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No Bookings"
            description="No bookings match the current filters."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-client">Client</span>
            <span class="col-session">Session Type</span>
            <span class="col-date">Date & Time</span>
            <span class="col-status">Status</span>
            <span class="col-actions">Actions</span>
          </lib-table-header-row>

          @for (booking of bookings(); track booking.id) {
            <lib-table-data-row>
              <span class="col-client">{{ booking.clientFirstName }} {{ booking.clientLastName }}</span>
              <span class="col-session">{{ booking.sessionTypeName }}</span>
              <span class="col-date">{{ formatDateTime(booking.startTime) }}</span>
              <span class="col-status">
                <lib-badge [variant]="getBadgeVariant(booking.status)">{{ booking.status }}</lib-badge>
              </span>
              <span class="col-actions">
                @if (booking.status === BookingStatus.Pending) {
                  <lib-button variant="primary" (clicked)="onConfirm(booking)">Confirm</lib-button>
                }
              </span>
            </lib-table-data-row>
          }
        </div>

        <div class="pagination">
          <span class="pagination-info">Showing {{ bookings().length }} of {{ totalCount() }}</span>
          <div class="pagination-buttons">
            <button class="page-btn" [disabled]="currentPage() <= 1" (click)="onPreviousPage()">Previous</button>
            <button class="page-btn" [disabled]="currentPage() >= totalPages()" (click)="onNextPage()">Next</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .page {
      background: #1A1A1C;
      min-height: 100vh;
    }

    .page-header {
      padding: 24px 24px 0;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .filters-section {
      padding: 16px 0;
    }

    .date-filters {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      padding: 0 24px;
    }

    .date-filters lib-input-group {
      flex: 1;
      max-width: 200px;
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
    }

    .col-client { flex: 2; }
    .col-session { flex: 2; }
    .col-date { flex: 2; }
    .col-status { flex: 1; }
    .col-actions { flex: 1; }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }

    .pagination-info {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .pagination-buttons {
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
export class BookingManagementPageComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);

  readonly bookings = signal<BookingRecordDto[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal('All');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly BookingStatus = BookingStatus;

  fromDate = '';
  toDate = '';

  readonly tabs: PillTabItem[] = [
    { label: 'All', icon: 'list', value: 'All' },
    { label: 'Pending', icon: 'clock', value: BookingStatus.Pending },
    { label: 'Confirmed', icon: 'check-circle', value: BookingStatus.Confirmed },
    { label: 'Completed', icon: 'check-square', value: BookingStatus.Completed },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const tab = this.activeTab();
    const params: BookingListParams = {
      status: tab === 'All' ? undefined : (tab as BookingStatus),
      from: this.fromDate || undefined,
      to: this.toDate || undefined,
      page: this.currentPage(),
      pageSize: 10,
    };
    this.bookingsService.list(params).subscribe({
      next: (result: PagedList<BookingRecordDto>) => {
        this.bookings.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.load();
  }

  applyDateFilter(): void {
    this.currentPage.set(1);
    this.load();
  }

  onConfirm(booking: BookingRecordDto): void {
    this.bookingsService.confirm(booking.id, { id: booking.id }).subscribe({
      next: () => this.load(),
      error: () => {
        // Reload to ensure UI is consistent even on error
        this.load();
      },
    });
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

  getBadgeVariant(status: BookingStatus): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case BookingStatus.Confirmed:
        return 'success';
      case BookingStatus.Pending:
        return 'warning';
      case BookingStatus.Cancelled:
      case BookingStatus.Declined:
      case BookingStatus.NoShow:
        return 'error';
      case BookingStatus.Completed:
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
