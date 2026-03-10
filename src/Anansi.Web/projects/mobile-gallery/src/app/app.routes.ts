import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'gallery',
    pathMatch: 'full',
  },
  {
    path: 'gallery/:collectionId',
    loadComponent: () =>
      import('@domain/gallery-client').then((m) => m.GalleryHomePageComponent),
    data: { title: 'Gallery' },
  },
  {
    path: 'gallery/:collectionId/favorites',
    loadComponent: () =>
      import('@domain/gallery-client').then((m) => m.FavoritesPageComponent),
    data: { title: 'Favorites' },
  },
  {
    path: 'gallery/:collectionId/password',
    loadComponent: () =>
      import('@domain/gallery-client').then((m) => m.PasswordEntryComponent),
    data: { title: 'Password Required' },
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('@domain/gallery-client').then((m) => m.GalleryHomePageComponent),
    data: { title: 'Gallery' },
  },
  {
    path: '**',
    redirectTo: 'gallery',
  },
];
