import { routes } from './app.routes';

describe('Online Store Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to shop', () => {
    const rootRoute = routes.find((r) => r.path === '' && r.redirectTo);
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.redirectTo).toBe('shop');
    expect(rootRoute!.pathMatch).toBe('full');
  });

  it('should have shop route', () => {
    const route = routes.find((r) => r.path === 'shop');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Shop' });
  });

  it('should have cart route', () => {
    const route = routes.find((r) => r.path === 'cart');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Cart' });
  });

  it('should have checkout route', () => {
    const route = routes.find((r) => r.path === 'checkout');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Checkout' });
  });

  it('should have wildcard redirect to shop', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeTruthy();
    expect(wildcard!.redirectTo).toBe('shop');
  });

  it('should lazy-load StoreBrowsePageComponent for shop route', async () => {
    const route = routes.find((r) => r.path === 'shop');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load CartPageComponent for cart route', async () => {
    const route = routes.find((r) => r.path === 'cart');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load CheckoutPageComponent for checkout route', async () => {
    const route = routes.find((r) => r.path === 'checkout');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should have correct number of routes', () => {
    expect(routes.length).toBe(5);
  });

  it('should use loadComponent for all content routes', () => {
    const contentRoutes = routes.filter((r) => r.loadComponent);
    expect(contentRoutes.length).toBe(3);
  });
});
