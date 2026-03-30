import { Component, inject, signal, OnInit } from '@angular/core';
import {
  PresetsService,
  PresetDto,
  PresetAdjustmentDto,
  SkinToneRange,
  PresetContext,
  PresetVisibility,
} from 'api';
import {
  ButtonComponent,
  InputGroupComponent,
  TextareaGroupComponent,
  SidebarItemComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-preset-detail-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputGroupComponent,
    TextareaGroupComponent,
    SidebarItemComponent,
  ],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <lib-sidebar-item label="Preset Library" icon="palette" [active]="false" />
          <lib-sidebar-item label="Create Preset" icon="circle-plus" [active]="true" />
        </nav>
      </aside>

      <main class="main">
        <div class="split-view">
          <!-- Detail Panel -->
          <section class="detail-panel">
            <header class="detail-header">
              <button class="back-btn" (click)="onBack()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="#F5F5F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
              </button>
              @if (selectedPreset()) {
                <h1 class="detail-title">{{ selectedPreset()!.name }}</h1>
              } @else {
                <h1 class="detail-title">Select a Preset</h1>
              }
            </header>

            @if (selectedPreset(); as preset) {
              <div class="detail-body">
                <div class="comparison-area">
                  <div class="comparison-half comparison-before">
                    <span class="comparison-label">Before</span>
                  </div>
                  <div class="comparison-half comparison-after">
                    <span class="comparison-label">After</span>
                  </div>
                </div>

                <div class="adjustments-grid">
                  @for (adj of getAdjustmentEntries(preset.adjustments); track adj.key) {
                    <div class="adj-item">
                      <span class="adj-label">{{ adj.key }}</span>
                      <span class="adj-value" [class.adj-positive]="adj.value > 0" [class.adj-negative]="adj.value < 0">
                        {{ adj.value > 0 ? '+' : '' }}{{ adj.value }}
                      </span>
                    </div>
                  }
                </div>

                <div class="detail-actions">
                  <button class="action-btn" (click)="onToggleFavorite(preset)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         [attr.fill]="preset.isFavorited ? '#C9A962' : 'none'"
                         stroke="#C9A962" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                    <span>{{ preset.isFavorited ? 'Favorited' : 'Favorite' }}</span>
                  </button>
                  <lib-button variant="outline" (clicked)="onDownload(preset)">Download</lib-button>
                </div>
              </div>
            } @else {
              <div class="empty-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                     stroke="#3A3A3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="13.5" cy="6.5" r="0.5" fill="#3A3A3C"/>
                  <circle cx="17.5" cy="10.5" r="0.5" fill="#3A3A3C"/>
                  <circle cx="8.5" cy="7.5" r="0.5" fill="#3A3A3C"/>
                  <circle cx="6.5" cy="12.5" r="0.5" fill="#3A3A3C"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/>
                </svg>
                <p class="empty-text">Select a preset from the library or create a new one.</p>
              </div>
            }
          </section>

          <!-- Create Panel -->
          <section class="create-panel">
            <h2 class="create-heading">Create New Preset</h2>

            <div class="form-fields">
              <lib-input-group
                label="Name"
                type="text"
                placeholder="Enter preset name"
                [(ngModel)]="newPreset.name"
                name="presetName"
              />

              <div class="classification-row">
                <div class="field-group">
                  <label class="field-label">Skin Tone</label>
                  <select class="select-input" [(ngModel)]="newPreset.skinTone" name="skinTone">
                    @for (tone of skinTones; track tone.value) {
                      <option [value]="tone.value">{{ tone.label }}</option>
                    }
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Context</label>
                  <select class="select-input" [(ngModel)]="newPreset.context" name="context">
                    @for (ctx of contexts; track ctx.value) {
                      <option [value]="ctx.value">{{ ctx.label }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Visibility</label>
                <div class="toggle-row">
                  <button
                    class="toggle-btn"
                    [class.toggle-btn--active]="newPreset.visibility === PresetVisibility.Public"
                    (click)="newPreset.visibility = PresetVisibility.Public"
                  >
                    Public
                  </button>
                  <button
                    class="toggle-btn"
                    [class.toggle-btn--active]="newPreset.visibility === PresetVisibility.Private"
                    (click)="newPreset.visibility = PresetVisibility.Private"
                  >
                    Private
                  </button>
                </div>
              </div>

              <lib-textarea-group
                label="Description"
                placeholder="Describe your preset..."
                [(ngModel)]="newPreset.description"
                name="description"
              />

              <lib-button variant="primary" (clicked)="onSavePreset()">Save Preset</lib-button>
            </div>
          </section>
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

    .split-view {
      display: flex;
      height: 100%;
    }

    .detail-panel {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 32px;
      border-bottom: 1px solid #3A3A3C;
    }

    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
    }

    .detail-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .detail-body {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .comparison-area {
      display: flex;
      height: 400px;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #3A3A3C;
    }

    .comparison-half {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 16px;
    }

    .comparison-before {
      background: #2A2A2C;
      border-right: 1px solid #3A3A3C;
    }

    .comparison-after {
      background: #323234;
    }

    .comparison-label {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 12px;
      background: rgba(26, 26, 28, 0.7);
      border-radius: 8px;
    }

    .adjustments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .adj-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
    }

    .adj-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      text-transform: capitalize;
    }

    .adj-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .adj-positive {
      color: #6E9E6E;
    }

    .adj-negative {
      color: #C94A4A;
    }

    .detail-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: transparent;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .action-btn:hover {
      border-color: #C9A962;
    }

    .empty-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .empty-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    /* Create Panel */

    .create-panel {
      width: 400px;
      flex-shrink: 0;
      border-left: 1px solid #3A3A3C;
      background: #242426;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .create-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .classification-row {
      display: flex;
      gap: 12px;
    }

    .classification-row .field-group {
      flex: 1;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .select-input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .select-input:focus {
      border-color: #C9A962;
    }

    .toggle-row {
      display: flex;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #3A3A3C;
    }

    .toggle-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .toggle-btn--active {
      background: #C9A962;
      color: #1A1A1C;
    }

    .form-fields lib-button {
      width: 100%;
    }
  `,
})
export class PresetDetailPageComponent implements OnInit {
  private readonly presetsService = inject(PresetsService);

  readonly selectedPreset = signal<PresetDto | null>(null);

  readonly PresetVisibility = PresetVisibility;

  newPreset = {
    name: '',
    description: '',
    skinTone: SkinToneRange.Medium,
    context: PresetContext.Studio,
    visibility: PresetVisibility.Public,
  };

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
    // If navigated with a preset ID, load it
  }

  getAdjustmentEntries(adj: PresetAdjustmentDto): { key: string; value: number }[] {
    return [
      { key: 'Hue', value: adj.hue },
      { key: 'Saturation', value: adj.saturation },
      { key: 'Luminance', value: adj.luminance },
      { key: 'Highlights', value: adj.highlights },
      { key: 'Shadows', value: adj.shadows },
      { key: 'Contrast', value: adj.contrast },
      { key: 'Temperature', value: adj.temperature },
      { key: 'Tint', value: adj.tint },
      { key: 'Vibrance', value: adj.vibrance },
      { key: 'Clarity', value: adj.clarity },
    ];
  }

  onToggleFavorite(preset: PresetDto): void {
    this.presetsService.toggleFavorite(preset.id).subscribe({
      next: () => {
        this.selectedPreset.set({ ...preset, isFavorited: !preset.isFavorited });
      },
    });
  }

  onDownload(preset: PresetDto): void {
    this.presetsService.download(preset.id).subscribe();
  }

  onBack(): void {
    // Navigate back to library
  }

  onSavePreset(): void {
    this.presetsService.create({
      name: this.newPreset.name,
      description: this.newPreset.description || undefined,
      skinTone: this.newPreset.skinTone,
      context: this.newPreset.context,
      visibility: this.newPreset.visibility,
      adjustments: {
        hue: 0,
        saturation: 0,
        luminance: 0,
        highlights: 0,
        shadows: 0,
        contrast: 0,
        temperature: 0,
        tint: 0,
        vibrance: 0,
        clarity: 0,
      },
    }).subscribe({
      next: (created) => {
        this.selectedPreset.set(created);
        this.newPreset = {
          name: '',
          description: '',
          skinTone: SkinToneRange.Medium,
          context: PresetContext.Studio,
          visibility: PresetVisibility.Public,
        };
      },
    });
  }
}
