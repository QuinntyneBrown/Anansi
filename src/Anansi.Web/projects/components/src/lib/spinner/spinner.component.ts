import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-spinner',
  template: `
    <div
      class="spinner"
      [style.width.px]="size()"
      [style.height.px]="size()"
      role="status"
      aria-label="Loading"
    ></div>
  `,
  styles: `
    .spinner {
      border: 2px solid #C9A962;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      will-change: transform;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class SpinnerComponent {
  size = input<number>(24);
}
