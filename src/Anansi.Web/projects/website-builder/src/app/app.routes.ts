import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'templates',
    pathMatch: 'full',
  },
  {
    path: 'templates',
    loadComponent: () =>
      import('@domain/website-builder').then(
        (m) => m.TemplateGalleryPageComponent,
      ),
    data: { title: 'Templates' },
  },
  {
    path: 'pages',
    loadComponent: () =>
      import('@domain/website-builder').then((m) => m.PageManagerComponent),
    data: { title: 'Pages' },
  },
  {
    path: 'seo',
    loadComponent: () =>
      import('@domain/website-builder').then((m) => m.SeoManagerComponent),
    data: { title: 'SEO Manager' },
  },
  {
    path: '**',
    redirectTo: 'templates',
  },
];
