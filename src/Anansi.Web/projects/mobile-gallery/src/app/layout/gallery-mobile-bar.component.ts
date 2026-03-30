import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'mg-gallery-mobile-bar',
  standalone: true,
  template: `
    <header class="mobile-bar">
      <div class="mobile-bar__brand">
        <span class="mobile-bar__logo">Anansi</span>
        <span class="mobile-bar__subtitle">Gallery</span>
      </div>

      <nav class="mobile-bar__nav">
        @if (showBackToGallery()) {
          <button class="mobile-bar__back" (click)="navigateBack()">
            Back
          </button>
        }
      </nav>
    </header>
  `,
  styles: `
    .mobile-bar {
      height: 56px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #242426;
      border-bottom: 1px solid #3A3A3C;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .mobile-bar__brand {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .mobile-bar__logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #C9A962;
      letter-spacing: 1px;
    }

    .mobile-bar__subtitle {
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .mobile-bar__nav {
      display: flex;
      align-items: center;
    }

    .mobile-bar__back {
      background: none;
      border: none;
      color: #C9A962;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .mobile-bar__back:hover {
      background: #3A3A3C;
    }
  `,
})
export class GalleryMobileBarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private routerSub: Subscription | null = null;

  readonly showBackToGallery = signal(false);
  private currentCollectionId = '';

  ngOnInit(): void {
    this.checkRoute();
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
        mergeMap((route) => route.params),
      )
      .subscribe((params) => {
        this.currentCollectionId = params['collectionId'] || '';
        this.updateBackButton();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  navigateBack(): void {
    if (this.currentCollectionId) {
      this.router.navigate(['/gallery', this.currentCollectionId]);
    }
  }

  private checkRoute(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    this.currentCollectionId = route.snapshot.params['collectionId'] || '';
    this.updateBackButton();
  }

  private updateBackButton(): void {
    const url = this.router.url;
    this.showBackToGallery.set(
      url.includes('/favorites') || url.includes('/password'),
    );
  }
}
