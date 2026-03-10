import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'book',
    pathMatch: 'full',
  },
  {
    path: 'book',
    loadComponent: () =>
      import('@domain/booking').then((m) => m.SessionTypeSelectionComponent),
    data: { title: 'Book a Session' },
  },
  {
    path: 'book/:sessionTypeId',
    loadComponent: () =>
      import('@domain/booking').then((m) => m.BookingFormComponent),
    data: { title: 'Book' },
  },
  {
    path: '**',
    redirectTo: 'book',
  },
];
