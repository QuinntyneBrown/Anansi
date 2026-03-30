import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, ProductDto, ProductVariationDto } from 'api';
import { ButtonComponent, SpinnerComponent } from 'components';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'lib-product-detail-page',
  standalone: true,
  imports: [ButtonComponent, SpinnerComponent, LucideAngularModule],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="32" />
      </div>
    } @else if (product()) {
      <div class="page">
        <div class="content">
          <div class="image-panel">
            @if (product()!.previewImageUrl) {
              <img
                class="product-image"
                [src]="product()!.previewImageUrl"
                [alt]="product()!.name"
              />
            } @else {
              <div class="image-placeholder">
                <lucide-icon name="image" [size]="64" color="#3A3A3C"></lucide-icon>
              </div>
            }
          </div>

          <div class="info-panel">
            <h1 class="product-name">{{ product()!.name }}</h1>

            @if (product()!.description) {
              <p class="product-description">{{ product()!.description }}</p>
            }

            @if (sizeVariations().length > 0) {
              <div class="option-group">
                <span class="option-label">Size</span>
                <div class="option-buttons">
                  @for (v of sizeVariations(); track v.id) {
                    <button
                      class="option-btn"
                      [class.option-btn--selected]="selectedVariationId() === v.id"
                      (click)="selectVariation(v.id)"
                    >{{ v.name }}</button>
                  }
                </div>
              </div>
            }

            @if (finishOptions.length > 0) {
              <div class="option-group">
                <span class="option-label">Finish</span>
                <div class="option-buttons">
                  @for (finish of finishOptions; track finish) {
                    <button
                      class="option-btn"
                      [class.option-btn--selected]="selectedFinish() === finish"
                      (click)="selectFinish(finish)"
                    >{{ finish }}</button>
                  }
                </div>
              </div>
            }

            <div class="quantity-row">
              <span class="option-label">Quantity</span>
              <div class="quantity-controls">
                <button
                  class="qty-btn"
                  (click)="decrementQuantity()"
                  [disabled]="quantity() <= 1"
                  aria-label="Decrease quantity"
                >
                  <lucide-icon name="minus" [size]="16"></lucide-icon>
                </button>
                <span class="qty-value">{{ quantity() }}</span>
                <button
                  class="qty-btn"
                  (click)="incrementQuantity()"
                  aria-label="Increase quantity"
                >
                  <lucide-icon name="plus" [size]="16"></lucide-icon>
                </button>
              </div>
            </div>

            <span class="product-price">{{ formatPrice(selectedPrice()) }}</span>

            <lib-button
              variant="primary"
              icon="shopping-cart"
              (clicked)="onAddToCart()"
            >
              Add to Cart
            </lib-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }

    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 40px;
    }

    .content {
      display: flex;
      gap: 48px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .image-panel {
      flex: 1;
      min-width: 0;
    }

    .product-image {
      width: 100%;
      max-height: 500px;
      object-fit: cover;
      border-radius: 16px;
    }

    .image-placeholder {
      width: 100%;
      height: 500px;
      border-radius: 16px;
      background: #242426;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-panel {
      width: 440px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .product-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .product-description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      line-height: 1.6;
      margin: 0;
    }

    .option-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .option-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .option-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .option-btn:hover {
      border-color: #C9A962;
    }

    .option-btn--selected {
      background: #C9A962;
      color: #1A1A1C;
      border-color: #C9A962;
    }

    .quantity-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .qty-btn:hover:not(:disabled) {
      background: #3A3A3C;
    }

    .qty-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .qty-value {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #F5F5F0;
      min-width: 24px;
      text-align: center;
    }

    .product-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #C9A962;
    }

    :host lib-button {
      width: 100%;
    }

    :host lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }
  `,
})
export class ProductDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);

  readonly product = signal<ProductDto | null>(null);
  readonly loading = signal(true);
  readonly selectedVariationId = signal<string>('');
  readonly selectedFinish = signal<string>('Matte');
  readonly quantity = signal(1);

  readonly finishOptions = ['Matte', 'Glossy'];

  readonly sizeVariations = computed(() =>
    this.product()?.variations.filter((v) => v.isActive) ?? [],
  );

  readonly selectedPrice = computed(() => {
    const variation = this.product()?.variations.find(
      (v) => v.id === this.selectedVariationId(),
    );
    return variation?.priceCents ?? 0;
  });

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsService.get(id).subscribe({
      next: (product: ProductDto) => {
        this.product.set(product);
        const activeVariations = product.variations.filter((v) => v.isActive);
        if (activeVariations.length > 0) {
          this.selectedVariationId.set(activeVariations[0].id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  selectVariation(id: string): void {
    this.selectedVariationId.set(id);
  }

  selectFinish(finish: string): void {
    this.selectedFinish.set(finish);
  }

  incrementQuantity(): void {
    this.quantity.set(this.quantity() + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  onAddToCart(): void {
    const p = this.product();
    const varId = this.selectedVariationId();
    if (p && varId) {
      this.cartService.addItem(p, this.quantity(), varId);
      this.router.navigate(['/cart']);
    }
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
