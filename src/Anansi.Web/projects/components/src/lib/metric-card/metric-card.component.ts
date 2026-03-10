import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-metric-card',
  template: `
    <div class="metric-card">
      <span class="metric-card__value">{{ value() }}</span>
      <span class="metric-card__label">{{ label() }}</span>
    </div>
  `,
  styles: `
    .metric-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 100%;
      box-sizing: border-box;
    }
    .metric-card__value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 300;
      color: #F5F5F0;
      line-height: 1;
    }
    .metric-card__label {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }
  `,
})
export class MetricCardComponent {
  value = input.required<string>();
  label = input.required<string>();
}
