import {
  Component,
  input,
  output,
  signal,
  computed,
  ElementRef,
  viewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { GalleryMediaDto } from 'api';

export interface MobileLightboxPhoto {
  id: string;
  url: string;
  fileName: string;
}

@Component({
  selector: 'lib-mobile-lightbox',
  standalone: true,
  template: `
    <div
      class="lightbox"
      #lightboxEl
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
      (keydown.escape)="onClose()"
      (keydown.arrowLeft)="onPrev()"
      (keydown.arrowRight)="onNext()"
      tabindex="0"
    >
      <div class="lightbox__counter">
        {{ currentIndex() + 1 }} / {{ photos().length }}
      </div>

      <button class="lightbox__close" (click)="onClose()" aria-label="Close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <div class="lightbox__image-container">
        @if (currentPhoto(); as photo) {
          <img
            class="lightbox__image"
            [src]="photo.url"
            [alt]="photo.fileName"
            [style.transform]="'translateX(' + swipeOffset() + 'px)'"
          />
        }
      </div>

      <div class="lightbox__actions">
        <button class="lightbox__action-btn" (click)="onFavorite()" aria-label="Favorite">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
          </svg>
        </button>
        <button class="lightbox__action-btn" (click)="onDownload()" aria-label="Download">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
        </button>
        <button class="lightbox__action-btn" (click)="onShare()" aria-label="Share">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
          </svg>
        </button>
        <button class="lightbox__action-btn" (click)="onInfo()" aria-label="Info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: #000000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      outline: none;
      touch-action: pan-y;
      user-select: none;
    }

    .lightbox__counter {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
      z-index: 10;
    }

    .lightbox__close {
      position: absolute;
      top: 56px;
      right: 20px;
      background: none;
      border: none;
      color: #F5F5F0;
      cursor: pointer;
      padding: 4px;
      z-index: 10;
      line-height: 0;
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .lightbox__close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .lightbox__image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 100px 20px 80px;
      overflow: hidden;
    }

    .lightbox__image {
      max-width: 362px;
      max-height: 500px;
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 8px;
      transition: transform 0.1s ease-out;
      will-change: transform;
    }

    .lightbox__actions {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 280px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .lightbox__action-btn {
      background: none;
      border: none;
      color: #F5F5F0;
      cursor: pointer;
      padding: 8px;
      line-height: 0;
      border-radius: 50%;
      transition: background 0.15s ease;
    }

    .lightbox__action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .lightbox__action-btn:active {
      background: rgba(255, 255, 255, 0.2);
    }
  `,
})
export class MobileLightboxComponent implements OnInit, OnDestroy {
  readonly photos = input.required<MobileLightboxPhoto[]>();
  readonly currentIndex = input.required<number>();

  readonly close = output<void>();
  readonly favorite = output<MobileLightboxPhoto>();
  readonly download = output<MobileLightboxPhoto>();
  readonly share = output<MobileLightboxPhoto>();
  readonly indexChange = output<number>();

  private readonly lightboxEl = viewChild<ElementRef<HTMLElement>>('lightboxEl');

  readonly swipeOffset = signal(0);
  private touchStartX = 0;
  private touchCurrentX = 0;
  private isSwiping = false;
  private readonly SWIPE_THRESHOLD = 50;

  readonly currentPhoto = computed(() => {
    const photos = this.photos();
    const idx = this.currentIndex();
    return photos.length > 0 && idx >= 0 && idx < photos.length
      ? photos[idx]
      : null;
  });

  ngOnInit(): void {
    setTimeout(() => {
      this.lightboxEl()?.nativeElement?.focus();
    });
  }

  ngOnDestroy(): void {
    // cleanup if needed
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
    this.isSwiping = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isSwiping || event.touches.length !== 1) return;
    this.touchCurrentX = event.touches[0].clientX;
    const delta = this.touchCurrentX - this.touchStartX;
    this.swipeOffset.set(delta);
  }

  onTouchEnd(): void {
    if (!this.isSwiping) return;
    this.isSwiping = false;
    const delta = this.touchCurrentX - this.touchStartX;

    if (Math.abs(delta) > this.SWIPE_THRESHOLD) {
      if (delta < 0) {
        this.onNext();
      } else {
        this.onPrev();
      }
    }

    this.swipeOffset.set(0);
  }

  onPrev(): void {
    const idx = this.currentIndex();
    if (idx > 0) {
      this.indexChange.emit(idx - 1);
    }
  }

  onNext(): void {
    const idx = this.currentIndex();
    if (idx < this.photos().length - 1) {
      this.indexChange.emit(idx + 1);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onFavorite(): void {
    const photo = this.currentPhoto();
    if (photo) this.favorite.emit(photo);
  }

  onDownload(): void {
    const photo = this.currentPhoto();
    if (photo) this.download.emit(photo);
  }

  onShare(): void {
    const photo = this.currentPhoto();
    if (photo) this.share.emit(photo);
  }

  onInfo(): void {
    // Info panel toggle - can be extended
  }
}
