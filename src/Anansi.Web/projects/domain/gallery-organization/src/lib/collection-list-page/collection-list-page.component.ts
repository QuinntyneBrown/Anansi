import { Component, inject, signal, output, OnInit } from '@angular/core';
import {
  CollectionsService,
  CollectionSummaryDto,
  CollectionStatus,
  PagedList,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  PillTabBarComponent,
  PillTabItem,
  EmptyStateComponent,
} from 'components';

@Component({
  selector: 'lib-collection-list-page',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    PillTabBarComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Collections</h1>
        <div class="header-actions">
          <input
            class="search-input"
            type="text"
            placeholder="Search collections..."
            [value]="searchQuery()"
            (input)="onSearch($event)"
          />
          <lib-button variant="primary" (clicked)="createCollection.emit()">+ Create Collection</lib-button>
        </div>
      </div>

      <div class="filter-section">
        <lib-pill-tab-bar [tabs]="statusTabs" [activeTab]="activeStatus()" (tabChange)="onStatusChange($event)" />
      </div>

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else {
        @if (collections().length === 0) {
          <div class="empty-container">
            <lib-empty-state heading="No collections found" description="Create a new collection to get started." />
          </div>
        } @else {
          <div class="grid">
            @for (collection of collections(); track collection.id) {
              <lib-card>
                <div card-header class="card-header-row">
                  <div class="card-title-row">
                    <span class="collection-title">{{ collection.title }}</span>
                    <lib-badge [variant]="getStatusBadgeVariant(collection.status)">{{ collection.status }}</lib-badge>
                  </div>
                  <button
                    class="star-btn"
                    [class.starred]="collection.isStarred"
                    (click)="onToggleStar(collection)"
                    [attr.aria-label]="collection.isStarred ? 'Unstar collection' : 'Star collection'"
                  >{{ collection.isStarred ? '\u2605' : '\u2606' }}</button>
                </div>
                <div class="card-body">
                  <div class="card-stats">
                    <span class="stat"><span class="stat-value">{{ collection.mediaCount }}</span> media</span>
                    <span class="stat"><span class="stat-value">{{ collection.setCount }}</span> sets</span>
                  </div>
                  <div class="card-date">{{ formatDate(collection.createdAt) }}</div>
                </div>
              </lib-card>
            }
          </div>

          <div class="pagination">
            <span class="pagination-info">Showing {{ collections().length }} of {{ totalCount() }}</span>
            <div class="pagination-buttons">
              <button class="page-btn" [disabled]="currentPage() <= 1" (click)="onPreviousPage()">Previous</button>
              <button class="page-btn" [disabled]="currentPage() >= totalPages()" (click)="onNextPage()">Next</button>
            </div>
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
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

    .filter-section {
      margin-bottom: 24px;
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

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .collection-title {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      color: #6E6E70;
      padding: 0;
      line-height: 1;
      transition: color 0.15s ease;
    }

    .star-btn.starred {
      color: #C9A962;
    }

    .star-btn:hover {
      color: #C9A962;
    }

    .card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-stats {
      display: flex;
      gap: 16px;
    }

    .stat {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .stat-value {
      color: #F5F5F0;
      font-weight: 500;
    }

    .card-date {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      margin-top: 16px;
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
export class CollectionListPageComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);

  readonly collections = signal<CollectionSummaryDto[]>([]);
  readonly loading = signal(true);
  readonly activeStatus = signal('All');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly createCollection = output<void>();

  readonly statusTabs: PillTabItem[] = [
    { label: 'All', value: 'All', icon: 'layout-grid' },
    { label: 'Draft', value: CollectionStatus.Draft, icon: 'file-edit' },
    { label: 'Published', value: CollectionStatus.Published, icon: 'globe' },
    { label: 'Hidden', value: CollectionStatus.Hidden, icon: 'eye-off' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const tab = this.activeStatus();
    const status = tab === 'All' ? undefined : (tab as CollectionStatus);
    const search = this.searchQuery() || undefined;
    this.collectionsService
      .list({ status, search, page: this.currentPage(), pageSize: 12 })
      .subscribe({
        next: (result: PagedList<CollectionSummaryDto>) => {
          this.collections.set(result.items);
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

  onToggleStar(collection: CollectionSummaryDto): void {
    this.collectionsService.toggleStar(collection.id).subscribe({
      next: () => {
        this.collections.update((items) =>
          items.map((c) =>
            c.id === collection.id ? { ...c, isStarred: !c.isStarred } : c,
          ),
        );
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

  getStatusBadgeVariant(status: CollectionStatus): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case CollectionStatus.Published:
        return 'success';
      case CollectionStatus.Draft:
        return 'warning';
      case CollectionStatus.Hidden:
        return 'neutral';
      case CollectionStatus.Expired:
        return 'error';
      default:
        return 'neutral';
    }
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
