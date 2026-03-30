import { Component, inject, signal, OnInit } from '@angular/core';
import {
  DiscoveryService,
  CulturalTagDto,
  PhotographerProfileDto,
} from 'api';
import {
  ButtonComponent,
  InputGroupComponent,
  SidebarItemComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-profile-discovery-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputGroupComponent,
    SidebarItemComponent,
  ],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <lib-sidebar-item label="Dashboard" icon="layout-dashboard" [active]="false" />
          <lib-sidebar-item label="Profile" icon="user" [active]="true" />
          <lib-sidebar-item label="Directory" icon="search" [active]="false" />
          <lib-sidebar-item label="Settings" icon="settings" [active]="false" />
        </nav>
      </aside>

      <main class="main">
        <header class="page-header">
          <h1 class="page-title">Profile & Discovery</h1>
          <lib-button variant="primary" (clicked)="onSave()">Save Changes</lib-button>
        </header>

        <div class="body">
          <div class="card tags-card">
            <h2 class="card-heading">Cultural Specializations</h2>

            <div class="chips">
              @for (tag of availableTags(); track tag.id) {
                <button
                  class="chip"
                  [class.chip--active]="isTagSelected(tag.id)"
                  (click)="toggleTag(tag.id)"
                >
                  {{ tag.label }}
                </button>
              }
              @for (tag of customTags(); track tag) {
                <button
                  class="chip chip--active"
                  (click)="removeCustomTag(tag)"
                >
                  {{ tag }}
                  <span class="chip-remove">x</span>
                </button>
              }
            </div>

            <div class="custom-tag-row">
              <lib-input-group
                label=""
                type="text"
                placeholder="Add custom tag..."
                [(ngModel)]="customTagInput"
                name="customTag"
              />
              <lib-button variant="secondary" (clicked)="addCustomTag()">Add</lib-button>
            </div>
          </div>

          <div class="card area-card">
            <h2 class="card-heading">Service Area</h2>

            <div class="field-group">
              <label class="field-label">Primary Neighborhood</label>
              <select class="select-input" [(ngModel)]="neighborhood" name="neighborhood">
                <option value="">Select neighborhood...</option>
                @for (n of neighborhoods; track n) {
                  <option [value]="n">{{ n }}</option>
                }
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Service Radius</label>
              <div class="radius-row">
                <input
                  type="range"
                  class="slider"
                  min="1"
                  max="100"
                  [(ngModel)]="serviceRadius"
                  name="serviceRadius"
                />
                <span class="radius-value">{{ serviceRadius }} km</span>
              </div>
            </div>

            <div class="map-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                   stroke="#6E6E70" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span class="map-label">Map Preview</span>
            </div>
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

    .body {
      padding: 32px;
      display: flex;
      gap: 24px;
    }

    .card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 24px;
    }

    .tags-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .area-card {
      width: 400px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid #3A3A3C;
      background: transparent;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
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

    .chip-remove {
      font-size: 12px;
      margin-left: 2px;
    }

    .custom-tag-row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .custom-tag-row lib-input-group {
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

    .radius-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .slider {
      flex: 1;
      accent-color: #C9A962;
    }

    .radius-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      min-width: 60px;
      text-align: right;
    }

    .map-placeholder {
      height: 200px;
      background: #1A1A1C;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .map-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }
  `,
})
export class ProfileDiscoveryPageComponent implements OnInit {
  private readonly discoveryService = inject(DiscoveryService);

  readonly availableTags = signal<CulturalTagDto[]>([]);
  readonly selectedTagIds = signal<string[]>([]);
  readonly customTags = signal<string[]>([]);
  readonly profile = signal<PhotographerProfileDto | null>(null);

  customTagInput = '';
  neighborhood = '';
  serviceRadius = 25;

  readonly neighborhoods = [
    'Scarborough',
    'North York',
    'Etobicoke',
    'Downtown Toronto',
    'Brampton',
    'Mississauga',
    'Markham',
    'Ajax',
    'Pickering',
    'Oshawa',
  ];

  ngOnInit(): void {
    this.loadTags();
    this.loadProfile();
  }

  loadTags(): void {
    this.discoveryService.listCulturalTags().subscribe({
      next: (tags) => this.availableTags.set(tags),
      error: () => {
        // Provide default tags on error
        this.availableTags.set([
          { id: 'tag-1', label: 'Caribbean Wedding', isCustom: false, createdAt: '' },
          { id: 'tag-2', label: 'Nigerian Traditional', isCustom: false, createdAt: '' },
          { id: 'tag-3', label: 'Ghanaian Engagement', isCustom: false, createdAt: '' },
          { id: 'tag-4', label: 'Melanin Portraiture', isCustom: false, createdAt: '' },
          { id: 'tag-5', label: 'Ethiopian Ceremony', isCustom: false, createdAt: '' },
          { id: 'tag-6', label: 'Somali Wedding', isCustom: false, createdAt: '' },
        ]);
      },
    });
  }

  loadProfile(): void {
    this.discoveryService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.selectedTagIds.set(profile.culturalTags.map((t) => t.id));
        this.neighborhood = profile.neighborhood;
        this.serviceRadius = profile.serviceRadiusKm;
      },
      error: () => { /* No profile yet */ },
    });
  }

  isTagSelected(id: string): boolean {
    return this.selectedTagIds().includes(id);
  }

  toggleTag(id: string): void {
    const current = this.selectedTagIds();
    if (current.includes(id)) {
      this.selectedTagIds.set(current.filter((t) => t !== id));
    } else {
      this.selectedTagIds.set([...current, id]);
    }
  }

  addCustomTag(): void {
    const tag = this.customTagInput.trim();
    if (tag && !this.customTags().includes(tag)) {
      this.customTags.set([...this.customTags(), tag]);
      this.customTagInput = '';
    }
  }

  removeCustomTag(tag: string): void {
    this.customTags.set(this.customTags().filter((t) => t !== tag));
  }

  onSave(): void {
    this.discoveryService.updateProfile({
      culturalTagIds: this.selectedTagIds(),
      customTags: this.customTags(),
      neighborhood: this.neighborhood,
      serviceRadiusKm: this.serviceRadius,
    }).subscribe();
  }
}
