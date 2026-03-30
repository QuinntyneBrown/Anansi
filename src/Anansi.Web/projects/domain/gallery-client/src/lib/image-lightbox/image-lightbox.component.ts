import { Component, inject, input, output, signal, computed, HostListener } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { GalleryMediaDto, API_CONFIG } from 'api';

@Component({
  selector: 'lib-image-lightbox',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="lightbox-overlay" (click)="onOverlayClick($event)">
      <button
        class="close-btn"
        (click)="close.emit()"
        aria-label="Close lightbox"
      >
        <lucide-icon name="x" [size]="24"></lucide-icon>
      </button>

      <button
        class="nav-btn nav-btn--left"
        (click)="onPrevious($event)"
        [disabled]="currentIndex() <= 0"
        aria-label="Previous photo"
      >
        <lucide-icon name="chevron-left" [size]="24"></lucide-icon>
      </button>

      <div class="lightbox-image-container">
        @if (currentPhoto(); as photo) {
          @if (getPhotoUrl(photo)) {
            <img
              [src]="getPhotoUrl(photo)"
              [alt]="photo.originalFileName"
              class="lightbox-image"
            />
          } @else {
            <div class="photo-display">
              <span class="photo-filename">{{ photo.originalFileName }}</span>
            </div>
          }
        }
      </div>

      <button
        class="nav-btn nav-btn--right"
        (click)="onNext($event)"
        [disabled]="currentIndex() >= photos().length - 1"
        aria-label="Next photo"
      >
        <lucide-icon name="chevron-right" [size]="24"></lucide-icon>
      </button>

      <div class="bottom-bar">
        <div class="bottom-bar__left">
          <button
            class="action-btn"
            (click)="onFavorite($event)"
            aria-label="Favorite"
          >
            <lucide-icon name="heart" [size]="20"></lucide-icon>
          </button>
          @if (currentPhoto(); as photo) {
            <span class="favorite-count">{{ photo.isStarred ? 1 : 0 }}</span>
          }
        </div>

        <span class="counter">{{ currentIndex() + 1 }} / {{ photos().length }}</span>

        <div class="bottom-bar__right">
          <button
            class="action-btn"
            (click)="onDownload($event)"
            aria-label="Download"
          >
            <lucide-icon name="download" [size]="20"></lucide-icon>
          </button>
          <button
            class="action-btn"
            (click)="onShare($event)"
            aria-label="Share"
          >
            <lucide-icon name="share-2" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #1A1A1CF2;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .close-btn {
      position: absolute;
      top: 24px;
      right: 24px;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: #2A2A2C80;
      border: none;
      color: #F5F5F0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
      z-index: 1001;
    }

    .close-btn:hover {
      background: #3A3A3C;
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background: #2A2A2C80;
      border: none;
      color: #F5F5F0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
      z-index: 1001;
    }

    .nav-btn:hover:not(:disabled) {
      background: #3A3A3C;
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-btn--left {
      left: 24px;
    }

    .nav-btn--right {
      right: 24px;
    }

    .lightbox-image-container {
      max-width: 800px;
      max-height: 540px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lightbox-image {
      max-width: 800px;
      max-height: 540px;
      object-fit: contain;
      border-radius: 4px;
    }

    .photo-display {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 400px;
      min-height: 300px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 24px;
    }

    .photo-filename {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      word-break: break-all;
      text-align: center;
    }

    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1A1A1CE6;
    }

    .bottom-bar__left,
    .bottom-bar__right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-btn {
      background: none;
      border: none;
      color: #F5F5F0;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .favorite-count {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .counter {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    @media (max-width: 480px) {
      .nav-btn {
        width: 36px;
        height: 36px;
        border-radius: 18px;
      }

      .nav-btn--left {
        left: 12px;
      }

      .nav-btn--right {
        right: 12px;
      }

      .close-btn {
        top: 12px;
        right: 12px;
      }

      .bottom-bar {
        padding: 0 16px;
        height: 56px;
      }

      .lightbox-image {
        max-width: calc(100vw - 80px);
        max-height: calc(100vh - 120px);
      }

      .photo-display {
        min-width: 260px;
        min-height: 200px;
      }
    }
  `,
})
export class ImageLightboxComponent {
  private readonly config = inject(API_CONFIG);

  readonly photos = input.required<GalleryMediaDto[]>();
  readonly currentIndex = input.required<number>();

  readonly close = output<void>();
  readonly favorite = output<GalleryMediaDto>();
  readonly download = output<GalleryMediaDto>();
  readonly share = output<GalleryMediaDto>();

  private readonly index = signal<number | null>(null);

  readonly currentPhoto = computed(() => {
    const idx = this.index() ?? this.currentIndex();
    const items = this.photos();
    return items.length > 0 && idx >= 0 && idx < items.length ? items[idx] : null;
  });

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void {
    this.navigatePrevious();
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void {
    this.navigateNext();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lightbox-overlay')) {
      this.close.emit();
    }
  }

  onPrevious(event: MouseEvent): void {
    event.stopPropagation();
    this.navigatePrevious();
  }

  onNext(event: MouseEvent): void {
    event.stopPropagation();
    this.navigateNext();
  }

  onFavorite(event: MouseEvent): void {
    event.stopPropagation();
    const photo = this.currentPhoto();
    if (photo) {
      this.favorite.emit(photo);
    }
  }

  onDownload(event: MouseEvent): void {
    event.stopPropagation();
    const photo = this.currentPhoto();
    if (photo) {
      this.download.emit(photo);
    }
  }

  onShare(event: MouseEvent): void {
    event.stopPropagation();
    const photo = this.currentPhoto();
    if (photo) {
      this.share.emit(photo);
    }
  }

  getPhotoUrl(photo: GalleryMediaDto): string | null {
    if (!photo.collectionId || !photo.id) return null;
    return `${this.config.baseUrl}/api/collections/${photo.collectionId}/media/${photo.id}/content`;
  }

  private navigatePrevious(): void {
    const idx = this.index() ?? this.currentIndex();
    if (idx > 0) {
      this.index.set(idx - 1);
    }
  }

  private navigateNext(): void {
    const idx = this.index() ?? this.currentIndex();
    if (idx < this.photos().length - 1) {
      this.index.set(idx + 1);
    }
  }
}
