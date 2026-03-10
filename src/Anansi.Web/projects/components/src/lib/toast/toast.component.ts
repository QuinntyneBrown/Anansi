import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning';

@Component({
  selector: 'lib-toast',
  standalone: true,
  imports: [],
  template: `
    <div class="toast" role="alert">
      <div class="accent-bar" [style.background-color]="accentColor"></div>
      <div class="content">
        <div class="icon" [style.color]="accentColor">
          @if (variant === 'success') {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          }
          @if (variant === 'error') {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          }
          @if (variant === 'warning') {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }
        </div>
        <div class="text-column">
          <span class="title">{{ title }}</span>
          <span class="message">{{ message }}</span>
        </div>
        <button class="close-button" (click)="dismissed.emit()" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .toast {
      width: 400px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: row;
    }
    .accent-bar {
      width: 4px;
      flex-shrink: 0;
    }
    .content {
      padding: 12px 16px;
      display: flex;
      flex-direction: row;
      gap: 12px;
      flex: 1;
      align-items: flex-start;
    }
    .icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .text-column {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }
    .message {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }
    .close-button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #6E6E70;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .close-button:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
      border-radius: 2px;
    }
  `,
})
export class ToastComponent {
  @Input() variant: ToastVariant = 'success';
  @Input() title = '';
  @Input() message = '';
  @Output() dismissed = new EventEmitter<void>();

  get accentColor(): string {
    switch (this.variant) {
      case 'success':
        return '#6E9E6E';
      case 'error':
        return '#C94A4A';
      case 'warning':
        return '#C9A962';
    }
  }
}
