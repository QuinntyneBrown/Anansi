import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MobileTabBarComponent } from './mobile-tab-bar.component';
import { Component } from '@angular/core';

@Component({ selector: 'sm-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('MobileTabBarComponent', () => {
  let component: MobileTabBarComponent;
  let fixture: ComponentFixture<MobileTabBarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileTabBarComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'contacts', component: DummyComponent },
          { path: 'calendar', component: DummyComponent },
          { path: 'inbox', component: DummyComponent },
          { path: 'settings', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileTabBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 tabs', () => {
    expect(component.tabs.length).toBe(5);
  });

  it('should have Home as first tab', () => {
    expect(component.tabs[0].label).toBe('Home');
    expect(component.tabs[0].route).toBe('/dashboard');
  });

  it('should have Contacts as second tab', () => {
    expect(component.tabs[1].label).toBe('Contacts');
    expect(component.tabs[1].route).toBe('/contacts');
  });

  it('should have Calendar as third tab', () => {
    expect(component.tabs[2].label).toBe('Calendar');
    expect(component.tabs[2].route).toBe('/calendar');
  });

  it('should have Inbox as fourth tab', () => {
    expect(component.tabs[3].label).toBe('Inbox');
    expect(component.tabs[3].route).toBe('/inbox');
  });

  it('should have More as last tab', () => {
    expect(component.tabs[4].label).toBe('More');
    expect(component.tabs[4].route).toBe('/settings');
  });

  it('should check if a route is active', () => {
    component.currentRoute.set('/dashboard');
    expect(component.isActive('/dashboard')).toBe(true);
    expect(component.isActive('/contacts')).toBe(false);
  });

  it('should navigate when navigate is called', async () => {
    fixture.detectChanges();
    await router.navigate(['/contacts']);
    expect(router.url).toBe('/contacts');
  });

  it('should return correct icon for dashboard', () => {
    expect(component.getIcon('dashboard')).toBe('\u2302');
  });

  it('should return correct icon for contacts', () => {
    expect(component.getIcon('contacts')).toBe('\u263A');
  });

  it('should return correct icon for calendar', () => {
    expect(component.getIcon('calendar')).toBe('\u2637');
  });

  it('should return correct icon for inbox', () => {
    expect(component.getIcon('inbox')).toBe('\u2709');
  });

  it('should return correct icon for settings', () => {
    expect(component.getIcon('settings')).toBe('\u2699');
  });

  it('should return default icon for unknown icon name', () => {
    expect(component.getIcon('unknown')).toBe('\u25CF');
  });

  it('should render nav element', () => {
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.mobile-tabs');
    expect(nav).toBeTruthy();
  });

  it('should render 5 tab buttons', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.mobile-tabs__item');
    expect(buttons.length).toBe(5);
  });

  it('should apply active class to current route tab', async () => {
    fixture.detectChanges();
    await router.navigate(['/dashboard']);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.mobile-tabs__item');
    expect(buttons[0].classList.contains('mobile-tabs__item--active')).toBe(true);
    expect(buttons[1].classList.contains('mobile-tabs__item--active')).toBe(false);
  });

  it('should render tab labels', () => {
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.mobile-tabs__label');
    expect(labels[0].textContent).toContain('Home');
    expect(labels[1].textContent).toContain('Contacts');
  });

  it('should render tab icons', () => {
    fixture.detectChanges();
    const icons = fixture.nativeElement.querySelectorAll('.mobile-tabs__icon');
    expect(icons.length).toBe(5);
  });

  it('should update currentRoute on navigation', async () => {
    fixture.detectChanges();
    await router.navigate(['/calendar']);
    expect(component.currentRoute()).toBe('/calendar');
  });

  it('should unsubscribe from router events on destroy', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
  });

  it('should not apply active class to non-matching tabs', async () => {
    fixture.detectChanges();
    await router.navigate(['/inbox']);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.mobile-tabs__item');
    expect(buttons[0].classList.contains('mobile-tabs__item--active')).toBe(false);
    expect(buttons[3].classList.contains('mobile-tabs__item--active')).toBe(true);
  });

  it('should have aria-label attributes on tab buttons', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.mobile-tabs__item');
    expect(buttons[0].getAttribute('aria-label')).toBe('Home');
    expect(buttons[1].getAttribute('aria-label')).toBe('Contacts');
  });
});
