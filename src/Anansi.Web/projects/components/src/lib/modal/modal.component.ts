import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-modal',
  standalone: true,
  imports: [],
  template: `
    @if (open) {
      <div class="backdrop" (click)="closed.emit()">
        <div class="panel" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="header">
            <h2 class="title">{{ title }}</h2>
            <button class="close-button" (click)="closed.emit()" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="content">
            <ng-content></ng-content>
          </div>
          <div class="footer">
            <ng-content select="[modal-footer]"></ng-content>
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
      width: 560px;
      background: #242426;
      border-radius: 20px;
      overflow: hidden;
    }
    .header {
      padding: 24px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #3A3A3C;
    }
    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: #F5F5F0;
      margin: 0;
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
    }
    .close-button:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
      border-radius: 2px;
    }
    .content {
      padding: 24px;
    }
    .footer {
      padding: 24px;
      border-top: 1px solid #3A3A3C;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      gap: 12px;
    }
    .footer:empty {
      display: none;
    }
  `,
})
export class ModalContainerComponent {
  @Input() title = '';
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }
}
