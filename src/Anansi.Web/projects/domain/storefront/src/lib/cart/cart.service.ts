import { Injectable, computed, signal } from '@angular/core';
import { ProductDto } from 'api';

export interface CartItem {
  product: ProductDto;
  variationId: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);

  readonly total = computed(() =>
    this.items().reduce((sum, item) => {
      const variation = item.product.variations.find(
        (v) => v.id === item.variationId,
      );
      return sum + (variation?.priceCents ?? 0) * item.quantity;
    }, 0),
  );

  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  addItem(product: ProductDto, quantity: number, variationId: string): void {
    const current = this.items();
    const existingIndex = current.findIndex(
      (i) => i.product.id === product.id && i.variationId === variationId,
    );

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
      this.items.set(updated);
    } else {
      this.items.set([...current, { product, variationId, quantity }]);
    }
  }

  removeItem(index: number): void {
    const current = this.items();
    this.items.set(current.filter((_, i) => i !== index));
  }

  updateQuantity(index: number, qty: number): void {
    if (qty < 1) return;
    const current = [...this.items()];
    if (index >= 0 && index < current.length) {
      current[index] = { ...current[index], quantity: qty };
      this.items.set(current);
    }
  }

  clear(): void {
    this.items.set([]);
  }
}
