import { Component, inject, signal, output, OnInit } from '@angular/core';
import { InvoicesService, InvoiceDto, InvoiceStatus, PagedList } from 'api';
import {
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  PillTabBarComponent,
  PillTabItem,
  TableHeaderRowComponent,
  TableDataRowComponent,
  EmptyStateComponent,
} from 'components';

@Component({
  selector: 'lib-invoice-list-page',
  standalone: true,
  imports: [
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    PillTabBarComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Invoices</h1>
        <lib-button variant="primary" (clicked)="createInvoice.emit()">+ Create Invoice</lib-button>
      </div>

      <lib-pill-tab-bar
        [tabs]="tabs"
        [activeTab]="activeTab()"
        (tabChange)="onTabChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (invoices().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No invoices found"
            description="Create an invoice to get started."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-number">Invoice #</span>
            <span class="col-title">Title</span>
            <span class="col-contact">Contact</span>
            <span class="col-status">Status</span>
            <span class="col-total">Total</span>
            <span class="col-due">Due Date</span>
          </lib-table-header-row>

          @for (invoice of invoices(); track invoice.id) {
            <lib-table-data-row>
              <span class="col-number">{{ invoice.invoiceNumber }}</span>
              <span class="col-title">{{ invoice.title }}</span>
              <span class="col-contact">{{ invoice.contactName || '—' }}</span>
              <span class="col-status">
                <lib-badge [variant]="getStatusBadgeVariant(invoice.status)">{{ formatStatus(invoice.status) }}</lib-badge>
              </span>
              <span class="col-total">{{ formatCurrency(invoice.totalCents) }}</span>
              <span class="col-due">{{ invoice.dueDate ? formatDate(invoice.dueDate) : '—' }}</span>
            </lib-table-data-row>
          }
        </div>

        <div class="pagination">
          <span class="pagination-info">Showing {{ invoices().length }} of {{ totalCount() }}</span>
          <div class="pagination-buttons">
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
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

    .col-number { flex: 1; }
    .col-title { flex: 2; }
    .col-contact { flex: 1.5; }
    .col-status { flex: 1; }
    .col-total { flex: 1; }
    .col-due { flex: 1.5; }

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
export class InvoiceListPageComponent implements OnInit {
  private readonly invoicesService = inject(InvoicesService);

  readonly invoices = signal<InvoiceDto[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal('All');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly createInvoice = output<void>();

  readonly tabs: PillTabItem[] = [
    { label: 'All', icon: 'list', value: 'All' },
    { label: 'Draft', icon: 'file-edit', value: InvoiceStatus.Draft },
    { label: 'Sent', icon: 'send', value: InvoiceStatus.Sent },
    { label: 'Paid', icon: 'check-circle', value: InvoiceStatus.Paid },
    { label: 'Overdue', icon: 'alert-circle', value: InvoiceStatus.Overdue },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const tab = this.activeTab();
    const status = tab === 'All' ? undefined : (tab as InvoiceStatus);
    this.invoicesService.list({ status, page: this.currentPage(), pageSize: 10 }).subscribe({
      next: (result: PagedList<InvoiceDto>) => {
        this.invoices.set(result.items);
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

  getStatusBadgeVariant(status: InvoiceStatus): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case InvoiceStatus.Draft: return 'neutral';
      case InvoiceStatus.Sent: return 'warning';
      case InvoiceStatus.Viewed: return 'warning';
      case InvoiceStatus.PartiallyPaid: return 'warning';
      case InvoiceStatus.Paid: return 'success';
      case InvoiceStatus.Overdue: return 'error';
      case InvoiceStatus.Cancelled: return 'error';
      case InvoiceStatus.Refunded: return 'neutral';
      default: return 'neutral';
    }
  }

  formatStatus(status: InvoiceStatus): string {
    if (status === InvoiceStatus.PartiallyPaid) return 'Partially Paid';
    return status;
  }

  formatCurrency(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
