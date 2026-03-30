import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopNavComponent } from './top-nav.component';
import { MobileTabBarComponent } from './mobile-tab-bar.component';

@Component({
  selector: 'sm-shell-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopNavComponent, MobileTabBarComponent],
  template: `
    <div class="shell">
      <sm-sidebar />

      <div class="shell__main">
        <sm-top-nav (menuToggle)="onMenuToggle()" />

        <main class="shell__content">
          <router-outlet />
        </main>
      </div>

      <sm-mobile-tab-bar />
    </div>
  `,
  styles: `
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #1A1A1C;
    }

    .shell__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .shell__content {
      flex: 1;
      overflow-y: auto;
      background: #1A1A1C;
    }

    @media (max-width: 768px) {
      .shell__content {
        padding-bottom: 64px;
      }
    }
  `,
})
export class ShellLayoutComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  onMenuToggle(): void {
    this.sidebar?.openMobile();
  }
}
