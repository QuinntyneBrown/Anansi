import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-empty-state',
  standalone: true,
  imports: [],
  template: `
    <div class="empty-state">
      <div class="icon-area">
        @if (icon === 'inbox') {
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
          </svg>
        }
        <ng-content select="[empty-state-icon]"></ng-content>
      </div>
      <h3 class="heading">{{ heading }}</h3>
      <p class="description">{{ description }}</p>
      <ng-content select="[empty-state-action]"></ng-content>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .empty-state {
      width: 400px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .icon-area {
      color: #3A3A3C;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: #F5F5F0;
      text-align: center;
      margin: 0;
    }
    .description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      text-align: center;
      max-width: 280px;
      margin: 0;
    }
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() heading = '';
  @Input() description = '';
}
