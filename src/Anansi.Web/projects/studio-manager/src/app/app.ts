import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar.component';
import { TopNavComponent } from './layout/top-nav.component';
import { MobileTabBarComponent } from './layout/mobile-tab-bar.component';

@Component({
  selector: 'sm-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopNavComponent, MobileTabBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  onMenuToggle(): void {
    this.sidebar?.openMobile();
  }
}
