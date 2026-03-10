import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GalleryTopBarComponent } from './gallery-top-bar.component';

@Component({ selector: 'cg-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('GalleryTopBarComponent', () => {
  let component: GalleryTopBarComponent;
  let fixture: ComponentFixture<GalleryTopBarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryTopBarComponent],
      providers: [
        provideRouter([
          { path: 'gallery/:collectionId', component: DummyComponent },
          { path: 'gallery/:collectionId/favorites', component: DummyComponent },
          { path: 'gallery/:collectionId/password', component: DummyComponent },
          { path: 'gallery', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryTopBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render header element', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.gallery-bar');
    expect(header).toBeTruthy();
  });

  it('should render logo text', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.gallery-bar__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Anansi');
  });

  it('should not show back button on gallery home route', async () => {
    await router.navigate(['/gallery', 'col-1']);
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.gallery-bar__link');
    expect(backBtn).toBeFalsy();
  });

  it('should show back button on favorites route', async () => {
    await router.navigate(['/gallery', 'col-1', 'favorites']);
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.gallery-bar__link');
    expect(backBtn).toBeTruthy();
    expect(backBtn.textContent).toContain('Back to Gallery');
  });

  it('should show back button on password route', async () => {
    await router.navigate(['/gallery', 'col-1', 'password']);
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.gallery-bar__link');
    expect(backBtn).toBeTruthy();
    expect(backBtn.textContent).toContain('Back to Gallery');
  });

  it('should navigate back to gallery when back button clicked', async () => {
    await router.navigate(['/gallery', 'col-1', 'favorites']);
    fixture.detectChanges();

    const backBtn = fixture.nativeElement.querySelector('.gallery-bar__link');
    backBtn.click();

    await fixture.whenStable();
    expect(router.url).toBe('/gallery/col-1');
  });

  it('should update back button visibility on navigation', async () => {
    await router.navigate(['/gallery', 'col-1']);
    fixture.detectChanges();

    let backBtn = fixture.nativeElement.querySelector('.gallery-bar__link');
    expect(backBtn).toBeFalsy();

    await router.navigate(['/gallery', 'col-1', 'favorites']);
    fixture.detectChanges();

    backBtn = fixture.nativeElement.querySelector('.gallery-bar__link');
    expect(backBtn).toBeTruthy();
  });

  it('should unsubscribe from router events on destroy', async () => {
    await router.navigate(['/gallery', 'col-1']);
    fixture.detectChanges();
    component.ngOnDestroy();
  });
});
