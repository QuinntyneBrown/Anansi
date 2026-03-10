import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'bs-booking-top-bar',
  standalone: true,
  template: `
    <header class="booking-bar">
      <div class="booking-bar__brand" (click)="navigateHome()" role="button" tabindex="0" (keydown.enter)="navigateHome()">
        <span class="booking-bar__logo">Anansi</span>
        <span class="booking-bar__subtitle">Book a Session</span>
      </div>
    </header>
  `,
  styles: `
    .booking-bar {
      height: 56px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      background: #242426;
      border-bottom: 1px solid #3A3A3C;
    }

    .booking-bar__brand {
      display: flex;
      align-items: baseline;
      gap: 8px;
      cursor: pointer;
    }

    .booking-bar__brand:focus {
      outline: none;
    }

    .booking-bar__logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #C9A962;
      letter-spacing: 1px;
    }

    .booking-bar__subtitle {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
  `,
})
export class BookingTopBarComponent {
  private readonly router = inject(Router);

  navigateHome(): void {
    this.router.navigate(['/book']);
  }
}
