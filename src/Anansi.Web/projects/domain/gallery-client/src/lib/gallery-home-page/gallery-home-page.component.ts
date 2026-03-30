import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CollectionsService, CollectionDto, GalleryMediaService, GalleryMediaDto, PagedList } from 'api';
import { SpinnerComponent, EmptyStateComponent } from 'components';

@Component({
  selector: 'lib-gallery-home-page',
  standalone: true,
  imports: [SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="32" />
      </div>
    } @else if (collection(); as col) {
      <div class="gallery-page">
        <div class="gallery-header">
          <h1 class="gallery-title">{{ col.title }}</h1>
          @if (col.description) {
            <p class="gallery-description">{{ col.description }}</p>
          }
        </div>

        @if (media().length === 0) {
          <lib-empty-state heading="No photos yet" description="This gallery is empty." />
        } @else {
          <div class="photo-grid">
            @for (item of media(); track item.id) {
              <div
                class="photo-card"
                (click)="onPhotoClick(item)"
                (keydown.enter)="onPhotoClick(item)"
                tabindex="0"
              >
                <div class="photo-thumbnail">
                  <span class="photo-filename">{{ item.originalFileName }}</span>
                </div>
                @if (item.isStarred) {
                  <div class="star-indicator">&#9733;</div>
                }
              </div>
            }
          </div>
        }
      </div>
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

    .gallery-page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 40px 48px;
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

    .photo-filename {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      word-break: break-all;
      text-align: center;
    }

    .star-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      color: #C9A962;
      font-size: 18px;
    }
  `,
})
export class GalleryHomePageComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);
  private readonly galleryMediaService = inject(GalleryMediaService);

  readonly collectionId = input.required<string>();
  readonly collection = signal<CollectionDto | null>(null);
  readonly media = signal<GalleryMediaDto[]>([]);
  readonly loading = signal(true);

  readonly photoSelected = output<GalleryMediaDto>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.collectionsService.get(this.collectionId()).subscribe({
      next: (col: CollectionDto) => {
        this.collection.set(col);
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

  onPhotoClick(item: GalleryMediaDto): void {
    this.photoSelected.emit(item);
  }
}
