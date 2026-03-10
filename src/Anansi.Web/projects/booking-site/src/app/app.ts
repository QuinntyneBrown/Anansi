import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingTopBarComponent } from './layout/booking-top-bar.component';

@Component({
  selector: 'bs-root',
  standalone: true,
  imports: [RouterOutlet, BookingTopBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
