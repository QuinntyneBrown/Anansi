import { Component, input, output } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

@Component({
  selector: 'lib-breadcrumb',
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (item of items(); track item.label; let last = $last; let i = $index) {
        @if (!last && item.href) {
          <span
            class="breadcrumb__item breadcrumb__item--link"
            (click)="onNavigate(item.href!)"
            (keydown.enter)="onNavigate(item.href!)"
            tabindex="0"
            role="link"
          >{{ item.label }}</span>
        } @else if (!last) {
          <span class="breadcrumb__item">{{ item.label }}</span>
        } @else {
          <span class="breadcrumb__item breadcrumb__item--active" aria-current="page">{{ item.label }}</span>
        }
        @if (!last) {
          <span class="breadcrumb__separator">/</span>
        }
      }
    </nav>
  `,
  styles: `
    .breadcrumb {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .breadcrumb__item {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .breadcrumb__item--link {
      cursor: pointer;
    }

    .breadcrumb__item--link:hover {
      text-decoration: underline;
    }

    .breadcrumb__item--link:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
      border-radius: 2px;
    }

    .breadcrumb__item--active {
      color: #F5F5F0;
    }

    .breadcrumb__separator {
      color: #3A3A3C;
      font-family: Inter, sans-serif;
      font-size: 14px;
      user-select: none;
    }
  `,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
  readonly navigate = output<string>();

  onNavigate(href: string): void {
    this.navigate.emit(href);
  }
}
