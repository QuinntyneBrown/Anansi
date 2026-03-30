import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sites',
    pathMatch: 'full',
  },
  {
    path: 'sites',
    loadComponent: () =>
      import('./pages/website-list-page.component').then(
        (m) => m.WebsiteListPageComponent,
      ),
    data: { title: 'Websites' },
  },
  {
    path: 'sites/:websiteId/templates',
    loadComponent: () =>
      import('@domain/website-builder').then(
        (m) => m.TemplateGalleryPageComponent,
      ),
    data: { title: 'Templates' },
  },
  {
    path: 'sites/:websiteId/pages',
    loadComponent: () =>
      import('@domain/website-builder').then((m) => m.PageManagerComponent),
    data: { title: 'Pages' },
  },
  {
    path: 'sites/:websiteId/editor',
    loadComponent: () =>
      import('@domain/website-builder').then(
        (m) => m.FlexEditorPageComponent,
      ),
    data: { title: 'Flex Editor' },
  },
  {
    path: 'sites/:websiteId/blog',
    loadComponent: () =>
      import('./pages/blog-manager-page.component').then(
        (m) => m.BlogManagerPageComponent,
      ),
    data: { title: 'Blog' },
  },
  {
    path: 'sites/:websiteId/blog/:postId',
    loadComponent: () =>
      import('./pages/blog-editor-page.component').then(
        (m) => m.BlogEditorPageComponent,
      ),
    data: { title: 'Blog Editor' },
  },
  {
    path: 'sites/:websiteId/seo',
    loadComponent: () =>
      import('@domain/website-builder').then((m) => m.SeoManagerComponent),
    data: { title: 'SEO Manager' },
  },
  {
    path: 'sites/:websiteId/analytics',
    loadComponent: () =>
      import('./pages/website-analytics-page.component').then(
        (m) => m.WebsiteAnalyticsPageComponent,
      ),
    data: { title: 'Analytics' },
  },
  {
    path: '**',
    redirectTo: 'sites',
  },
];
