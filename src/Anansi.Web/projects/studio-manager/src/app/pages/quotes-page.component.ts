import { Component, inject, signal, OnInit } from '@angular/core';
import {
  CreateQuoteCommand,
  PagedList,
  QuoteDto,
  QuoteStatus,
  QuotesService,
} from 'api';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  InputGroupComponent,
  PillTabBarComponent,
  SpinnerComponent,
  TableDataRowComponent,
  TableHeaderRowComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

type QuoteFilter = 'All' | 'Draft' | 'Sent' | 'Accepted';

@Component({
  selector: 'sm-quotes-page',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    FormsModule,
    InputGroupComponent,
    PillTabBarComponent,
    SpinnerComponent,
    TableDataRowComponent,
    TableHeaderRowComponent,
  ],
  template: `
    <div class="page">
      <div class="page__header">
        <div>
          <h1 class="page__title">Quotes</h1>
          <p class="page__subtitle">Create proposals quickly and keep accepted work moving toward invoices.</p>
        </div>
        <lib-button variant="primary" (clicked)="toggleCreateForm()">
          {{ showCreateForm() ? 'Close' : '+ New Quote' }}
        </lib-button>
      </div>

      @if (showCreateForm()) {
        <div class="create-form">
          <lib-card>
            <div card-header class="card-title">Create Quote</div>
            <div class="form-grid">
              <lib-input-group
                label="Title"
                placeholder="Wedding Collection Proposal"
                [(ngModel)]="newTitle"
              />
              <lib-input-group
                label="Line Item"
                placeholder="8-hour coverage"
                [(ngModel)]="newItemName"
              />
              <div class="inline-fields">
                <label class="field">
                  <span>Quantity</span>
                  <input type="number" min="1" [(ngModel)]="newQuantity" />
                </label>
                <label class="field">
                  <span>Unit Price</span>
                  <input type="number" min="0" step="0.01" [(ngModel)]="newPrice" />
                </label>
              </div>
              <div class="checkbox-field">
                <input id="quote-template" type="checkbox" [(ngModel)]="newIsTemplate" />
                <label for="quote-template">Save as reusable template</label>
              </div>
            </div>
            <div class="form-actions">
              <lib-button variant="outline" (clicked)="cancelCreate()">Cancel</lib-button>
              <lib-button variant="primary" (clicked)="submitCreate()">Create Quote</lib-button>
            </div>
          </lib-card>
        </div>
      }

      <div class="toolbar">
        <input
          class="search-input"
          type="text"
          placeholder="Search quotes..."
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearchChange($event)"
        />
      </div>

      <lib-pill-tab-bar
        [tabs]="statusTabs"
        [activeTab]="activeFilter()"
        (tabChange)="onFilterChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (quotes().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No quotes found"
            description="Create a quote to start sending proposals to clients."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-title">Title</span>
            <span class="col-status">Status</span>
            <span class="col-total">Total</span>
            <span class="col-items">Items</span>
            <span class="col-created">Created</span>
          </lib-table-header-row>

          @for (quote of quotes(); track quote.id) {
            <lib-table-data-row>
              <span class="col-title title-text">{{ quote.title }}</span>
              <span class="col-status">
                <lib-badge [variant]="getStatusBadgeVariant(quote.status)">
                  {{ getStatusLabel(quote.status) }}
                </lib-badge>
              </span>
              <span class="col-total">{{ formatCents(quote.totalCents) }}</span>
              <span class="col-items">{{ quote.items.length }}</span>
              <span class="col-created">{{ formatDate(quote.createdAt) }}</span>
            </lib-table-data-row>
          }
        </div>
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

    .create-form {
      margin-bottom: 24px;
    }

    .card-title {
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      gap: 16px;
      padding: 16px;
    }

    .inline-fields {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .field {
      color: #6E6E70;
      display: flex;
      flex-direction: column;
      font-family: Inter, sans-serif;
      font-size: 13px;
      gap: 8px;
    }

    .field input {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      color: #F5F5F0;
      padding: 12px 16px;
    }

    .checkbox-field {
      align-items: center;
      color: #F5F5F0;
      display: flex;
      gap: 10px;
      font-family: Inter, sans-serif;
      font-size: 13px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 0 16px 16px;
    }

    .toolbar {
      margin-bottom: 16px;
    }

    .search-input {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      padding: 12px 16px;
      width: min(360px, 100%);
    }

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .table-container {
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      margin-top: 24px;
      overflow: hidden;
    }

    .col-title { flex: 2; }
    .col-status { flex: 1; }
    .col-total { flex: 1; }
    .col-items { flex: 0.8; }
    .col-created { flex: 1.2; }

    .title-text {
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-weight: 500;
    }
  `,
})
export class QuotesPageComponent implements OnInit {
  private readonly quotesService = inject(QuotesService);

  readonly quotes = signal<QuoteDto[]>([]);
  readonly loading = signal(true);
  readonly showCreateForm = signal(false);
  readonly activeFilter = signal<QuoteFilter>('All');
  readonly searchQuery = signal('');

  newTitle = '';
  newItemName = '';
  newQuantity = 1;
  newPrice = 0;
  newIsTemplate = false;

  readonly statusTabs = [
    { label: 'All', icon: 'layers', value: 'All' },
    { label: 'Draft', icon: 'file-edit', value: 'Draft' },
    { label: 'Sent', icon: 'send', value: 'Sent' },
    { label: 'Accepted', icon: 'check-circle', value: 'Accepted' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.quotesService.list({
      status: this.getStatusFilter(),
      search: this.searchQuery() || undefined,
      page: 1,
      pageSize: 10,
    }).subscribe({
      next: (result: PagedList<QuoteDto>) => {
        this.quotes.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.resetForm();
  }

  onFilterChange(value: string): void {
    this.activeFilter.set(value as QuoteFilter);
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.load();
  }

  submitCreate(): void {
    const title = this.newTitle.trim();
    const itemName = this.newItemName.trim();
    if (!title || !itemName || this.newQuantity < 1 || this.newPrice < 0) {
      return;
    }

    const command: CreateQuoteCommand = {
      title,
      isTemplate: this.newIsTemplate,
      templateName: this.newIsTemplate ? title : undefined,
      items: [
        {
          name: itemName,
          quantity: this.newQuantity,
          unitPriceCents: Math.round(this.newPrice * 100),
          sortOrder: 0,
        },
      ],
    };

    this.quotesService.create(command).subscribe({
      next: (quote) => {
        this.quotes.set([quote, ...this.quotes()]);
        this.showCreateForm.set(false);
        this.resetForm();
      },
    });
  }

  getStatusLabel(status: QuoteStatus): string {
    return QuoteStatus[status] ?? 'Unknown';
  }

  getStatusBadgeVariant(
    status: QuoteStatus,
  ): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case QuoteStatus.Accepted:
        return 'success';
      case QuoteStatus.Sent:
      case QuoteStatus.Viewed:
        return 'warning';
      default:
        return 'neutral';
    }
  }

  formatCents(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private getStatusFilter(): QuoteStatus | undefined {
    switch (this.activeFilter()) {
      case 'Draft':
        return QuoteStatus.Draft;
      case 'Sent':
        return QuoteStatus.Sent;
      case 'Accepted':
        return QuoteStatus.Accepted;
      default:
        return undefined;
    }
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newItemName = '';
    this.newQuantity = 1;
    this.newPrice = 0;
    this.newIsTemplate = false;
  }
}
