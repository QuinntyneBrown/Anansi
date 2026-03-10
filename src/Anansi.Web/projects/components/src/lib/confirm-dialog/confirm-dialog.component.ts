import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-confirm-dialog',
  standalone: true,
  imports: [],
  template: `
    @if (open) {
      <div class="backdrop" (click)="cancelled.emit()">
        <div class="panel" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="content-area">
            <div class="warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 class="title">{{ title }}</h2>
            <p class="message">{{ message }}</p>
          </div>
          <div class="footer">
            <button class="btn-cancel" (click)="cancelled.emit()">{{ cancelLabel }}</button>
            <button class="btn-confirm" (click)="confirmed.emit()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .panel {
      width: 420px;
      background: #242426;
      border-radius: 20px;
      overflow: hidden;
    }
    .content-area {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .warning-icon {
      color: #C9A962;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: #F5F5F0;
      text-align: center;
      margin: 0;
    }
    .message {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      text-align: center;
      max-width: 320px;
      margin: 0;
    }
    .footer {
      padding: 24px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 12px;
    }
    .btn-cancel {
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 10px 16px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
      cursor: pointer;
    }
    .btn-cancel:focus-visible,
    .btn-confirm:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }
    .btn-confirm {
      background: #C94A4A;
      border: none;
      border-radius: 20px;
      padding: 10px 16px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
      cursor: pointer;
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone. Do you want to continue?';
  @Input() confirmLabel = 'Delete';
  @Input() cancelLabel = 'Cancel';
  @Input() open = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.cancelled.emit();
    }
  }
}
