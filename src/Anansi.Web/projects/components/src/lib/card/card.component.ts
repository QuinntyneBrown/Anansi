import { Component } from '@angular/core';

@Component({
  selector: 'lib-card',
  template: `
    <div class="card">
      <div class="card__header"><ng-content select="[card-header]" /></div>
      <div class="card__content"><ng-content /></div>
      <div class="card__actions"><ng-content select="[card-actions]" /></div>
    </div>
  `,
  styles: `
    .card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }
    .card__header {
      padding: 24px;
    }
    .card__content {
      padding: 24px;
    }
    .card__actions {
      padding: 24px;
      display: flex;
      justify-content: flex-end;
    }
    .card__header:empty,
    .card__content:empty,
    .card__actions:empty {
      display: none;
    }
  `,
})
export class CardComponent {}
