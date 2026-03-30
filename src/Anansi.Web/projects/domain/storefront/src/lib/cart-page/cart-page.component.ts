import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslationService } from 'api';
import {
  CardComponent,
  ButtonComponent,
  EmptyStateComponent,
} from 'components';
import { CartService, CartItem } from '../cart/cart.service';

@Component({
  selector: 'lib-cart-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ i18n.t().cart.title }}</h1>
      </div>

      @if (cartItems().length === 0) {
        <lib-empty-state
          [heading]="i18n.t().cart.empty"
          [description]="i18n.t().cart.emptyDescription"
        />
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cartItems(); track item.variationId; let i = $index) {
              <lib-card>
                <div class="cart-item">
                  <div class="item-thumbnail">
                    @if (item.product.previewImageUrl) {
                      <img
                        class="thumbnail-img"
                        [src]="item.product.previewImageUrl"
                        [alt]="item.product.name"
                      />
                    } @else {
                      <div class="thumbnail-placeholder">
                        <lucide-icon name="image" [size]="24"></lucide-icon>
                      </div>
                    }
                  </div>
                  <div class="item-details">
                    <h3 class="item-name">{{ item.product.name }}</h3>
                    <p class="item-variation">{{ getVariationName(item) }}</p>
                    <p class="item-unit-price">{{ formatPrice(getUnitPrice(item)) }} {{ i18n.t().cart.each }}</p>
                  </div>
                  <div class="item-actions">
                    <div class="quantity-controls">
                      <button
                        class="qty-btn"
                        (click)="onDecrement(i)"
                        [disabled]="item.quantity <= 1"
                        [attr.aria-label]="i18n.t().cart.decreaseQty"
                      >-</button>
                      <span class="qty-value">{{ item.quantity }}</span>
                      <button
                        class="qty-btn"
                        (click)="onIncrement(i)"
                        [attr.aria-label]="i18n.t().cart.increaseQty"
                      >+</button>
                    </div>
                    <span class="item-total">{{ formatPrice(getLineTotal(item)) }}</span>
                    <button
                      class="remove-btn"
                      (click)="onRemove(i)"
                      [attr.aria-label]="i18n.t().cart.remove"
                    >{{ i18n.t().cart.remove }}</button>
                  </div>
                </div>
              </lib-card>
            }
          </div>

          <div class="cart-summary">
            <lib-card>
              <div card-header class="summary-title">{{ i18n.t().cart.orderSummary }}</div>
              <div class="summary-rows">
                <div class="summary-row">
                  <span class="summary-label">{{ i18n.t().cart.itemsLabel }}</span>
                  <span class="summary-value">{{ itemCount() }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">{{ i18n.t().cart.subtotal }}</span>
                  <span class="summary-value">{{ formatPrice(subtotal()) }}</span>
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total">
                <span class="summary-label">{{ i18n.t().cart.estimatedTotal }}</span>
                <span class="summary-value total-price">{{ formatPrice(subtotal()) }}</span>
              </div>
              <div class="checkout-action">
                <lib-button variant="primary" (clicked)="onProceedToCheckout()">
                  {{ i18n.t().cart.proceedToCheckout }}
                </lib-button>
              </div>
            </lib-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 32px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0;
    }

    .cart-layout {
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }

    .cart-items {
      flex: 2;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-summary {
      flex: 1;
      position: sticky;
      top: 24px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .item-thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .thumbnail-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
      background: #1A1A1C;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-icon {
      font-size: 24px;
      opacity: 0.3;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 4px;
    }

    .item-variation {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0 0 4px;
    }

    .item-unit-price {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1A1A1C;
      border-radius: 8px;
      padding: 4px 8px;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 16px;
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
      font-size: 14px;
      color: #F5F5F0;
      min-width: 20px;
      text-align: center;
    }

    .item-total {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
      min-width: 80px;
      text-align: right;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .remove-btn:hover {
      background: rgba(201, 74, 74, 0.1);
    }

    .summary-title {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .summary-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }

    .summary-divider {
      height: 1px;
      background: #3A3A3C;
      margin: 16px 0;
    }

    .summary-total .summary-label {
      font-weight: 600;
      color: #F5F5F0;
    }

    .total-price {
      font-size: 18px;
      font-weight: 600;
      color: #C9A962;
    }

    .checkout-action {
      margin-top: 24px;
    }

    .checkout-action lib-button {
      width: 100%;
    }

    .checkout-action lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }
  `,
})
export class CartPageComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  readonly i18n = inject(TranslationService);

  readonly cartItems = this.cartService.items;

  readonly itemCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + this.getLineTotal(item), 0),
  );

  getVariationName(item: CartItem): string {
    const variation = item.product.variations.find((v) => v.id === item.variationId);
    return variation?.name ?? 'Unknown';
  }

  getUnitPrice(item: CartItem): number {
    const variation = item.product.variations.find((v) => v.id === item.variationId);
    return variation?.priceCents ?? 0;
  }

  getLineTotal(item: CartItem): number {
    return this.getUnitPrice(item) * item.quantity;
  }

  formatPrice(cents: number): string {
    return this.i18n.formatCurrency(cents);
  }

  onIncrement(index: number): void {
    const item = this.cartItems()[index];
    if (item) {
      this.cartService.updateQuantity(index, item.quantity + 1);
    }
  }

  onDecrement(index: number): void {
    const item = this.cartItems()[index];
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(index, item.quantity - 1);
    }
  }

  onRemove(index: number): void {
    this.cartService.removeItem(index);
  }

  onProceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
