import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { NotificationsService, UnreadCountResponse } from 'api';
import { SidebarItemComponent } from 'components';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'sm-sidebar',
  standalone: true,
  imports: [SidebarItemComponent],
  template: `
    <aside
      class="sidebar"
      [class.sidebar--collapsed]="collapsed()"
      [class.sidebar--mobile-open]="mobileOpen()"
    >
      <div class="sidebar__header">
        @if (!collapsed()) {
          <span class="sidebar__logo">Anansi</span>
          <span class="sidebar__subtitle">Studio Manager</span>
        } @else {
          <span class="sidebar__logo-icon">A</span>
        }
      </div>

      <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">
        @for (item of navItems; track item.route) {
          <lib-sidebar-item
            [label]="collapsed() ? '' : item.label"
            [icon]="item.icon"
            [active]="isActive(item.route)"
            (itemClick)="navigate(item.route)"
          />
        }
      </nav>

      <div class="sidebar__footer">
        <button class="sidebar__collapse-btn" (click)="toggleCollapse()" aria-label="Toggle sidebar">
          <span class="sidebar__collapse-icon">{{ collapsed() ? '\u25B6' : '\u25C0' }}</span>
        </button>
      </div>
    </aside>

    @if (mobileOpen()) {
      <div class="sidebar__overlay" (click)="closeMobile()"></div>
    }
  `,
  styles: `
    .sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      background: #242426;
      border-right: 1px solid #3A3A3C;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease, min-width 0.2s ease;
      position: relative;
      z-index: 10;
    }

    .sidebar--collapsed {
      width: 64px;
      min-width: 64px;
    }

    .sidebar__header {
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-bottom: 1px solid #3A3A3C;
    }

    .sidebar--collapsed .sidebar__header {
      padding: 24px 12px 16px;
      align-items: center;
    }

    .sidebar__logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #C9A962;
      letter-spacing: 1px;
    }

    .sidebar__subtitle {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .sidebar__logo-icon {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #C9A962;
    }

    .sidebar__nav {
      flex: 1;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }

    .sidebar__footer {
      padding: 12px 8px;
      border-top: 1px solid #3A3A3C;
    }

    .sidebar__collapse-btn {
      width: 100%;
      padding: 8px;
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      color: #6E6E70;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .sidebar__collapse-btn:hover {
      background: #2A2A2C;
      color: #F5F5F0;
    }

    .sidebar__collapse-icon {
      display: block;
    }

    .sidebar__overlay {
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -260px;
        top: 0;
        transition: left 0.3s ease;
      }

      .sidebar--mobile-open {
        left: 0;
      }

      .sidebar__overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9;
      }

      .sidebar--collapsed {
        width: 260px;
        min-width: 260px;
      }
    }
  `,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly notificationsService = inject(NotificationsService);
  private routerSub: Subscription | null = null;

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly currentRoute = signal('');
  readonly unreadCount = signal(0);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Contacts', icon: 'contacts', route: '/contacts' },
    { label: 'Projects', icon: 'projects', route: '/projects' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Bookings', icon: 'bookings', route: '/bookings' },
    { label: 'Galleries', icon: 'image', route: '/galleries' },
    { label: 'Store', icon: 'store', route: '/store' },
    { label: 'Quotes', icon: 'receipt', route: '/quotes' },
    { label: 'Questionnaires', icon: 'clipboard-list', route: '/questionnaires' },
    { label: 'Documents', icon: 'documents', route: '/documents' },
    { label: 'Inbox', icon: 'inbox', route: '/inbox' },
    { label: 'Reports', icon: 'reports', route: '/reports' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentRoute.set(e.urlAfterRedirects);
        this.mobileOpen.set(false);
      });

    this.notificationsService.getUnreadCount().subscribe({
      next: (result: UnreadCountResponse) => this.unreadCount.set(result.count),
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  toggleCollapse(): void {
    this.collapsed.set(!this.collapsed());
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
