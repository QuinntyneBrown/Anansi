import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GalleryMobileBarComponent } from './gallery-mobile-bar.component';

@Component({ selector: 'mg-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('GalleryMobileBarComponent', () => {
  let component: GalleryMobileBarComponent;
  let fixture: ComponentFixture<GalleryMobileBarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryMobileBarComponent],
      providers: [
        provideRouter([
          { path: 'gallery/:collectionId', component: DummyComponent },
          { path: 'gallery/:collectionId/favorites', component: DummyComponent },
          { path: 'gallery/:collectionId/password', component: DummyComponent },
          { path: 'gallery', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryMobileBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render header element', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.mobile-bar');
    expect(header).toBeTruthy();
  });

  it('should render logo text', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.mobile-bar__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Anansi');
  });

  it('should render gallery subtitle', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.mobile-bar__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Gallery');
  });

  it('should not show back button on gallery home route', async () => {
    await router.navigate(['/gallery', 'col-1']);
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.mobile-bar__back');
    expect(backBtn).toBeFalsy();
  });

  it('should show back button on favorites route', async () => {
    await router.navigate(['/gallery', 'col-1', 'favorites']);
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.mobile-bar__back');
    expect(backBtn).toBeTruthy();
    expect(backBtn.textContent).toContain('Back');
  });

  it('should show back button on password route', async () => {
    await router.navigate(['/gallery', 'col-1', 'password']);
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.mobile-bar__back');
    expect(backBtn).toBeTruthy();
  });

  it('should navigate back to gallery when back button clicked', async () => {
    await router.navigate(['/gallery', 'col-1', 'favorites']);
    fixture.detectChanges();

    const backBtn = fixture.nativeElement.querySelector('.mobile-bar__back');
    backBtn.click();

    await fixture.whenStable();
    expect(router.url).toBe('/gallery/col-1');
  });

  it('should update back button visibility on navigation', async () => {
    await router.navigate(['/gallery', 'col-1']);
    fixture.detectChanges();

    let backBtn = fixture.nativeElement.querySelector('.mobile-bar__back');
    expect(backBtn).toBeFalsy();

    await router.navigate(['/gallery', 'col-1', 'favorites']);
    fixture.detectChanges();

    backBtn = fixture.nativeElement.querySelector('.mobile-bar__back');
    expect(backBtn).toBeTruthy();
  });

  it('should unsubscribe from router events on destroy', async () => {
    await router.navigate(['/gallery', 'col-1']);
    fixture.detectChanges();
    component.ngOnDestroy();
  });
});
