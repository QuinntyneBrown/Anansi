import { Component, inject, signal, OnInit } from '@angular/core';
import {
  PresetsService,
  PresetDto,
  SkinToneRange,
  PresetContext,
  PagedList,
} from 'api';
import {
  ButtonComponent,
  SidebarItemComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-preset-library-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, SidebarItemComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <lib-sidebar-item label="Dashboard" icon="layout-dashboard" [active]="false" />
          <lib-sidebar-item label="Preset Library" icon="palette" [active]="true" />
          <lib-sidebar-item label="My Favorites" icon="heart" [active]="false" (clicked)="onFavoritesFilter()" />
          <lib-sidebar-item label="My Presets" icon="circle-plus" [active]="false" (clicked)="onMyPresetsFilter()" />
        </nav>
      </aside>

      <main class="main">
        <header class="page-header">
          <h1 class="page-title">Preset Library</h1>
          <div class="header-actions">
            <input
              type="text"
              class="search-input"
              placeholder="Search presets..."
              [(ngModel)]="searchQuery"
              name="searchQuery"
              (keyup.enter)="onSearch()"
            />
            <lib-button variant="primary" (clicked)="onCreatePreset()">Create Preset</lib-button>
          </div>
        </header>

        <div class="body">
          <div class="filter-bar">
            <div class="filter-group">
              <span class="filter-label">Skin Tone</span>
              @for (tone of skinTones; track tone.value) {
                <button
                  class="chip"
                  [class.chip--active]="activeSkinTone() === tone.value"
                  (click)="onSkinToneFilter(tone.value)"
                >
                  {{ tone.label }}
                </button>
              }
            </div>
            <div class="filter-group">
              <span class="filter-label">Context</span>
              @for (ctx of contexts; track ctx.value) {
                <button
                  class="chip"
                  [class.chip--active]="activeContext() === ctx.value"
                  (click)="onContextFilter(ctx.value)"
                >
                  {{ ctx.label }}
                </button>
              }
            </div>
          </div>

          <div class="preset-grid">
            @for (preset of presets(); track preset.id) {
              <div class="preset-card" (click)="onSelectPreset(preset)">
                <div class="card-image">
                  <div class="before-after">
                    <div class="ba-half ba-before">
                      <span class="ba-label">Before</span>
                    </div>
                    <div class="ba-half ba-after">
                      <span class="ba-label">After</span>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="card-top-row">
                    <h3 class="card-name">{{ preset.name }}</h3>
                    <button class="fav-btn" [class.fav-btn--active]="preset.isFavorited" (click)="onToggleFavorite($event, preset)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                           [attr.fill]="preset.isFavorited ? '#C9A962' : 'none'"
                           stroke="#C9A962" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                      </svg>
                    </button>
                  </div>
                  <p class="card-author">{{ preset.authorName }}</p>
                  <span class="skin-badge" [attr.data-tone]="preset.skinTone">{{ preset.skinTone }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    :host { display: block; }

    .layout {
      display: flex;
      min-height: 100vh;
      background: #1A1A1C;
    }

    .sidebar {
      width: 240px;
      background: #242426;
      border-right: 1px solid #3A3A3C;
      padding: 24px 0;
      flex-shrink: 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .main {
      flex: 1;
      min-width: 0;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid #3A3A3C;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-input {
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      outline: none;
      width: 220px;
      transition: border-color 0.15s ease;
    }

    .search-input::placeholder {
      color: #6E6E70;
    }

    .search-input:focus {
      border-color: #C9A962;
    }

    .body {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .filter-bar {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #6E6E70;
      margin-right: 4px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #3A3A3C;
      background: transparent;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chip:hover {
      border-color: #C9A962;
    }

    .chip--active {
      background: #C9A962;
      border-color: #C9A962;
      color: #1A1A1C;
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .preset-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .preset-card:hover {
      border-color: #C9A962;
    }

    .card-image {
      height: 180px;
      background: #1A1A1C;
    }

    .before-after {
      display: flex;
      height: 100%;
    }

    .ba-half {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 8px;
    }

    .ba-before {
      background: #2A2A2C;
      border-right: 1px solid #3A3A3C;
    }

    .ba-after {
      background: #323234;
    }

    .ba-label {
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-body {
      padding: 16px 20px 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .card-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .fav-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
    }

    .card-author {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    .skin-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 10px;
      font-family: Inter, sans-serif;
      font-size: 11px;
      font-weight: 500;
      background: #3A3A3C;
      color: #F5F5F0;
      width: fit-content;
    }
  `,
})
export class PresetLibraryPageComponent implements OnInit {
  private readonly presetsService = inject(PresetsService);

  readonly presets = signal<PresetDto[]>([]);
  readonly loading = signal(true);
  readonly activeSkinTone = signal<SkinToneRange | null>(null);
  readonly activeContext = signal<PresetContext | null>(null);

  searchQuery = '';

  readonly skinTones = [
    { label: 'Light', value: SkinToneRange.Light },
    { label: 'Medium', value: SkinToneRange.Medium },
    { label: 'Deep', value: SkinToneRange.Deep },
    { label: 'Very Deep', value: SkinToneRange.VeryDeep },
  ];

  readonly contexts = [
    { label: 'Studio', value: PresetContext.Studio },
    { label: 'Outdoor', value: PresetContext.Outdoor },
    { label: 'Event', value: PresetContext.Event },
    { label: 'Golden Hour', value: PresetContext.GoldenHour },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.presetsService.list({
      skinTone: this.activeSkinTone() ?? undefined,
      context: this.activeContext() ?? undefined,
      search: this.searchQuery || undefined,
      page: 1,
      pageSize: 12,
    }).subscribe({
      next: (result: PagedList<PresetDto>) => {
        this.presets.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.load();
  }

  onSkinToneFilter(tone: SkinToneRange): void {
    if (this.activeSkinTone() === tone) {
      this.activeSkinTone.set(null);
    } else {
      this.activeSkinTone.set(tone);
    }
    this.load();
  }

  onContextFilter(ctx: PresetContext): void {
    if (this.activeContext() === ctx) {
      this.activeContext.set(null);
    } else {
      this.activeContext.set(ctx);
    }
    this.load();
  }

  onFavoritesFilter(): void {
    // Navigate to favorites view
  }

  onMyPresetsFilter(): void {
    // Navigate to my presets view
  }

  onCreatePreset(): void {
    // Navigate to create preset page
  }

  onSelectPreset(preset: PresetDto): void {
    // Navigate to preset detail
  }

  onToggleFavorite(event: Event, preset: PresetDto): void {
    event.stopPropagation();
    this.presetsService.toggleFavorite(preset.id).subscribe({
      next: () => {
        const updated = this.presets().map((p) =>
          p.id === preset.id ? { ...p, isFavorited: !p.isFavorited } : p,
        );
        this.presets.set(updated);
      },
    });
  }
}
