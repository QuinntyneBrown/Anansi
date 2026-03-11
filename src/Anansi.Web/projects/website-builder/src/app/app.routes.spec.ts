import { routes } from './app.routes';

describe('Website Builder Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to sites', () => {
    const rootRoute = routes.find((r) => r.path === '' && r.redirectTo);
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.redirectTo).toBe('sites');
    expect(rootRoute!.pathMatch).toBe('full');
  });

  it('should have a sites route', () => {
    const route = routes.find((r) => r.path === 'sites');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Websites' });
  });

  it('should have a site templates route', () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/templates');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Templates' });
  });

  it('should have a site pages route', () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/pages');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Pages' });
  });

  it('should have a site blog route', () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/blog');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Blog' });
  });

  it('should have a site seo route', () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/seo');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'SEO Manager' });
  });

  it('should have a site analytics route', () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/analytics');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Analytics' });
  });

  it('should have wildcard redirect to sites', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeTruthy();
    expect(wildcard!.redirectTo).toBe('sites');
  });

  it('should lazy-load website list page', async () => {
    const route = routes.find((r) => r.path === 'sites');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load TemplateGalleryPageComponent', async () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/templates');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load PageManagerComponent', async () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/pages');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load BlogManagerPageComponent', async () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/blog');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load SeoManagerComponent', async () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/seo');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load WebsiteAnalyticsPageComponent', async () => {
    const route = routes.find((r) => r.path === 'sites/:websiteId/analytics');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should have correct number of routes', () => {
    expect(routes.length).toBe(8);
  });

  it('should use loadComponent for all content routes', () => {
    const contentRoutes = routes.filter((r) => r.loadComponent);
    expect(contentRoutes.length).toBe(6);
  });
});
