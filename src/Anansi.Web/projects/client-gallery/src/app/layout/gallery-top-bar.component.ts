import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'cg-gallery-top-bar',
  standalone: true,
  template: `
    <header class="gallery-bar">
      <div class="gallery-bar__brand">
        <span class="gallery-bar__logo">Anansi</span>
      </div>

      <nav class="gallery-bar__nav">
        @if (showBackToGallery()) {
          <button class="gallery-bar__link" (click)="navigateBack()">
            Back to Gallery
          </button>
        }
      </nav>
    </header>
  `,
  styles: `
    .gallery-bar {
      height: 80px;
      padding: 0 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #242426;
      border-bottom: 1px solid #3A3A3C;
    }

    .gallery-bar__brand {
      display: flex;
      align-items: center;
    }

    .gallery-bar__logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #C9A962;
      letter-spacing: 1px;
    }

    .gallery-bar__nav {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .gallery-bar__link {
      background: none;
      border: none;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .gallery-bar__link:hover {
      background: #3A3A3C;
    }
  `,
})
export class GalleryTopBarComponent implements OnInit {
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
