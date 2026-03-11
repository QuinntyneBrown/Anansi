import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG } from 'api';
import { SidebarComponent } from './sidebar.component';
import { Component } from '@angular/core';

const DUMMY_ICON = [['path', { d: 'M0 0' }]] as const;

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return DUMMY_ICON; }
}

@Component({ selector: 'sm-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'contacts', component: DummyComponent },
          { path: 'projects', component: DummyComponent },
          { path: 'calendar', component: DummyComponent },
          { path: 'bookings', component: DummyComponent },
          { path: 'galleries', component: DummyComponent },
          { path: 'store', component: DummyComponent },
          { path: 'quotes', component: DummyComponent },
          { path: 'questionnaires', component: DummyComponent },
          { path: 'documents', component: DummyComponent },
          { path: 'inbox', component: DummyComponent },
          { path: 'reports', component: DummyComponent },
          { path: 'settings', component: DummyComponent },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 13 nav items', () => {
    expect(component.navItems.length).toBe(13);
  });

  it('should have Dashboard as first nav item', () => {
    expect(component.navItems[0].label).toBe('Dashboard');
    expect(component.navItems[0].route).toBe('/dashboard');
  });

  it('should have Contacts as second nav item', () => {
    expect(component.navItems[1].label).toBe('Contacts');
    expect(component.navItems[1].route).toBe('/contacts');
  });

  it('should have Projects as third nav item', () => {
    expect(component.navItems[2].label).toBe('Projects');
    expect(component.navItems[2].route).toBe('/projects');
  });

  it('should have Calendar as fourth nav item', () => {
    expect(component.navItems[3].label).toBe('Calendar');
    expect(component.navItems[3].route).toBe('/calendar');
  });

  it('should have Bookings as fifth nav item', () => {
    expect(component.navItems[4].label).toBe('Bookings');
    expect(component.navItems[4].route).toBe('/bookings');
  });

  it('should have Galleries as sixth nav item', () => {
    expect(component.navItems[5].label).toBe('Galleries');
    expect(component.navItems[5].route).toBe('/galleries');
  });

  it('should have Store as seventh nav item', () => {
    expect(component.navItems[6].label).toBe('Store');
    expect(component.navItems[6].route).toBe('/store');
  });

  it('should have Quotes as eighth nav item', () => {
    expect(component.navItems[7].label).toBe('Quotes');
    expect(component.navItems[7].route).toBe('/quotes');
  });

  it('should have Questionnaires as ninth nav item', () => {
    expect(component.navItems[8].label).toBe('Questionnaires');
    expect(component.navItems[8].route).toBe('/questionnaires');
  });

  it('should have Documents as tenth nav item', () => {
    expect(component.navItems[9].label).toBe('Documents');
    expect(component.navItems[9].route).toBe('/documents');
  });

  it('should have Inbox as eleventh nav item', () => {
    expect(component.navItems[10].label).toBe('Inbox');
    expect(component.navItems[10].route).toBe('/inbox');
  });

  it('should have Reports as twelfth nav item', () => {
    expect(component.navItems[11].label).toBe('Reports');
    expect(component.navItems[11].route).toBe('/reports');
  });

  it('should have Settings as last nav item', () => {
    expect(component.navItems[12].label).toBe('Settings');
    expect(component.navItems[12].route).toBe('/settings');
  });

  it('should initialize collapsed to false', () => {
    expect(component.collapsed()).toBe(false);
  });

  it('should toggle collapsed state', () => {
    expect(component.collapsed()).toBe(false);
    component.toggleCollapse();
    expect(component.collapsed()).toBe(true);
    component.toggleCollapse();
    expect(component.collapsed()).toBe(false);
  });

  it('should initialize mobileOpen to false', () => {
    expect(component.mobileOpen()).toBe(false);
  });

  it('should open mobile sidebar', () => {
    component.openMobile();
    expect(component.mobileOpen()).toBe(true);
  });

  it('should close mobile sidebar', () => {
    component.openMobile();
    expect(component.mobileOpen()).toBe(true);
    component.closeMobile();
    expect(component.mobileOpen()).toBe(false);
  });

  it('should check if a route is active', () => {
    component.currentRoute.set('/dashboard');
    expect(component.isActive('/dashboard')).toBe(true);
    expect(component.isActive('/contacts')).toBe(false);
  });

  it('should match nested routes as active', () => {
    component.currentRoute.set('/documents/contracts');
    expect(component.isActive('/documents')).toBe(true);
    expect(component.isActive('/contacts')).toBe(false);
  });

  it('should navigate when navigate is called', async () => {
    fixture.detectChanges();
    httpTesting.match(() => true);

    await router.navigate(['/contacts']);
    expect(router.url).toBe('/contacts');
  });

  it('should render the sidebar element', () => {
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should render logo text when not collapsed', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.sidebar__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Anansi');
  });

  it('should render logo icon when collapsed', () => {
    component.collapsed.set(true);
    fixture.detectChanges();
    const logoIcon = fixture.nativeElement.querySelector('.sidebar__logo-icon');
    expect(logoIcon).toBeTruthy();
    expect(logoIcon.textContent).toContain('A');
  });

  it('should render sidebar-item components', () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('lib-sidebar-item');
    expect(items.length).toBe(13);
  });

  it('should render subtitle when not collapsed', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.sidebar__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Studio Manager');
  });

  it('should render collapse toggle button', () => {
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.sidebar__collapse-btn');
    expect(btn).toBeTruthy();
  });

  it('should apply collapsed class when collapsed', () => {
    component.collapsed.set(true);
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar.classList.contains('sidebar--collapsed')).toBe(true);
  });

  it('should apply mobile-open class when mobileOpen', () => {
    component.mobileOpen.set(true);
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar.classList.contains('sidebar--mobile-open')).toBe(true);
  });

  it('should render overlay when mobileOpen', () => {
    component.mobileOpen.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.sidebar__overlay');
    expect(overlay).toBeTruthy();
  });

  it('should not render overlay when mobile is closed', () => {
    component.mobileOpen.set(false);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.sidebar__overlay');
    expect(overlay).toBeNull();
  });

  it('should close mobile when overlay is clicked', () => {
    component.mobileOpen.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.sidebar__overlay');
    overlay.click();
    expect(component.mobileOpen()).toBe(false);
  });

  it('should fetch unread count on init', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/notifications/unread-count`);
    req.flush({ count: 5 });
    expect(component.unreadCount()).toBe(5);
  });

  it('should handle unread count API error gracefully', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/notifications/unread-count`);
    req.flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.unreadCount()).toBe(0);
  });

  it('should close mobile sidebar on navigation', async () => {
    fixture.detectChanges();
    httpTesting.match(() => true);

    component.openMobile();
    expect(component.mobileOpen()).toBe(true);

    await router.navigate(['/contacts']);
    expect(component.mobileOpen()).toBe(false);
  });

  it('should update currentRoute on navigation', async () => {
    fixture.detectChanges();
    httpTesting.match(() => true);

    await router.navigate(['/reports']);
    expect(component.currentRoute()).toBe('/reports');
  });

  it('should unsubscribe from router events on destroy', () => {
    fixture.detectChanges();
    httpTesting.match(() => true);
    component.ngOnDestroy();
  });

  it('should not have collapsed class by default', () => {
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar.classList.contains('sidebar--collapsed')).toBe(false);
  });

  it('should hide subtitle when collapsed', () => {
    component.collapsed.set(true);
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.sidebar__subtitle');
    expect(subtitle).toBeNull();
  });

  it('should hide logo when collapsed', () => {
    component.collapsed.set(true);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.sidebar__logo');
    expect(logo).toBeNull();
  });
});
