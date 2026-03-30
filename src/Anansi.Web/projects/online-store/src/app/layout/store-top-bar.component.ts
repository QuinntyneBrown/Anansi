import { Component, inject, signal, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'os-store-top-bar',
  standalone: true,
  template: `
    <header class="store-bar">
      <div class="store-bar__brand" (click)="navigateHome()" role="button" tabindex="0" (keydown.enter)="navigateHome()">
        <span class="store-bar__logo">Anansi</span>
        <span class="store-bar__subtitle">Store</span>
      </div>

      <nav class="store-bar__nav">
        <button class="store-bar__cart-btn" (click)="navigateToCart()" aria-label="Shopping cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" stroke-width="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          @if (cartItemCount() > 0) {
            <span class="store-bar__cart-badge">{{ cartItemCount() }}</span>
          }
        </button>
      </nav>
    </header>
  `,
  styles: `
    .store-bar {
      height: 64px;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1A1A1C;
      border-bottom: 1px solid #3A3A3C;
    }

    .store-bar__brand {
      display: flex;
      align-items: baseline;
      gap: 8px;
      cursor: pointer;
    }

    .store-bar__brand:focus {
      outline: none;
    }

    .store-bar__logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #C9A962;
      letter-spacing: 1px;
    }

    .store-bar__subtitle {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .store-bar__nav {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .store-bar__cart-btn {
      position: relative;
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .store-bar__cart-btn:hover {
      background: #2A2A2C;
    }

    .store-bar__cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #C9A962;
      color: #1A1A1C;
      font-family: Inter, sans-serif;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class StoreTopBarComponent {
  private readonly router = inject(Router);

  readonly cartItemCount = signal(0);

  navigateHome(): void {
    this.router.navigate(['/shop']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }
}
