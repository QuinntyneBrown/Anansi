import { Component } from '@angular/core';

@Component({
  selector: 'lib-table-data-row',
  template: `<div class="data-row"><ng-content /></div>`,
  styles: `
    .data-row {
      display: flex;
      flex-direction: row;
      background: #242426;
      padding: 12px 16px;
      gap: 16px;
      border-bottom: 1px solid #2A2A2C;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }
  `,
})
export class TableDataRowComponent {}
