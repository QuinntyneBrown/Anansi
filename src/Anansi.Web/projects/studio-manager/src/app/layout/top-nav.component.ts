import { Component, inject, signal, output, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter, map, mergeMap } from 'rxjs';
import { NotificationsService, UnreadCountResponse } from 'api';
import { AvatarComponent } from 'components';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'sm-top-nav',
  standalone: true,
  imports: [AvatarComponent, LucideAngularModule],
  template: `
    <header class="topnav">
      <div class="topnav__left">
        <button class="topnav__hamburger" (click)="menuToggle.emit()" aria-label="Toggle menu">
          <span class="topnav__hamburger-line"></span>
          <span class="topnav__hamburger-line"></span>
          <span class="topnav__hamburger-line"></span>
        </button>
        <h1 class="topnav__title">{{ pageTitle() }}</h1>
      </div>

      <div class="topnav__right">
        <button
          class="topnav__notification-btn"
          (click)="notificationsClicked.emit()"
          aria-label="Notifications"
        >
          <lucide-icon name="bell" [size]="20" color="#F5F5F0"></lucide-icon>
          @if (unreadCount() > 0) {
            <span class="topnav__notification-badge">{{ unreadCount() > 99 ? '99+' : unreadCount() }}</span>
          }
        </button>
        <lib-avatar initials="SM" [size]="32" />
      </div>
    </header>
  `,
  styles: `
    .topnav {
      height: 64px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1A1A1C;
      border-bottom: 1px solid #2A2A2C;
    }

    .topnav__left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .topnav__hamburger {
      display: none;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
    }

    .topnav__hamburger-line {
      width: 20px;
      height: 2px;
      background: #F5F5F0;
      border-radius: 1px;
    }

    .topnav__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .topnav__right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .topnav__notification-btn {
      position: relative;
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .topnav__notification-btn:hover {
      background: #2A2A2C;
    }

    .topnav__notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #C94A4A;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .topnav__hamburger {
        display: flex;
      }
    }
  `,
})
export class TopNavComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationsService = inject(NotificationsService);
  private routerSub: Subscription | null = null;

  readonly pageTitle = signal('Dashboard');
  readonly unreadCount = signal(0);
  readonly menuToggle = output<void>();
  readonly notificationsClicked = output<void>();

  ngOnInit(): void {
    this.updateTitle();
    this.routerSub = this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap((route) => route.data),
      )
      .subscribe((data) => {
        if (data['title']) {
          this.pageTitle.set(data['title']);
        }
      });

    this.notificationsService.getUnreadCount().subscribe({
      next: (result: UnreadCountResponse) => this.unreadCount.set(result.count),
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateTitle(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const title = route.snapshot.data['title'];
    if (title) {
      this.pageTitle.set(title);
    }
  }
}
