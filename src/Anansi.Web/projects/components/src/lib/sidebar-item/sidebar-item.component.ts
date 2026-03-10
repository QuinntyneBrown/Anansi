import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lib-sidebar-item',
  imports: [LucideAngularModule],
  template: `
    <div
      class="sidebar-item"
      [class.sidebar-item--active]="active()"
      (click)="onItemClick()"
      (keydown.enter)="onItemClick()"
      tabindex="0"
      role="button"
    >
      <lucide-icon [name]="icon()" [size]="20"></lucide-icon>
      <span class="sidebar-item__label">{{ label() }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .sidebar-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      height: 48px;
      padding: 12px 16px;
      box-sizing: border-box;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .sidebar-item:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: -2px;
      border-radius: 12px;
    }

    .sidebar-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .sidebar-item lucide-icon {
      color: #6E6E70;
      flex-shrink: 0;
    }

    .sidebar-item__label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .sidebar-item--active {
      background: #242426;
      border-radius: 12px;
    }

    .sidebar-item--active:hover {
      background: #242426;
    }

    .sidebar-item--active lucide-icon {
      color: #C9A962;
    }

    .sidebar-item--active .sidebar-item__label {
      color: #C9A962;
    }
  `,
})
export class SidebarItemComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly active = input<boolean>(false);
  readonly href = input<string | null>(null);
  readonly itemClick = output<void>();

  onItemClick(): void {
    this.itemClick.emit();
  }
}
