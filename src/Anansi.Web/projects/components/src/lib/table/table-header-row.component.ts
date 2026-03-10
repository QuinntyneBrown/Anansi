import { Component } from '@angular/core';

@Component({
  selector: 'lib-table-header-row',
  template: `<div class="header-row"><ng-content /></div>`,
  styles: `
    .header-row {
      display: flex;
      flex-direction: row;
      background: #1A1A1C;
      padding: 12px 16px;
      gap: 16px;
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #6E6E70;
    }
  `,
})
export class TableHeaderRowComponent {}
