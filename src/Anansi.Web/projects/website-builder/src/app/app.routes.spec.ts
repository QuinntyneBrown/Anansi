import { routes } from './app.routes';

describe('Website Builder Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to templates', () => {
    const rootRoute = routes.find((r) => r.path === '' && r.redirectTo);
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.redirectTo).toBe('templates');
    expect(rootRoute!.pathMatch).toBe('full');
  });

  it('should have templates route', () => {
    const route = routes.find((r) => r.path === 'templates');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Templates' });
  });

  it('should have pages route', () => {
    const route = routes.find((r) => r.path === 'pages');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Pages' });
  });

  it('should have seo route', () => {
    const route = routes.find((r) => r.path === 'seo');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'SEO Manager' });
  });

  it('should have wildcard redirect to templates', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeTruthy();
    expect(wildcard!.redirectTo).toBe('templates');
  });

  it('should lazy-load TemplateGalleryPageComponent', async () => {
    const route = routes.find((r) => r.path === 'templates');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load PageManagerComponent', async () => {
    const route = routes.find((r) => r.path === 'pages');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load SeoManagerComponent', async () => {
    const route = routes.find((r) => r.path === 'seo');
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
