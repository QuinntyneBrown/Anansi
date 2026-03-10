import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GalleryMobileBarComponent } from './layout/gallery-mobile-bar.component';

@Component({
  selector: 'mg-root',
  standalone: true,
  imports: [RouterOutlet, GalleryMobileBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
