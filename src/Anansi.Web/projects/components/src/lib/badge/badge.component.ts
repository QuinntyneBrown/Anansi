import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-badge',
  template: `<span class="badge" [class]="'badge--' + variant()"><ng-content /></span>`,
  styles: `
    .badge {
      display: inline-block;
      border-radius: 20px;
      padding: 4px 10px;
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 500;
      line-height: normal;
    }
    .badge--success {
      background: #6E9E6E;
      color: #1A1A1C;
    }
    .badge--warning {
      background: #C9A962;
      color: #1A1A1C;
    }
    .badge--error {
      background: #C94A4A;
      color: #F5F5F0;
    }
    .badge--neutral {
      background: #3A3A3C;
      color: #F5F5F0;
    }
  `,
})
export class BadgeComponent {
  variant = input<'success' | 'warning' | 'error' | 'neutral'>('neutral');
}
