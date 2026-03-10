import { Component, input, output } from '@angular/core';

export interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'lib-tab-bar',
  template: `
    <div class="tab-bar" role="tablist">
      @for (tab of tabs(); track tab.value) {
        <button
          class="tab-bar__tab"
          [class.tab-bar__tab--active]="tab.value === activeTab()"
          (click)="onTabClick(tab.value)"
          role="tab"
          [attr.aria-selected]="tab.value === activeTab()"
        >{{ tab.label }}</button>
      }
    </div>
  `,
  styles: `
    .tab-bar {
      display: flex;
      flex-direction: row;
    }

    .tab-bar__tab {
      padding: 10px 16px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease;
    }

    .tab-bar__tab:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: -2px;
    }

    .tab-bar__tab:hover {
      color: #F5F5F0;
    }

    .tab-bar__tab--active {
      color: #C9A962;
      border-bottom-color: #C9A962;
    }

    .tab-bar__tab--active:hover {
      color: #C9A962;
    }
  `,
})
export class TabBarComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();

  onTabClick(value: string): void {
    this.tabChange.emit(value);
  }
}
