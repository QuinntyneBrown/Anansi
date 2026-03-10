import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

interface MobileTab {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'sm-mobile-tab-bar',
  standalone: true,
  template: `
    <nav class="mobile-tabs" role="navigation" aria-label="Mobile navigation">
      @for (tab of tabs; track tab.route) {
        <button
          class="mobile-tabs__item"
          [class.mobile-tabs__item--active]="isActive(tab.route)"
          (click)="navigate(tab.route)"
          [attr.aria-label]="tab.label"
        >
          <span class="mobile-tabs__icon">{{ getIcon(tab.icon) }}</span>
          <span class="mobile-tabs__label">{{ tab.label }}</span>
        </button>
      }
    </nav>
  `,
  styles: `
    .mobile-tabs {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #242426;
      border-top: 1px solid #3A3A3C;
      z-index: 20;
      padding: 0 8px;
      justify-content: space-around;
      align-items: center;
    }

    .mobile-tabs__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 8px;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.15s ease;
      min-width: 56px;
    }

    .mobile-tabs__item:hover {
      background: #2A2A2C;
    }

    .mobile-tabs__icon {
      font-size: 18px;
      color: #6E6E70;
      transition: color 0.15s ease;
    }

    .mobile-tabs__label {
      font-family: Inter, sans-serif;
      font-size: 10px;
      color: #6E6E70;
      transition: color 0.15s ease;
    }

    .mobile-tabs__item--active .mobile-tabs__icon {
      color: #C9A962;
    }

    .mobile-tabs__item--active .mobile-tabs__label {
      color: #C9A962;
    }

    @media (max-width: 768px) {
      .mobile-tabs {
        display: flex;
      }
    }
  `,
})
export class MobileTabBarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private routerSub: Subscription | null = null;

  readonly currentRoute = signal('');

  readonly tabs: MobileTab[] = [
    { label: 'Home', icon: 'dashboard', route: '/dashboard' },
    { label: 'Contacts', icon: 'contacts', route: '/contacts' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Inbox', icon: 'inbox', route: '/inbox' },
    { label: 'More', icon: 'settings', route: '/settings' },
  ];

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentRoute.set(e.urlAfterRedirects));
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

  getIcon(icon: string): string {
    const icons: Record<string, string> = {
      dashboard: '\u2302',
      contacts: '\u263A',
      calendar: '\u2637',
      inbox: '\u2709',
      settings: '\u2699',
    };
    return icons[icon] ?? '\u25CF';
  }
}
