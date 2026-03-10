import { Component, inject, signal, output, OnInit } from '@angular/core';
import {
  ProductsService,
  ProductDto,
  ProductType,
  FulfillmentType,
  PagedList,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  PillTabBarComponent,
  EmptyStateComponent,
} from 'components';

type ProductTypeFilter = 'All' | 'Print' | 'Digital' | 'SelfFulfilled';

const FILTER_TO_PRODUCT_TYPES: Record<ProductTypeFilter, ProductType[] | null> = {
  All: null,
  Print: [
    ProductType.Print,
    ProductType.MountedPrint,
    ProductType.CanvasPrint,
    ProductType.MetalPrint,
    ProductType.WoodPrint,
    ProductType.FramedPrint,
    ProductType.WallArt,
    ProductType.LargeFormat,
    ProductType.SquarePrint,
    ProductType.Standout,
    ProductType.BambooPanel,
    ProductType.Album,
    ProductType.Book,
    ProductType.GreetingCard,
    ProductType.Package,
  ],
  Digital: [ProductType.DigitalDownload],
  SelfFulfilled: [ProductType.SelfFulfilled],
};

function getFulfillmentLabel(type: FulfillmentType): string {
  switch (type) {
    case FulfillmentType.Lab: return 'Lab Fulfilled';
    case FulfillmentType.Digital: return 'Digital';
    case FulfillmentType.SelfFulfilled: return 'Self Fulfilled';
  }
}

@Component({
  selector: 'lib-product-catalog-page',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    PillTabBarComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Products</h1>
        <lib-button variant="primary" (clicked)="addProduct.emit()">+ Add Product</lib-button>
      </div>

      <lib-pill-tab-bar
        [tabs]="filterTabs"
        [activeTab]="activeFilter()"
        (tabChange)="onFilterChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (products().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No products found"
            description="Add products to your catalog to start selling."
          />
        </div>
      } @else {
        <div class="product-grid">
          @for (product of products(); track product.id) {
            <lib-card>
              <div class="product-card">
                <div class="product-card__image">
                  @if (product.previewImageUrl) {
                    <img [src]="product.previewImageUrl" [alt]="product.name" class="product-card__img" />
                  } @else {
                    <div class="product-card__placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                  }
                </div>
                <div class="product-card__body">
                  <div class="product-card__top-row">
                    <lib-badge [variant]="getProductTypeBadgeVariant(product.productType)">{{ formatProductType(product.productType) }}</lib-badge>
                    <span class="product-card__status" [class.product-card__status--active]="product.isActive" [class.product-card__status--inactive]="!product.isActive">
                      <span class="product-card__status-dot"></span>
                      {{ product.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <h3 class="product-card__name">{{ product.name }}</h3>
                  <div class="product-card__meta">
                    <span class="product-card__variations">{{ product.variations.length }} variation{{ product.variations.length !== 1 ? 's' : '' }}</span>
                    <span class="product-card__fulfillment">{{ getFulfillmentLabel(product.fulfillmentType) }}</span>
                  </div>
                </div>
              </div>
            </lib-card>
          }
        </div>

        <div class="pagination">
          <span class="pagination__info">Showing {{ products().length }} of {{ totalCount() }}</span>
          <div class="pagination__buttons">
            <button class="page-btn" [disabled]="currentPage() <= 1" (click)="onPreviousPage()">Previous</button>
            <button class="page-btn" [disabled]="currentPage() >= totalPages()" (click)="onNextPage()">Next</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
    }

    .page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    .page__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      padding: 0 24px 24px;
    }

    .product-card {
      display: flex;
      flex-direction: column;
    }

    .product-card__image {
      height: 180px;
      background: #1A1A1C;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-card__placeholder {
      color: #3A3A3C;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-card__body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .product-card__top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-card__status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: Inter, sans-serif;
      font-size: 12px;
    }

    .product-card__status--active {
      color: #6E9E6E;
    }

    .product-card__status--inactive {
      color: #6E6E70;
    }

    .product-card__status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .product-card__status--active .product-card__status-dot {
      background: #6E9E6E;
    }

    .product-card__status--inactive .product-card__status-dot {
      background: #6E6E70;
    }

    .product-card__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .product-card__meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-card__variations {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .product-card__fulfillment {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }

    .pagination__info {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .pagination__buttons {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: #2A2A2C;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class ProductCatalogPageComponent implements OnInit {
  private readonly productsService = inject(ProductsService);

  readonly products = signal<ProductDto[]>([]);
  readonly loading = signal(true);
  readonly activeFilter = signal<string>('All');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly addProduct = output<void>();

  readonly filterTabs = [
    { label: 'All', icon: 'layers', value: 'All' },
    { label: 'Print', icon: 'printer', value: 'Print' },
    { label: 'Digital', icon: 'download', value: 'Digital' },
    { label: 'Self Fulfilled', icon: 'package', value: 'SelfFulfilled' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filter = this.activeFilter() as ProductTypeFilter;
    const productTypes = FILTER_TO_PRODUCT_TYPES[filter];

    // If filtering by a specific product type group, use the first match for the API param.
    // The API productType filter is a single value; we filter client-side for multi-type groups.
    if (productTypes && productTypes.length === 1) {
      this.productsService
        .list({ productType: productTypes[0], page: this.currentPage(), pageSize: 12 })
        .subscribe({
          next: (result: PagedList<ProductDto>) => {
            this.products.set(result.items);
            this.totalPages.set(result.totalPages);
            this.totalCount.set(result.totalCount);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    } else {
      this.productsService
        .list({ page: this.currentPage(), pageSize: 12 })
        .subscribe({
          next: (result: PagedList<ProductDto>) => {
            let items = result.items;
            if (productTypes) {
              items = items.filter((p) => productTypes.includes(p.productType));
            }
            this.products.set(items);
            this.totalPages.set(result.totalPages);
            this.totalCount.set(result.totalCount);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    }
  }

  onFilterChange(filter: string): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.load();
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.load();
    }
  }

  onNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.load();
    }
  }

  formatProductType(type: ProductType): string {
    switch (type) {
      case ProductType.MountedPrint: return 'Mounted Print';
      case ProductType.CanvasPrint: return 'Canvas Print';
      case ProductType.MetalPrint: return 'Metal Print';
      case ProductType.WoodPrint: return 'Wood Print';
      case ProductType.FramedPrint: return 'Framed Print';
      case ProductType.WallArt: return 'Wall Art';
      case ProductType.LargeFormat: return 'Large Format';
      case ProductType.SquarePrint: return 'Square Print';
      case ProductType.BambooPanel: return 'Bamboo Panel';
      case ProductType.DigitalDownload: return 'Digital Download';
      case ProductType.GreetingCard: return 'Greeting Card';
      case ProductType.SelfFulfilled: return 'Self Fulfilled';
      default: return type;
    }
  }

  getProductTypeBadgeVariant(type: ProductType): 'success' | 'warning' | 'neutral' {
    switch (type) {
      case ProductType.DigitalDownload: return 'success';
      case ProductType.SelfFulfilled: return 'warning';
      default: return 'neutral';
    }
  }

  getFulfillmentLabel(type: FulfillmentType): string {
    return getFulfillmentLabel(type);
  }
}
