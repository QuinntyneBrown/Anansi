import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GalleryTopBarComponent } from './layout/gallery-top-bar.component';

@Component({
  selector: 'cg-root',
  standalone: true,
  imports: [RouterOutlet, GalleryTopBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
