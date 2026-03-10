import { Component, inject, signal, output, OnInit } from '@angular/core';
import { ContractsService, ContractDto, ContractStatus, PagedList } from 'api';
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
  selector: 'lib-contract-list-page',
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
        <h1 class="page-title">Contracts</h1>
        <lib-button variant="primary" (clicked)="createContract.emit()">+ Create Contract</lib-button>
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
      } @else if (contracts().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No contracts found"
            description="Create a contract to get started."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-title">Title</span>
            <span class="col-contact">Contact</span>
            <span class="col-status">Status</span>
            <span class="col-created">Created</span>
          </lib-table-header-row>

          @for (contract of contracts(); track contract.id) {
            <lib-table-data-row>
              <span class="col-title">{{ contract.title }}</span>
              <span class="col-contact">{{ contract.contactName || '—' }}</span>
              <span class="col-status">
                <lib-badge [variant]="getStatusBadgeVariant(contract.status)">{{ contract.status }}</lib-badge>
              </span>
              <span class="col-created">{{ formatDate(contract.createdAt) }}</span>
            </lib-table-data-row>
          }
        </div>

        <div class="pagination">
          <span class="pagination-info">Showing {{ contracts().length }} of {{ totalCount() }}</span>
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

    .col-title { flex: 2; }
    .col-contact { flex: 2; }
    .col-status { flex: 1; }
    .col-created { flex: 1.5; }

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
export class ContractListPageComponent implements OnInit {
  private readonly contractsService = inject(ContractsService);

  readonly contracts = signal<ContractDto[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal('Contracts');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly createContract = output<void>();

  readonly tabs: PillTabItem[] = [
    { label: 'Contracts', icon: 'file-text', value: 'Contracts' },
    { label: 'Templates', icon: 'layout-template', value: 'Templates' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const isTemplate = this.activeTab() === 'Templates' ? true : false;
    this.contractsService.list({ isTemplate, page: this.currentPage(), pageSize: 10 }).subscribe({
      next: (result: PagedList<ContractDto>) => {
        this.contracts.set(result.items);
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

  getStatusBadgeVariant(status: ContractStatus): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case ContractStatus.Draft: return 'neutral';
      case ContractStatus.Sent: return 'warning';
      case ContractStatus.Viewed: return 'warning';
      case ContractStatus.Signed: return 'success';
      case ContractStatus.Expired: return 'error';
      case ContractStatus.Cancelled: return 'error';
      default: return 'neutral';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
