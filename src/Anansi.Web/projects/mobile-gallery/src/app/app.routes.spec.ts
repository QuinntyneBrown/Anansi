import { routes } from './app.routes';

describe('Mobile Gallery Routes', () => {
  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to gallery', () => {
    const rootRoute = routes.find((r) => r.path === '' && r.redirectTo);
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.redirectTo).toBe('gallery');
    expect(rootRoute!.pathMatch).toBe('full');
  });

  it('should have gallery/:collectionId route', () => {
    const route = routes.find((r) => r.path === 'gallery/:collectionId');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Gallery' });
  });

  it('should have gallery/:collectionId/favorites route', () => {
    const route = routes.find((r) => r.path === 'gallery/:collectionId/favorites');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Favorites' });
  });

  it('should have gallery/:collectionId/password route', () => {
    const route = routes.find((r) => r.path === 'gallery/:collectionId/password');
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Password Required' });
  });

  it('should have gallery fallback route', () => {
    const route = routes.find((r) => r.path === 'gallery' && r.loadComponent);
    expect(route).toBeTruthy();
    expect(route!.data).toEqual({ title: 'Gallery' });
  });

  it('should have wildcard redirect to gallery', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeTruthy();
    expect(wildcard!.redirectTo).toBe('gallery');
  });

  it('should lazy-load GalleryHomePageComponent for gallery/:collectionId route', async () => {
    const route = routes.find((r) => r.path === 'gallery/:collectionId');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load FavoritesPageComponent for favorites route', async () => {
    const route = routes.find((r) => r.path === 'gallery/:collectionId/favorites');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should lazy-load PasswordEntryComponent for password route', async () => {
    const route = routes.find((r) => r.path === 'gallery/:collectionId/password');
    expect(route!.loadComponent).toBeDefined();
    const component = await (route!.loadComponent as Function)();
    expect(component).toBeDefined();
    expect(typeof component).toBe('function');
  });

  it('should have correct number of routes', () => {
    expect(routes.length).toBe(6);
  });

  it('should use loadComponent for all content routes', () => {
    const contentRoutes = routes.filter((r) => r.loadComponent);
    expect(contentRoutes.length).toBe(4);
  });
});
