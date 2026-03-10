import { Component, inject, signal, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdersService, CreateOrderRequest, OrderDto, ProductDto, PaymentMethod } from 'api';
import {
  CardComponent,
  ButtonComponent,
  SpinnerComponent,
  InputGroupComponent,
  EmptyStateComponent,
} from 'components';

export interface CartItem {
  product: ProductDto;
  variationId: string;
  quantity: number;
}

@Component({
  selector: 'lib-checkout-page',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    InputGroupComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Checkout</h1>
      </div>

      @if (orderPlaced()) {
        <div class="success-container">
          <lib-card>
            <div class="success-content">
              <div class="success-icon">&#10003;</div>
              <h2 class="success-title">Order Placed Successfully!</h2>
              <p class="success-message">Thank you for your order. A confirmation email has been sent to {{ placedOrder()?.clientEmail }}.</p>
              <p class="success-order-id">Order #{{ placedOrder()?.id }}</p>
            </div>
          </lib-card>
        </div>
      } @else if (cartItems().length === 0) {
        <lib-empty-state
          heading="No items to checkout"
          description="Add items to your cart before proceeding to checkout."
        />
      } @else {
        <div class="checkout-layout">
          <div class="checkout-form">
            <lib-card>
              <div card-header class="section-title">Contact Information</div>
              <form class="form-fields" (ngSubmit)="onSubmit()">
                <lib-input-group
                  label="Full Name"
                  placeholder="Your full name"
                  [(ngModel)]="clientName"
                  name="clientName"
                />
                <lib-input-group
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  [(ngModel)]="clientEmail"
                  name="clientEmail"
                />
                <lib-input-group
                  label="Phone (optional)"
                  type="tel"
                  placeholder="Your phone number"
                  [(ngModel)]="clientPhone"
                  name="clientPhone"
                />

                <div class="section-divider"></div>
                <h3 class="sub-section-title">Shipping Address</h3>

                <lib-input-group
                  label="Street Address"
                  placeholder="123 Main St"
                  [(ngModel)]="shippingAddress"
                  name="shippingAddress"
                />
                <div class="form-row">
                  <lib-input-group
                    label="City"
                    placeholder="City"
                    [(ngModel)]="shippingCity"
                    name="shippingCity"
                  />
                  <lib-input-group
                    label="Province/State"
                    placeholder="Province"
                    [(ngModel)]="shippingProvince"
                    name="shippingProvince"
                  />
                </div>
                <div class="form-row">
                  <lib-input-group
                    label="Postal Code"
                    placeholder="Postal code"
                    [(ngModel)]="shippingPostalCode"
                    name="shippingPostalCode"
                  />
                  <lib-input-group
                    label="Country"
                    placeholder="Country"
                    [(ngModel)]="shippingCountry"
                    name="shippingCountry"
                  />
                </div>

                @if (errorMessage()) {
                  <div class="error-message">{{ errorMessage() }}</div>
                }

                <lib-button
                  type="submit"
                  variant="primary"
                  [disabled]="submitting()"
                >
                  @if (submitting()) {
                    <lib-spinner [size]="16" />
                  }
                  Place Order
                </lib-button>
              </form>
            </lib-card>
          </div>

          <div class="order-summary">
            <lib-card>
              <div card-header class="section-title">Order Summary</div>
              <div class="summary-items">
                @for (item of cartItems(); track item.variationId) {
                  <div class="summary-item">
                    <div class="summary-item-info">
                      <span class="summary-item-name">{{ item.product.name }}</span>
                      <span class="summary-item-variation">{{ getVariationName(item) }} x{{ item.quantity }}</span>
                    </div>
                    <span class="summary-item-price">{{ formatPrice(getLineTotal(item)) }}</span>
                  </div>
                }
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">{{ formatPrice(subtotal()) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total">
                <span class="summary-label">Estimated Total</span>
                <span class="summary-value total-price">{{ formatPrice(subtotal()) }}</span>
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

    .success-container {
      max-width: 520px;
      margin: 48px auto;
    }

    .success-content {
      text-align: center;
      padding: 24px;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(110, 158, 110, 0.15);
      color: #6E9E6E;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .success-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 8px;
    }

    .success-message {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0 0 16px;
    }

    .success-order-id {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #C9A962;
      margin: 0;
    }

    .checkout-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .checkout-form {
      flex: 2;
    }

    .order-summary {
      flex: 1;
      position: sticky;
      top: 24px;
    }

    .section-title {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-divider {
      height: 1px;
      background: #3A3A3C;
      margin: 8px 0;
    }

    .sub-section-title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row lib-input-group {
      flex: 1;
    }

    .error-message {
      background: rgba(201, 74, 74, 0.1);
      border: 1px solid #C94A4A;
      border-radius: 12px;
      padding: 12px 16px;
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 14px;
    }

    .form-fields lib-button {
      width: 100%;
      margin-top: 8px;
    }

    .form-fields lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }

    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .summary-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .summary-item-name {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .summary-item-variation {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    .summary-item-price {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      white-space: nowrap;
    }

    .summary-divider {
      height: 1px;
      background: #3A3A3C;
      margin: 16px 0;
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

    .summary-total .summary-label {
      font-weight: 600;
      color: #F5F5F0;
    }

    .total-price {
      font-size: 18px;
      font-weight: 600;
      color: #C9A962;
    }
  `,
})
export class CheckoutPageComponent {
  private readonly ordersService = inject(OrdersService);

  readonly cartItems = input<CartItem[]>([]);
  readonly orderComplete = output<OrderDto>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly orderPlaced = signal(false);
  readonly placedOrder = signal<OrderDto | null>(null);

  clientName = '';
  clientEmail = '';
  clientPhone = '';
  shippingAddress = '';
  shippingCity = '';
  shippingProvince = '';
  shippingPostalCode = '';
  shippingCountry = '';

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
    return `$${(cents / 100).toFixed(2)}`;
  }

  onSubmit(): void {
    if (this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request: CreateOrderRequest = {
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      clientPhone: this.clientPhone || undefined,
      shippingAddress: this.shippingAddress || undefined,
      shippingCity: this.shippingCity || undefined,
      shippingProvince: this.shippingProvince || undefined,
      shippingPostalCode: this.shippingPostalCode || undefined,
      shippingCountry: this.shippingCountry || undefined,
      paymentMethod: PaymentMethod.CreditCard,
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        productVariationId: item.variationId,
        quantity: item.quantity,
      })),
    };

    this.ordersService.create(request).subscribe({
      next: (order: OrderDto) => {
        this.submitting.set(false);
        this.orderPlaced.set(true);
        this.placedOrder.set(order);
        this.orderComplete.emit(order);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to place order. Please try again.');
      },
    });
  }
}
