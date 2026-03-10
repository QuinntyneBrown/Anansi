import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreTopBarComponent } from './layout/store-top-bar.component';

@Component({
  selector: 'os-root',
  standalone: true,
  imports: [RouterOutlet, StoreTopBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
