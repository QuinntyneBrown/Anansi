import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full',
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('@domain/storefront').then((m) => m.StoreBrowsePageComponent),
    data: { title: 'Shop' },
  },
  {
    path: 'shop/:productId',
    loadComponent: () =>
      import('@domain/storefront').then((m) => m.ProductDetailPageComponent),
    data: { title: 'Product' },
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('@domain/storefront').then((m) => m.CartPageComponent),
    data: { title: 'Cart' },
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('@domain/storefront').then((m) => m.CheckoutPageComponent),
    data: { title: 'Checkout' },
  },
  {
    path: '**',
    redirectTo: 'shop',
  },
];
