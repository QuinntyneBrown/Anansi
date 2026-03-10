import { routes } from './app.routes';

describe('App Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to dashboard', () => {
    const rootRoute = routes.find((r) => r.path === '');
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.redirectTo).toBe('dashboard');
  });

  it('should have a dashboard route', () => {
    const route = routes.find((r) => r.path === 'dashboard');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a contacts route', () => {
    const route = routes.find((r) => r.path === 'contacts');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a contact detail route', () => {
    const route = routes.find((r) => r.path === 'contacts/:id');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a projects route', () => {
    const route = routes.find((r) => r.path === 'projects');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a calendar route', () => {
    const route = routes.find((r) => r.path === 'calendar');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should redirect documents to documents/contracts', () => {
    const route = routes.find((r) => r.path === 'documents');
    expect(route).toBeTruthy();
    expect(route!.redirectTo).toBe('documents/contracts');
  });

  it('should have a contracts route', () => {
    const route = routes.find((r) => r.path === 'documents/contracts');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have an invoices route', () => {
    const route = routes.find((r) => r.path === 'documents/invoices');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a bookings route', () => {
    const route = routes.find((r) => r.path === 'bookings');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have an inbox route', () => {
    const route = routes.find((r) => r.path === 'inbox');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a reports route', () => {
    const route = routes.find((r) => r.path === 'reports');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a settings route', () => {
    const route = routes.find((r) => r.path === 'settings');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a notification settings route', () => {
    const route = routes.find((r) => r.path === 'settings/notifications');
    expect(route).toBeTruthy();
    expect(route!.loadComponent).toBeDefined();
  });

  it('should have a wildcard redirect to dashboard', () => {
    const route = routes.find((r) => r.path === '**');
    expect(route).toBeTruthy();
    expect(route!.redirectTo).toBe('dashboard');
  });

  it('should have title data on dashboard route', () => {
    const route = routes.find((r) => r.path === 'dashboard');
    expect(route!.data!['title']).toBe('Dashboard');
  });

  it('should have title data on contacts route', () => {
    const route = routes.find((r) => r.path === 'contacts');
    expect(route!.data!['title']).toBe('Contacts');
  });

  it('should have title data on projects route', () => {
    const route = routes.find((r) => r.path === 'projects');
    expect(route!.data!['title']).toBe('Projects');
  });

  it('should have title data on calendar route', () => {
    const route = routes.find((r) => r.path === 'calendar');
    expect(route!.data!['title']).toBe('Calendar');
  });

  it('should have title data on bookings route', () => {
    const route = routes.find((r) => r.path === 'bookings');
    expect(route!.data!['title']).toBe('Bookings');
  });

  it('should have title data on inbox route', () => {
    const route = routes.find((r) => r.path === 'inbox');
    expect(route!.data!['title']).toBe('Inbox');
  });

  it('should have title data on reports route', () => {
    const route = routes.find((r) => r.path === 'reports');
    expect(route!.data!['title']).toBe('Reports');
  });

  it('should have title data on settings route', () => {
    const route = routes.find((r) => r.path === 'settings');
    expect(route!.data!['title']).toBe('Settings');
  });

  it('should have icon data on each route', () => {
    const routesWithIcon = routes.filter((r) => r.data && r.data['icon']);
    expect(routesWithIcon.length).toBeGreaterThanOrEqual(9);
  });
});
