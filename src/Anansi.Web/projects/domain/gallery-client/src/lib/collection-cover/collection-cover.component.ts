import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lib-collection-cover',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div
      class="cover-page"
      (click)="enterGallery.emit()"
      (keydown.enter)="enterGallery.emit()"
      (keydown.space)="enterGallery.emit()"
      tabindex="0"
      role="button"
      aria-label="Enter gallery"
    >
      @if (coverImageUrl()) {
        <img
          class="cover-image"
          [src]="coverImageUrl()"
          [alt]="collectionTitle()"
        />
      }
      <div class="gradient-overlay"></div>

      <div class="photographer-name">{{ photographerName() }}</div>

      <div class="title-section">
        <h1 class="collection-title">{{ collectionTitle() }}</h1>
        @if (subtitle()) {
          <p class="collection-subtitle">{{ subtitle() }}</p>
        }
      </div>

      <div class="scroll-indicator">
        <lucide-icon name="chevron-down" [size]="32"></lucide-icon>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .cover-page {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      cursor: pointer;
      background: #1A1A1C;
    }

    .cover-page:focus {
      outline: none;
    }

    .cover-page:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: -2px;
    }

    .cover-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        #1A1A1CCC 60%,
        #1A1A1CF0 100%
      );
    }

    .photographer-name {
      position: absolute;
      top: 32px;
      left: 48px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 500;
      color: #F5F5F0;
      z-index: 1;
    }

    .title-section {
      position: absolute;
      bottom: 120px;
      left: 0;
      right: 0;
      text-align: center;
      z-index: 1;
      padding: 0 48px;
    }

    .collection-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 12px;
    }

    .collection-subtitle {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0;
    }

    .scroll-indicator {
      position: absolute;
      bottom: 48px;
      left: 50%;
      transform: translateX(-50%);
      color: #F5F5F0;
      opacity: 0.7;
      z-index: 1;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
      }
      40% {
        transform: translateX(-50%) translateY(-8px);
      }
      60% {
        transform: translateX(-50%) translateY(-4px);
      }
    }
  `,
})
export class CollectionCoverComponent {
  readonly coverImageUrl = input<string>('');
  readonly photographerName = input<string>('');
  readonly collectionTitle = input<string>('');
  readonly subtitle = input<string>('');

  readonly enterGallery = output<void>();
}
