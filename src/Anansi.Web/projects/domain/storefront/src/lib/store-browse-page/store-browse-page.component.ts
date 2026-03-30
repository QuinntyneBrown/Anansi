import { Component, inject, signal, computed, output, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ProductsService, ProductDto, ProductType, PagedList, TranslationService } from 'api';
import {
  SpinnerComponent,
  EmptyStateComponent,
  TabBarComponent,
  TabItem,
} from 'components';

@Component({
  selector: 'lib-store-browse-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    SpinnerComponent,
    EmptyStateComponent,
    TabBarComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ i18n.t().store.shop }}</h1>
      </div>

      <div class="filter-section">
        <lib-tab-bar
          [tabs]="filterTabs"
          [activeTab]="activeFilter()"
          (tabChange)="onFilterChange($event)"
        />
      </div>

      <div class="store-layout">
        <aside class="category-sidebar">
          <h3 class="sidebar-heading">Categories</h3>
          <ul class="sidebar-list">
            @for (tab of filterTabs(); track tab.value) {
              <li>
                <button
                  class="sidebar-link"
                  [class.sidebar-link--active]="activeFilter() === tab.value"
                  (click)="onFilterChange(tab.value)"
                >
                  {{ tab.label }}
                </button>
              </li>
            }
          </ul>
        </aside>

        <div class="product-area">
          @if (loading()) {
            <div class="loading-container">
              <lib-spinner [size]="32" />
            </div>
          } @else if (filteredProducts().length === 0) {
            <lib-empty-state
              [heading]="i18n.t().store.noProducts"
              [description]="i18n.t().store.noProductsDescription"
            />
          } @else {
            <div class="product-grid">
              @for (product of filteredProducts(); track product.id) {
                <div
                  class="product-card"
                  (click)="productSelected.emit(product)"
                  (keydown.enter)="productSelected.emit(product)"
                  tabindex="0"
                >
                  <div class="product-image">
                    @if (product.previewImageUrl) {
                      <img [src]="product.previewImageUrl" [alt]="product.name" />
                    } @else {
                      <div class="image-placeholder">
                        <lucide-icon name="image" [size]="24"></lucide-icon>
                      </div>
                    }
                  </div>
                  <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-type">{{ formatProductType(product.productType) }}</p>
                    <p class="product-price">{{ formatPrice(getStartingPrice(product)) }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .filter-section {
      display: none;
      margin-bottom: 32px;
    }

    .store-layout {
      display: flex;
      gap: 32px;
    }

    .category-sidebar {
      width: 200px;
      flex-shrink: 0;
    }

    .sidebar-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 16px;
    }

    .sidebar-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .sidebar-link {
      display: block;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      padding: 8px 0;
      cursor: pointer;
      transition: color 0.15s ease;
    }

    .sidebar-link:hover {
      color: #C9A962;
    }

    .sidebar-link--active {
      color: #C9A962;
      font-weight: 500;
    }

    .product-area {
      flex: 1;
      min-width: 0;
    }

    @media (max-width: 768px) {
      .category-sidebar {
        display: none;
      }

      .filter-section {
        display: block;
      }

      .store-layout {
        display: block;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }

    .product-card {
      background: #242426;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border: 1px solid #3A3A3C;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .product-card:focus {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }

    .product-image {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      background: #1A1A1C;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2A2A2C;
    }

    .placeholder-icon {
      font-size: 48px;
      opacity: 0.3;
    }

    .product-info {
      padding: 16px;
    }

    .product-name {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 4px;
    }

    .product-type {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0 0 8px;
    }

    .product-price {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #C9A962;
      margin: 0;
    }
  `,
})
export class StoreBrowsePageComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  readonly i18n = inject(TranslationService);

  readonly products = signal<ProductDto[]>([]);
  readonly loading = signal(true);
  readonly activeFilter = signal('All');

  readonly productSelected = output<ProductDto>();

  readonly filterTabs = computed<TabItem[]>(() => [
    { label: this.i18n.t().store.all, value: 'All' },
    { label: this.i18n.t().store.prints, value: ProductType.Print },
    { label: this.i18n.t().store.canvas, value: ProductType.CanvasPrint },
    { label: this.i18n.t().store.metal, value: ProductType.MetalPrint },
    { label: this.i18n.t().store.albums, value: ProductType.Album },
    { label: this.i18n.t().store.digital, value: ProductType.DigitalDownload },
  ]);

  readonly filteredProducts = computed(() => {
    const all = this.products().filter((p) => p.isActive);
    const filter = this.activeFilter();
    if (filter === 'All') return all;
    return all.filter((p) => p.productType === filter);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productsService.list().subscribe({
      next: (result: PagedList<ProductDto>) => {
        this.products.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(filter: string): void {
    this.activeFilter.set(filter);
  }

  getStartingPrice(product: ProductDto): number {
    if (!product.variations || product.variations.length === 0) return 0;
    return product.variations[0].priceCents;
  }

  formatPrice(cents: number): string {
    return this.i18n.formatCurrency(cents);
  }

  formatProductType(type: ProductType): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }
}
