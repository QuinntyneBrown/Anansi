import { Component } from '@angular/core';

@Component({
  selector: 'lib-top-bar',
  template: `
    <nav class="top-bar">
      <div class="top-bar__left">
        <ng-content select="[topbar-left]">
          <span class="top-bar__title">Anansi</span>
        </ng-content>
      </div>
      <div class="top-bar__right">
        <ng-content select="[topbar-right]"></ng-content>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .top-bar {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      padding: 0 24px;
      background: #1A1A1C;
      border-bottom: 1px solid #3A3A3C;
      box-sizing: border-box;
    }

    .top-bar__left {
      display: flex;
      align-items: center;
    }

    .top-bar__right {
      display: flex;
      align-items: center;
    }

    .top-bar__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: #F5F5F0;
    }
  `,
})
export class TopBarComponent {}
