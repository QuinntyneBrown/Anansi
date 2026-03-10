import { routes } from './app.routes';

describe('Booking Site Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to book', () => {
    const rootRoute = routes.find((r) => r.path === '' && r.redirectTo);
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.redirectTo).toBe('book');
    expect(rootRoute!.pathMatch).toBe('full');
  });

  it('should have book route', () => {
    const route = routes.find((r) => r.path === 'book');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Book a Session' });
  });

  it('should have book/:sessionTypeId route', () => {
    const route = routes.find((r) => r.path === 'book/:sessionTypeId');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Book' });
  });

  it('should have wildcard redirect to book', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeTruthy();
    expect(wildcard!.redirectTo).toBe('book');
  });

  it('should lazy-load SessionTypeSelectionComponent for book route', async () => {
    const route = routes.find((r) => r.path === 'book');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load BookingFormComponent for book/:sessionTypeId route', async () => {
    const route = routes.find((r) => r.path === 'book/:sessionTypeId');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should have correct number of routes', () => {
    expect(routes.length).toBe(4);
  });

  it('should use loadComponent for all content routes', () => {
    const contentRoutes = routes.filter((r) => r.loadComponent);
    expect(contentRoutes.length).toBe(2);
  });
});
