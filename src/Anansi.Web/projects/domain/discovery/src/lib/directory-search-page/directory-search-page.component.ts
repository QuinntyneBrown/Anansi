import { Component, inject, signal, OnInit } from '@angular/core';
import {
  DiscoveryService,
  CulturalTagDto,
  PhotographerProfileDto,
  PagedList,
} from 'api';
import { ButtonComponent } from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-directory-search-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="page">
      <header class="top-bar">
        <span class="logo">Anansi Directory</span>
        <nav class="top-nav">
          <a class="nav-link nav-link--gold" href="#">Find Photographers</a>
          <a class="nav-link" href="#">About</a>
        </nav>
      </header>

      <section class="hero">
        <h1 class="hero-title">Find Your Perfect Photographer</h1>
        <p class="hero-subtitle">Discover talented Black photographers in your community specializing in your cultural traditions.</p>

        <div class="search-bar">
          <input
            type="text"
            class="search-input"
            placeholder="Search by name, specialty, or location..."
            [(ngModel)]="searchQuery"
            name="searchQuery"
            (keyup.enter)="onSearch()"
          />
          <lib-button variant="primary" (clicked)="onSearch()">Search</lib-button>
        </div>

        <div class="filter-row">
          <div class="filter-chips">
            @for (tag of culturalTags(); track tag.id) {
              <button
                class="chip"
                [class.chip--active]="activeTagId() === tag.id"
                (click)="onFilterTag(tag.id)"
              >
                {{ tag.label }}
              </button>
            }
          </div>
          <select class="neighborhood-select" [(ngModel)]="selectedNeighborhood" name="neighborhood" (change)="onSearch()">
            <option value="">All Neighborhoods</option>
            @for (n of neighborhoods; track n) {
              <option [value]="n">{{ n }}</option>
            }
          </select>
        </div>
      </section>

      <section class="results-section">
        <div class="results-header">
          <span class="results-count">{{ totalCount() }} photographers found</span>
          <select class="sort-select" [(ngModel)]="sortBy" name="sortBy" (change)="onSearch()">
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div class="results-grid">
          @for (photographer of photographers(); track photographer.id) {
            <div class="photographer-card">
              <div class="card-cover" [style.backgroundImage]="photographer.coverImageUrl ? 'url(' + photographer.coverImageUrl + ')' : ''">
                @if (!photographer.coverImageUrl) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                       stroke="#6E6E70" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                }
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ photographer.displayName }}</h3>
                <p class="card-neighborhood">{{ photographer.neighborhood }}</p>
                <div class="card-tags">
                  @for (tag of photographer.culturalTags.slice(0, 3); track tag.id) {
                    <span class="card-chip">{{ tag.label }}</span>
                  }
                </div>
                <div class="card-rating">
                  @for (star of getStars(photographer.rating); track $index) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                         [attr.fill]="star ? '#C9A962' : 'none'" stroke="#C9A962" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  }
                  <span class="rating-count">({{ photographer.reviewCount }})</span>
                </div>
                <lib-button variant="outline" (clicked)="onViewProfile(photographer)">View Profile</lib-button>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    :host { display: block; }

    .page {
      background: #1A1A1C;
      min-height: 100vh;
      max-width: 1440px;
      margin: 0 auto;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      border-bottom: 1px solid #3A3A3C;
    }

    .logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 700;
      color: #C9A962;
    }

    .top-nav {
      display: flex;
      gap: 24px;
    }

    .nav-link {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .nav-link:hover {
      color: #C9A962;
    }

    .nav-link--gold {
      color: #C9A962;
    }

    .hero {
      padding: 48px 32px;
      text-align: center;
    }

    .hero-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 12px;
    }

    .hero-subtitle {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0 0 32px;
    }

    .search-bar {
      display: flex;
      max-width: 700px;
      margin: 0 auto 24px;
      gap: 12px;
    }

    .search-input {
      flex: 1;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 15px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .search-input::placeholder {
      color: #6E6E70;
    }

    .search-input:focus {
      border-color: #C9A962;
    }

    .filter-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
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

    .neighborhood-select {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 13px;
      outline: none;
    }

    .neighborhood-select:focus {
      border-color: #C9A962;
    }

    .results-section {
      padding: 0 32px 48px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .results-count {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .sort-select {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 13px;
      outline: none;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .photographer-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
      transition: border-color 0.15s ease;
    }

    .photographer-card:hover {
      border-color: #C9A962;
    }

    .card-cover {
      height: 180px;
      background: #1A1A1C;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .card-neighborhood {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    .card-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .card-chip {
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #F5F5F0;
    }

    .card-rating {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .rating-count {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      margin-left: 4px;
    }
  `,
})
export class DirectorySearchPageComponent implements OnInit {
  private readonly discoveryService = inject(DiscoveryService);

  readonly culturalTags = signal<CulturalTagDto[]>([]);
  readonly photographers = signal<PhotographerProfileDto[]>([]);
  readonly totalCount = signal(0);
  readonly activeTagId = signal<string | null>(null);

  searchQuery = '';
  selectedNeighborhood = '';
  sortBy = 'rating';

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
    this.onSearch();
  }

  loadTags(): void {
    this.discoveryService.listCulturalTags().subscribe({
      next: (tags) => this.culturalTags.set(tags),
      error: () => {
        this.culturalTags.set([
          { id: 'tag-1', label: 'Caribbean Wedding', isCustom: false, createdAt: '' },
          { id: 'tag-2', label: 'Nigerian Traditional', isCustom: false, createdAt: '' },
          { id: 'tag-3', label: 'Ghanaian Engagement', isCustom: false, createdAt: '' },
          { id: 'tag-4', label: 'Melanin Portraiture', isCustom: false, createdAt: '' },
        ]);
      },
    });
  }

  onSearch(): void {
    this.discoveryService.searchDirectory({
      search: this.searchQuery || undefined,
      culturalTagId: this.activeTagId() ?? undefined,
      neighborhood: this.selectedNeighborhood || undefined,
      sortBy: this.sortBy,
      page: 1,
      pageSize: 12,
    }).subscribe({
      next: (result: PagedList<PhotographerProfileDto>) => {
        this.photographers.set(result.items);
        this.totalCount.set(result.totalCount);
      },
      error: () => {
        this.photographers.set([]);
        this.totalCount.set(0);
      },
    });
  }

  onFilterTag(tagId: string): void {
    if (this.activeTagId() === tagId) {
      this.activeTagId.set(null);
    } else {
      this.activeTagId.set(tagId);
    }
    this.onSearch();
  }

  onViewProfile(photographer: PhotographerProfileDto): void {
    // Navigate to photographer profile
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
