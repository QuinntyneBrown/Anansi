import { Component, inject, signal, output, OnInit } from '@angular/core';
import {
  NotificationsService,
  NotificationDto,
  NotificationCategory,
  NotificationListParams,
} from 'api';
import { PillTabBarComponent } from 'components';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'lib-notification-panel',
  standalone: true,
  imports: [PillTabBarComponent],
  template: `
    <div class="panel">
      <div class="panel__header">
        <h2 class="panel__title">Notifications</h2>
        <button
          class="panel__mark-all"
          (click)="markAllRead()"
          [disabled]="unreadCount() === 0"
        >
          Mark all read
        </button>
      </div>

      <lib-pill-tab-bar
        [tabs]="tabs"
        [activeTab]="activeTab()"
        (tabChange)="onTabChange($event)"
      />

      @if (loading()) {
        <div class="panel__loading">
          <span class="panel__loading-text">Loading...</span>
        </div>
      } @else {
        <div class="panel__list">
          @for (notification of notifications(); track notification.id) {
            <button
              class="panel__item"
              (click)="markAsRead(notification.id)"
            >
              <div class="panel__item-left">
                @if (!notification.isRead) {
                  <span class="panel__dot"></span>
                }
                @if (notification.isRead) {
                  <span class="panel__dot-placeholder"></span>
                }
                <div class="panel__item-content">
                  <span
                    class="panel__item-title"
                    [class.panel__item-title--unread]="!notification.isRead"
                  >
                    {{ notification.title }}
                  </span>
                  <span class="panel__item-message">{{ notification.message }}</span>
                </div>
              </div>
              <span class="panel__item-time">{{ relativeTime(notification.createdAt) }}</span>
            </button>
          }
        </div>
      }

      <button class="panel__view-all" (click)="viewAll.emit()">
        View all notifications
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .panel {
      background: #242426;
      border-radius: 20px;
      overflow: hidden;
    }

    .panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 12px 20px;
    }

    .panel__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .panel__mark-all {
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #C9A962;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .panel__mark-all:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .panel__loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .panel__loading-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .panel__list {
      display: flex;
      flex-direction: column;
    }

    .panel__item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 14px 20px;
      border-top: 1px solid #2A2A2C;
      background: none;
      border-left: none;
      border-right: none;
      border-bottom: none;
      cursor: pointer;
      text-align: left;
      width: 100%;
    }

    .panel__item:hover {
      background: #2A2A2C;
    }

    .panel__item-left {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .panel__dot {
      width: 8px;
      height: 8px;
      min-width: 8px;
      border-radius: 50%;
      background: #C9A962;
      margin-top: 5px;
    }

    .panel__dot-placeholder {
      width: 8px;
      min-width: 8px;
    }

    .panel__item-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .panel__item-title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #F5F5F0;
    }

    .panel__item-title--unread {
      font-weight: 600;
    }

    .panel__item-message {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .panel__item-time {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      white-space: nowrap;
      margin-left: 12px;
      margin-top: 2px;
    }

    .panel__view-all {
      display: block;
      width: 100%;
      padding: 16px 20px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #C9A962;
      background: none;
      border: none;
      border-top: 1px solid #2A2A2C;
      cursor: pointer;
      text-align: center;
    }

    .panel__view-all:hover {
      background: #2A2A2C;
    }
  `,
})
export class NotificationPanelComponent implements OnInit {
  private readonly service = inject(NotificationsService);

  readonly notifications = signal<NotificationDto[]>([]);
  readonly unreadCount = signal(0);
  readonly activeTab = signal('all');
  readonly loading = signal(true);

  readonly viewAll = output<void>();

  readonly tabs = [
    { label: 'All', icon: 'bell', value: 'all' },
    { label: 'Gallery', icon: 'image', value: 'gallery' },
    { label: 'Store', icon: 'shopping-bag', value: 'store' },
    { label: 'Studio', icon: 'briefcase', value: 'studio' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const params = this.buildParams();
    forkJoin({
      list: this.service.list(params),
      count: this.service.getUnreadCount(),
    }).subscribe({
      next: ({ list, count }) => {
        this.notifications.set(list.items);
        this.unreadCount.set(count.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
    this.loading.set(true);
    const params = this.buildParams();
    this.service.list(params).subscribe({
      next: (r) => {
        this.notifications.set(r.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markAllRead(): void {
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => ({ ...n, isRead: true })),
        );
        this.unreadCount.set(0);
      },
    });
  }

  markAsRead(id: string): void {
    const notification = this.notifications().find((n) => n.id === id);
    if (!notification || notification.isRead) {
      return;
    }
    this.service.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        this.unreadCount.update((c) => Math.max(0, c - 1));
      },
    });
  }

  relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;

    if (diffMs < 0) {
      return 'just now';
    }

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) {
      return 'just now';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days}d ago`;
    }

    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  private buildParams(): NotificationListParams {
    const categoryMap: Record<string, NotificationCategory | undefined> = {
      all: undefined,
      gallery: NotificationCategory.ClientGallery,
      store: NotificationCategory.Store,
      studio: NotificationCategory.StudioManager,
    };
    const category = categoryMap[this.activeTab()];
    return category != null ? { category } : {};
  }
}
