import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StoreTopBarComponent } from './store-top-bar.component';

@Component({ selector: 'os-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('StoreTopBarComponent', () => {
  let component: StoreTopBarComponent;
  let fixture: ComponentFixture<StoreTopBarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreTopBarComponent],
      providers: [
        provideRouter([
          { path: 'shop', component: DummyComponent },
          { path: 'cart', component: DummyComponent },
          { path: 'checkout', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreTopBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render header element', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.store-bar');
    expect(header).toBeTruthy();
  });

  it('should render logo text', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.store-bar__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Anansi');
  });

  it('should render store subtitle', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.store-bar__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Store');
  });

  it('should render cart button', () => {
    fixture.detectChanges();
    const cartBtn = fixture.nativeElement.querySelector('.store-bar__cart-btn');
    expect(cartBtn).toBeTruthy();
  });

  it('should not show cart badge when count is 0', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.store-bar__cart-badge');
    expect(badge).toBeFalsy();
  });

  it('should show cart badge when count is positive', () => {
    component.cartItemCount.set(3);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.store-bar__cart-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('3');
  });

  it('should navigate to shop when brand is clicked', async () => {
    fixture.detectChanges();
    const brand = fixture.nativeElement.querySelector('.store-bar__brand');
    brand.click();
    await fixture.whenStable();
    expect(router.url).toBe('/shop');
  });

  it('should navigate to cart when cart button is clicked', async () => {
    fixture.detectChanges();
    const cartBtn = fixture.nativeElement.querySelector('.store-bar__cart-btn');
    cartBtn.click();
    await fixture.whenStable();
    expect(router.url).toBe('/cart');
  });

  it('should initialize cart count to 0', () => {
    expect(component.cartItemCount()).toBe(0);
  });
});
