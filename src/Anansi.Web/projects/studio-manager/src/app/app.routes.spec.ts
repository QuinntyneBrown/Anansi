import { routes } from './app.routes';
import { Route } from '@angular/router';

describe('App Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  // Auth routes are at the top level (no sidebar shell)
  it('should have a sign-up route at top level', () => {
    const route = routes.find((r) => r.path === 'sign-up');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a sign-in route at top level', () => {
    const route = routes.find((r) => r.path === 'sign-in');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a forgot-password route at top level', () => {
    const route = routes.find((r) => r.path === 'forgot-password');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a plan-selection route at top level', () => {
    const route = routes.find((r) => r.path === 'plan-selection');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  // Shell layout wraps all app routes
  const shellRoute = routes.find((r) => r.path === '' && r.children);
  const shellChildren: Route[] = shellRoute?.children ?? [];

  it('should have a shell layout route with children', () => {
    expect(shellRoute).toBeTruthy();
    expect(shellRoute!.component).toBeTruthy();
    expect(shellChildren.length).toBeGreaterThan(0);
  });

  it('should redirect root to dashboard', () => {
    const rootChild = shellChildren.find(
      (r) => r.path === '' && r.redirectTo === 'dashboard',
    );
    expect(rootChild).toBeTruthy();
  });

  it('should have a dashboard route', () => {
    const route = shellChildren.find((r) => r.path === 'dashboard');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a contacts route', () => {
    const route = shellChildren.find((r) => r.path === 'contacts');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a contact detail route', () => {
    const route = shellChildren.find((r) => r.path === 'contacts/:id');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a projects route', () => {
    const route = shellChildren.find((r) => r.path === 'projects');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a calendar route', () => {
    const route = shellChildren.find((r) => r.path === 'calendar');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should redirect documents to documents/contracts', () => {
    const route = shellChildren.find((r) => r.path === 'documents');
    expect(route).toBeTruthy();
    expect(route!.redirectTo).toBe('documents/contracts');
  });

  it('should have a contracts route', () => {
    const route = shellChildren.find((r) => r.path === 'documents/contracts');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have an invoices route', () => {
    const route = shellChildren.find((r) => r.path === 'documents/invoices');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a bookings route', () => {
    const route = shellChildren.find((r) => r.path === 'bookings');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a galleries route', () => {
    const route = shellChildren.find((r) => r.path === 'galleries');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a gallery detail route', () => {
    const route = shellChildren.find(
      (r) => r.path === 'galleries/:collectionId',
    );
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should redirect store to store/products', () => {
    const route = shellChildren.find((r) => r.path === 'store');
    expect(route).toBeTruthy();
    expect(route!.redirectTo).toBe('store/products');
  });

  it('should have a store products route', () => {
    const route = shellChildren.find((r) => r.path === 'store/products');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a store orders route', () => {
    const route = shellChildren.find((r) => r.path === 'store/orders');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a quotes route', () => {
    const route = shellChildren.find((r) => r.path === 'quotes');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a questionnaires route', () => {
    const route = shellChildren.find((r) => r.path === 'questionnaires');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have an inbox route', () => {
    const route = shellChildren.find((r) => r.path === 'inbox');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a reports route', () => {
    const route = shellChildren.find((r) => r.path === 'reports');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a settings route', () => {
    const route = shellChildren.find((r) => r.path === 'settings');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a notification settings route', () => {
    const route = shellChildren.find(
      (r) => r.path === 'settings/notifications',
    );
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a wildcard redirect to dashboard', () => {
    const route = shellChildren.find((r) => r.path === '**');
    expect(route).toBeTruthy();
    expect(route!.redirectTo).toBe('dashboard');
  });

  it('should have title data on dashboard route', () => {
    const route = shellChildren.find((r) => r.path === 'dashboard');
    expect(route!.data!['title']).toBe('Dashboard');
  });

  it('should have title data on contacts route', () => {
    const route = shellChildren.find((r) => r.path === 'contacts');
    expect(route!.data!['title']).toBe('Contacts');
  });

  it('should have title data on projects route', () => {
    const route = shellChildren.find((r) => r.path === 'projects');
    expect(route!.data!['title']).toBe('Projects');
  });

  it('should have title data on calendar route', () => {
    const route = shellChildren.find((r) => r.path === 'calendar');
    expect(route!.data!['title']).toBe('Calendar');
  });

  it('should have title data on bookings route', () => {
    const route = shellChildren.find((r) => r.path === 'bookings');
    expect(route!.data!['title']).toBe('Bookings');
  });

  it('should have title data on galleries route', () => {
    const route = shellChildren.find((r) => r.path === 'galleries');
    expect(route!.data!['title']).toBe('Galleries');
  });

  it('should have title data on store products route', () => {
    const route = shellChildren.find((r) => r.path === 'store/products');
    expect(route!.data!['title']).toBe('Store Products');
  });

  it('should have title data on quotes route', () => {
    const route = shellChildren.find((r) => r.path === 'quotes');
    expect(route!.data!['title']).toBe('Quotes');
  });

  it('should have title data on questionnaires route', () => {
    const route = shellChildren.find((r) => r.path === 'questionnaires');
    expect(route!.data!['title']).toBe('Questionnaires');
  });

  it('should have title data on inbox route', () => {
    const route = shellChildren.find((r) => r.path === 'inbox');
    expect(route!.data!['title']).toBe('Inbox');
  });

  it('should have title data on reports route', () => {
    const route = shellChildren.find((r) => r.path === 'reports');
    expect(route!.data!['title']).toBe('Reports');
  });

  it('should have title data on settings route', () => {
    const route = shellChildren.find((r) => r.path === 'settings');
    expect(route!.data!['title']).toBe('Settings');
  });

  it('should have icon data on shell child routes', () => {
    const routesWithIcon = shellChildren.filter(
      (r) => r.data && r.data['icon'],
    );
    expect(routesWithIcon.length).toBeGreaterThanOrEqual(13);
  });
});
