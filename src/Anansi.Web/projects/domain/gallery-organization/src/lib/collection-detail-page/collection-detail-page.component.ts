import { Component, inject, signal, input, OnInit } from '@angular/core';
import {
  CollectionsService,
  CollectionDto,
  CollectionStatus,
  GalleryActivityDto,
  PagedList,
} from 'api';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  CardComponent,
  BadgeComponent,
  TabBarComponent,
  TabItem,
  SpinnerComponent,
  EmptyStateComponent,
} from 'components';

@Component({
  selector: 'lib-collection-detail-page',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CardComponent,
    BadgeComponent,
    TabBarComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="32" />
      </div>
    } @else if (collection(); as c) {
      <div class="page">
        <div class="breadcrumb-bar">
          <lib-breadcrumb [items]="getBreadcrumbs(c)" />
        </div>

        <div class="detail-header">
          <div class="title-row">
            <h1 class="collection-title">{{ c.title }}</h1>
            <lib-badge [variant]="getStatusBadgeVariant(c.status)">{{ c.status }}</lib-badge>
          </div>
          @if (c.description) {
            <p class="collection-description">{{ c.description }}</p>
          }
        </div>

        <div class="content-layout">
          <div class="main-content">
            <div class="tab-section">
              <lib-tab-bar [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)" />
            </div>
            <div class="tab-content">
              @switch (activeTab()) {
                @case ('media') {
                  <div class="media-grid-placeholder">
                    @if (c.mediaCount === 0) {
                      <lib-empty-state heading="No media" description="Upload media to this collection to see it here." />
                    } @else {
                      <div class="media-count-info">{{ c.mediaCount }} media items in this collection</div>
                    }
                  </div>
                }
                @case ('settings') {
                  <div class="settings-cards">
                    <lib-card>
                      <div card-header class="card-title">General</div>
                      <div class="info-list">
                        <div class="info-row">
                          <span class="info-label">Slug</span>
                          <span class="info-value">{{ c.slug }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Theme</span>
                          <span class="info-value">{{ c.theme }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Layout</span>
                          <span class="info-value">{{ c.layout }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Font Family</span>
                          <span class="info-value">{{ c.fontFamily }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Color Palette</span>
                          <span class="info-value">{{ c.colorPalette }}</span>
                        </div>
                      </div>
                    </lib-card>

                    <lib-card>
                      <div card-header class="card-title">Downloads</div>
                      <div class="info-list">
                        <div class="info-row">
                          <span class="info-label">Downloads Enabled</span>
                          <span class="info-value">{{ c.downloadsEnabled ? 'Yes' : 'No' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Download Count</span>
                          <span class="info-value">{{ c.downloadCount }}</span>
                        </div>
                      </div>
                    </lib-card>
                  </div>
                }
                @case ('activity') {
                  @if (activitiesLoading()) {
                    <div class="loading-container">
                      <lib-spinner [size]="24" />
                    </div>
                  } @else if (activities().length === 0) {
                    <lib-empty-state heading="No activity" description="No activity has been recorded for this collection yet." />
                  } @else {
                    <div class="activity-list">
                      @for (activity of activities(); track activity.id) {
                        <div class="activity-item">
                          <div class="activity-type">
                            <lib-badge [variant]="getActivityBadgeVariant(activity.activityType)">{{ activity.activityType }}</lib-badge>
                          </div>
                          <div class="activity-details">
                            @if (activity.actorName) {
                              <span class="activity-actor">{{ activity.actorName }}</span>
                            }
                            @if (activity.details) {
                              <span class="activity-detail-text">{{ activity.details }}</span>
                            }
                          </div>
                          <div class="activity-date">{{ formatDate(activity.createdAt) }}</div>
                        </div>
                      }
                    </div>
                  }
                }
              }
            </div>
          </div>

          <div class="sidebar">
            <lib-card>
              <div card-header class="card-title">Collection Info</div>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">Media</span>
                  <span class="info-value">{{ c.mediaCount }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Sets</span>
                  <span class="info-value">{{ c.setCount }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ formatDate(c.createdAt) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Updated</span>
                  <span class="info-value">{{ formatDate(c.updatedAt) }}</span>
                </div>
              </div>
            </lib-card>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 24px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .breadcrumb-bar {
      margin-bottom: 24px;
    }

    .detail-header {
      margin-bottom: 32px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .collection-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .collection-description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0;
    }

    .content-layout {
      display: flex;
      gap: 24px;
    }

    .main-content {
      flex: 2;
    }

    .sidebar {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tab-section {
      border-bottom: 1px solid #2A2A2C;
      margin-bottom: 24px;
    }

    .tab-content {
      min-height: 200px;
    }

    .card-title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .info-value {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
    }

    .media-grid-placeholder {
      display: flex;
      justify-content: center;
      padding: 32px 0;
    }

    .media-count-info {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      text-align: center;
    }

    .settings-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
    }

    .activity-type {
      flex-shrink: 0;
    }

    .activity-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .activity-actor {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .activity-detail-text {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .activity-date {
      flex-shrink: 0;
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }
  `,
})
export class CollectionDetailPageComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);

  readonly collectionId = input.required<string>();
  readonly collection = signal<CollectionDto | null>(null);
  readonly loading = signal(true);
  readonly activeTab = signal('media');

  readonly activities = signal<GalleryActivityDto[]>([]);
  readonly activitiesLoading = signal(false);

  readonly tabs: TabItem[] = [
    { label: 'Media', value: 'media' },
    { label: 'Settings', value: 'settings' },
    { label: 'Activity', value: 'activity' },
  ];

  ngOnInit(): void {
    this.loadCollection();
  }

  loadCollection(): void {
    this.loading.set(true);
    this.collectionsService.get(this.collectionId()).subscribe({
      next: (collection: CollectionDto) => {
        this.collection.set(collection);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
    if (tab === 'activity' && this.activities().length === 0) {
      this.loadActivities();
    }
  }

  loadActivities(): void {
    this.activitiesLoading.set(true);
    this.collectionsService
      .getActivities(this.collectionId())
      .subscribe({
        next: (result: PagedList<GalleryActivityDto>) => {
          this.activities.set(result.items);
          this.activitiesLoading.set(false);
        },
        error: () => this.activitiesLoading.set(false),
      });
  }

  getBreadcrumbs(collection: CollectionDto): BreadcrumbItem[] {
    return [
      { label: 'Collections', href: '/galleries' },
      { label: collection.title },
    ];
  }

  getStatusBadgeVariant(
    status: CollectionStatus,
  ): 'success' | 'warning' | 'error' | 'neutral' {
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

  getActivityBadgeVariant(
    activityType: string,
  ): 'success' | 'warning' | 'error' | 'neutral' {
    switch (activityType) {
      case 'Download':
        return 'success';
      case 'Favorite':
        return 'warning';
      case 'View':
        return 'neutral';
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
