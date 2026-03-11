import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'wb-builder-sidebar',
  standalone: true,
  template: `
    <aside class="wb-sidebar">
      <div class="wb-sidebar__header">
        <span class="wb-sidebar__logo">Anansi</span>
        <span class="wb-sidebar__subtitle">Website Builder</span>
      </div>

      <nav class="wb-sidebar__nav" role="navigation" aria-label="Builder navigation">
        @for (item of navItems(); track item.route) {
          <button
            class="wb-sidebar__item"
            [class.wb-sidebar__item--active]="isActive(item.route)"
            (click)="navigate(item.route)"
          >
            {{ item.label }}
          </button>
        }
      </nav>
    </aside>
  `,
  styles: `
    .wb-sidebar {
      width: 220px;
      min-width: 220px;
      height: 100vh;
      background: #242426;
      border-right: 1px solid #3A3A3C;
      display: flex;
      flex-direction: column;
    }

    .wb-sidebar__header {
      padding: 24px 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-bottom: 1px solid #3A3A3C;
    }

    .wb-sidebar__logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #C9A962;
      letter-spacing: 1px;
    }

    .wb-sidebar__subtitle {
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .wb-sidebar__nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .wb-sidebar__item {
      display: block;
      width: 100%;
      padding: 10px 12px;
      background: none;
      border: none;
      border-radius: 8px;
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .wb-sidebar__item:hover {
      background: #2A2A2C;
      color: #F5F5F0;
    }

    .wb-sidebar__item--active {
      background: #2A2A2C;
      color: #C9A962;
    }
  `,
})
export class BuilderSidebarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private routerSub: Subscription | null = null;

  readonly currentRoute = signal('');
  readonly currentWebsiteId = computed(() => {
    const match = this.currentRoute().match(/^\/sites\/([^/]+)/);
    return match ? match[1] : null;
  });

  readonly navItems = computed<NavItem[]>(() => {
    const websiteId = this.currentWebsiteId();
    if (!websiteId) {
      return [{ label: 'Websites', route: '/sites' }];
    }

    return [
      { label: 'Websites', route: '/sites' },
      { label: 'Templates', route: `/sites/${websiteId}/templates` },
      { label: 'Pages', route: `/sites/${websiteId}/pages` },
      { label: 'Blog', route: `/sites/${websiteId}/blog` },
      { label: 'SEO Manager', route: `/sites/${websiteId}/seo` },
      { label: 'Analytics', route: `/sites/${websiteId}/analytics` },
    ];
  });

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentRoute.set(e.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  isActive(route: string): boolean {
    if (route === '/sites') {
      return this.currentRoute() === '/sites';
    }

    return this.currentRoute().startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigateByUrl(route);
  }
}
