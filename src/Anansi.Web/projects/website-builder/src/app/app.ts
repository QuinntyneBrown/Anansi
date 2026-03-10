import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BuilderSidebarComponent } from './layout/builder-sidebar.component';

@Component({
  selector: 'wb-root',
  standalone: true,
  imports: [RouterOutlet, BuilderSidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
