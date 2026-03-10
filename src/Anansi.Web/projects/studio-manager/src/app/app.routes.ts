import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('@domain/dashboard').then((m) => m.DashboardPageComponent),
    data: { title: 'Dashboard', icon: 'dashboard' },
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('@domain/contacts').then((m) => m.ContactListPageComponent),
    data: { title: 'Contacts', icon: 'contacts' },
  },
  {
    path: 'contacts/:id',
    loadComponent: () =>
      import('@domain/contacts').then((m) => m.ContactDetailPageComponent),
    data: { title: 'Contact Detail', icon: 'contacts' },
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('@domain/projects').then((m) => m.ProjectBoardPageComponent),
    data: { title: 'Projects', icon: 'projects' },
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('@domain/calendar').then((m) => m.CalendarPageComponent),
    data: { title: 'Calendar', icon: 'calendar' },
  },
  {
    path: 'documents',
    redirectTo: 'documents/contracts',
    pathMatch: 'full',
  },
  {
    path: 'documents/contracts',
    loadComponent: () =>
      import('@domain/documents').then((m) => m.ContractListPageComponent),
    data: { title: 'Contracts', icon: 'documents' },
  },
  {
    path: 'documents/invoices',
    loadComponent: () =>
      import('@domain/documents').then((m) => m.InvoiceListPageComponent),
    data: { title: 'Invoices', icon: 'documents' },
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('@domain/booking').then((m) => m.BookingManagementPageComponent),
    data: { title: 'Bookings', icon: 'bookings' },
  },
  {
    path: 'inbox',
    loadComponent: () =>
      import('@domain/inbox').then((m) => m.InboxPageComponent),
    data: { title: 'Inbox', icon: 'inbox' },
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('@domain/reports').then((m) => m.RevenueDashboardPageComponent),
    data: { title: 'Reports', icon: 'reports' },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@domain/settings').then((m) => m.AccountSettingsPageComponent),
    data: { title: 'Settings', icon: 'settings' },
  },
  {
    path: 'settings/notifications',
    loadComponent: () =>
      import('@domain/settings').then(
        (m) => m.NotificationSettingsPageComponent,
      ),
    data: { title: 'Notification Settings', icon: 'settings' },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
