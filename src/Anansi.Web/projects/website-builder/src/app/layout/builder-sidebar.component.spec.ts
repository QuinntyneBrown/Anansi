import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BuilderSidebarComponent } from './builder-sidebar.component';

@Component({ selector: 'wb-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('BuilderSidebarComponent', () => {
  let component: BuilderSidebarComponent;
  let fixture: ComponentFixture<BuilderSidebarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderSidebarComponent],
      providers: [
        provideRouter([
          { path: 'templates', component: DummyComponent },
          { path: 'pages', component: DummyComponent },
          { path: 'seo', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuilderSidebarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render sidebar element', () => {
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.wb-sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should render logo text', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.wb-sidebar__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Anansi');
  });

  it('should render subtitle text', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.wb-sidebar__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Website Builder');
  });

  it('should render 3 navigation items', () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    expect(items.length).toBe(3);
  });

  it('should render correct navigation labels', () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    expect(items[0].textContent).toContain('Templates');
    expect(items[1].textContent).toContain('Pages');
    expect(items[2].textContent).toContain('SEO Manager');
  });

  it('should navigate to templates when clicked', async () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    items[0].click();
    await fixture.whenStable();
    expect(router.url).toBe('/templates');
  });

  it('should navigate to pages when clicked', async () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    items[1].click();
    await fixture.whenStable();
    expect(router.url).toBe('/pages');
  });

  it('should navigate to seo when clicked', async () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    items[2].click();
    await fixture.whenStable();
    expect(router.url).toBe('/seo');
  });

  it('should highlight active route', async () => {
    await router.navigate(['/templates']);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    expect(items[0].classList.contains('wb-sidebar__item--active')).toBe(true);
    expect(items[1].classList.contains('wb-sidebar__item--active')).toBe(false);
  });

  it('should update active state on navigation', async () => {
    await router.navigate(['/templates']);
    fixture.detectChanges();

    await router.navigate(['/pages']);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.wb-sidebar__item');
    expect(items[0].classList.contains('wb-sidebar__item--active')).toBe(false);
    expect(items[1].classList.contains('wb-sidebar__item--active')).toBe(true);
  });

  it('should have 3 navItems', () => {
    expect(component.navItems.length).toBe(3);
  });

  it('should unsubscribe from router on destroy', async () => {
    await router.navigate(['/templates']);
    fixture.detectChanges();
    component.ngOnDestroy();
  });
});
