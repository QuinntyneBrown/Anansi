import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface PillTabItem {
  label: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'lib-pill-tab-bar',
  imports: [LucideAngularModule],
  template: `
    <div class="pill-tab-bar">
      <div class="pill-tab-bar__pill">
        @for (tab of tabs(); track tab.value) {
          <button
            class="pill-tab-bar__tab"
            [class.pill-tab-bar__tab--active]="tab.value === activeTab()"
            (click)="onTabClick(tab.value)"
            role="tab"
            [attr.aria-selected]="tab.value === activeTab()"
          >
            <lucide-icon [name]="tab.icon" [size]="18"></lucide-icon>
            <span class="pill-tab-bar__label">{{ tab.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .pill-tab-bar {
      background: #1A1A1C;
      padding: 12px 21px 21px 21px;
    }

    .pill-tab-bar__pill {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 34px;
      height: 62px;
      padding: 4px;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
    }

    .pill-tab-bar__tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-radius: 26px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .pill-tab-bar__tab:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: -2px;
      border-radius: 26px;
    }

    .pill-tab-bar__tab lucide-icon {
      color: #6E6E70;
    }

    .pill-tab-bar__label {
      font-family: Inter, sans-serif;
      font-size: 10px;
      font-weight: 500;
      color: #6E6E70;
    }

    .pill-tab-bar__tab--active {
      background: #C9A962;
    }

    .pill-tab-bar__tab--active lucide-icon {
      color: #1A1A1C;
    }

    .pill-tab-bar__tab--active .pill-tab-bar__label {
      color: #1A1A1C;
    }
  `,
})
export class PillTabBarComponent {
  readonly tabs = input.required<PillTabItem[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();

  onTabClick(value: string): void {
    this.tabChange.emit(value);
  }
}
