import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

@Component({
  selector: 'lib-button',
  imports: [LucideAngularModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="'btn btn-' + variant()"
      (click)="onClick($event)"
    >
      @if (icon()) {
        <lucide-icon [name]="icon()!" [size]="16"></lucide-icon>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 20px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: normal;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s ease;
    }

    .btn:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #C9A962;
      color: #1A1A1C;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.85;
    }

    .btn-secondary {
      background-color: #242426;
      color: #F5F5F0;
      border: 1px solid #3A3A3C;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #2A2A2C;
    }

    .btn-outline {
      background-color: transparent;
      color: #F5F5F0;
      border: 1px solid #3A3A3C;
    }

    .btn-outline:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.04);
    }

    .btn-ghost {
      background-color: transparent;
      color: #F5F5F0;
    }

    .btn-ghost:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.04);
    }

    .btn-destructive {
      background-color: #C94A4A;
      color: #F5F5F0;
    }

    .btn-destructive:hover:not(:disabled) {
      opacity: 0.85;
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly icon = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly clicked = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
