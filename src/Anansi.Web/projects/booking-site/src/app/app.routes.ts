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
    path: 'book/:sessionTypeId/date-time',
    loadComponent: () =>
      import('@domain/booking').then((m) => m.DateTimeSelectionComponent),
    data: { title: 'Select Date & Time' },
  },
  {
    path: 'book/:sessionTypeId/payment',
    loadComponent: () =>
      import('@domain/booking').then((m) => m.BookingPaymentComponent),
    data: { title: 'Payment' },
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
