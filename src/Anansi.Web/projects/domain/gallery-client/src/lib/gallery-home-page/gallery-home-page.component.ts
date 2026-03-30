import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CollectionsService, CollectionDto, GalleryMediaService, GalleryMediaDto, PagedList, TranslationService } from 'api';
import { SpinnerComponent, EmptyStateComponent } from 'components';
import { ImageLightboxComponent } from '../image-lightbox/image-lightbox.component';

@Component({
  selector: 'lib-gallery-home-page',
  standalone: true,
  imports: [SpinnerComponent, EmptyStateComponent, ImageLightboxComponent],
  template: `
    @if (loading()) {
      <div class="loading-container" [class.theme-light]="theme() === 'light'">
        <lib-spinner [size]="32" />
      </div>
    } @else if (collection(); as col) {
      <div class="gallery-page" [class.theme-light]="theme() === 'light'">
        @if (coverImageUrl()) {
          <div class="gallery-cover">
            <img class="gallery-cover__image" [src]="coverImageUrl()" alt="" />
            <div class="gallery-cover__overlay"></div>
            <div class="gallery-cover__content">
              <h1 class="gallery-cover__title">{{ col.title }}</h1>
              @if (coverSubtitle()) {
                <p class="gallery-cover__subtitle">{{ coverSubtitle() }}</p>
              } @else if (col.description) {
                <p class="gallery-cover__subtitle">{{ col.description }}</p>
              }
            </div>
          </div>
        }

        <div class="gallery-header" [class.gallery-header--hidden]="!!coverImageUrl()">
          <h1 class="gallery-title">{{ col.title }}</h1>
          @if (col.description) {
            <p class="gallery-description">{{ col.description }}</p>
          }
        </div>

        @if (media().length === 0) {
          <lib-empty-state [heading]="i18n.t().gallery.noPhotos" [description]="i18n.t().gallery.emptyGallery" />
        } @else {
          <div class="photo-grid">
            @for (item of media(); track item.id; let idx = $index) {
              <div
                class="photo-card"
                (click)="onPhotoClick(item, idx)"
                (keydown.enter)="onPhotoClick(item, idx)"
                tabindex="0"
              >
                <div class="photo-thumbnail">
                  <span class="photo-filename">{{ item.originalFileName }}</span>
                </div>
                @if (item.isStarred) {
                  <div class="star-indicator"><lucide-icon name="star" [size]="14"></lucide-icon></div>
                }
              </div>
            }
          </div>
        }

        <footer class="gallery-footer" [class.theme-light]="theme() === 'light'">
          <span class="gallery-footer__text">Powered by Anansi</span>
        </footer>
      </div>
    }

    @if (lightboxOpen()) {
      <lib-image-lightbox
        [photos]="media()"
        [currentIndex]="lightboxIndex()"
        (close)="closeLightbox()"
        (favorite)="onLightboxFavorite($event)"
        (download)="onLightboxDownload($event)"
        (share)="onLightboxShare($event)"
      />
    }
  `,
  styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
      background: #1A1A1C;
      min-height: 100vh;
    }

    .loading-container.theme-light {
      background: #F5F5F0;
    }

    .gallery-page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 40px 48px;
    }

    .gallery-page.theme-light {
      background: #F5F5F0;
    }

    .gallery-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .gallery-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 12px;
    }

    .theme-light .gallery-title {
      color: #1A1A1C;
    }

    .gallery-description {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .photo-grid {
      columns: 3;
      column-gap: 12px;
    }

    .photo-card {
      break-inside: avoid;
      margin-bottom: 16px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: border-color 0.15s ease;
    }

    .theme-light .photo-card {
      background: #FFFFFF;
      border-color: #E0E0DC;
    }

    .photo-card:hover {
      border-color: #C9A962;
    }

    .photo-card:focus {
      outline: none;
      border-color: #C9A962;
    }

    .photo-thumbnail {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 180px;
      padding: 24px;
      background: #2A2A2C;
    }

    .theme-light .photo-thumbnail {
      background: #ECECEA;
    }

    .photo-filename {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      word-break: break-all;
      text-align: center;
    }

    .theme-light .photo-filename {
      color: #6E6E70;
    }

    .star-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      color: #C9A962;
      font-size: 18px;
    }

    /* Cover image section */
    .gallery-cover {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
      margin-bottom: 40px;
    }

    .gallery-cover__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery-cover__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.55) 100%
      );
    }

    .gallery-cover__content {
      position: absolute;
      bottom: 40px;
      left: 48px;
      right: 48px;
    }

    .gallery-cover__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 8px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .gallery-cover__subtitle {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: rgba(245, 245, 240, 0.85);
      margin: 0;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .gallery-header--hidden {
      display: none;
    }

    .gallery-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      border-top: 1px solid #3A3A3C;
      margin-top: 40px;
      width: 100%;
    }

    .gallery-footer.theme-light {
      border-top-color: #E0E0DC;
    }

    .gallery-footer__text {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    /* Mobile grid adjustments */
    @media (max-width: 480px) {
      .gallery-page {
        padding: 24px 16px;
      }

      .photo-grid {
        columns: 2;
        column-gap: 8px;
      }

      .photo-card {
        margin-bottom: 8px;
      }

      .gallery-cover {
        height: 280px;
        margin-bottom: 24px;
      }

      .gallery-cover__content {
        bottom: 24px;
        left: 20px;
        right: 20px;
      }

      .gallery-cover__title {
        font-size: 28px;
      }

      .gallery-cover__subtitle {
        font-size: 14px;
      }
    }
  `,
})
export class GalleryHomePageComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);
  private readonly galleryMediaService = inject(GalleryMediaService);
  readonly i18n = inject(TranslationService);

  readonly collectionId = input.required<string>();
  readonly theme = input<'light' | 'dark'>('dark');
  readonly coverImageUrl = input<string | null>(null);
  readonly coverSubtitle = input<string | null>(null);
  readonly collection = signal<CollectionDto | null>(null);
  readonly media = signal<GalleryMediaDto[]>([]);
  readonly loading = signal(true);

  readonly lightboxOpen = signal(false);
  readonly lightboxIndex = signal(0);

  readonly photoSelected = output<GalleryMediaDto>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.collectionsService.get(this.collectionId()).subscribe({
      next: (col: CollectionDto) => {
        this.collection.set(col);
        if (col.language) {
          this.i18n.setLanguage(col.language);
        }
        this.loadMedia();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadMedia(): void {
    this.galleryMediaService.list(this.collectionId()).subscribe({
      next: (result: PagedList<GalleryMediaDto>) => {
        this.media.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPhotoClick(item: GalleryMediaDto, index: number): void {
    this.photoSelected.emit(item);
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  onLightboxFavorite(_photo: GalleryMediaDto): void {
    // Favorite handling delegated to parent or service
  }

  onLightboxDownload(_photo: GalleryMediaDto): void {
    // Download handling delegated to parent or service
  }

  onLightboxShare(_photo: GalleryMediaDto): void {
    // Share handling delegated to parent or service
  }
}
