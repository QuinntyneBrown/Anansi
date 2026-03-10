import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BookingTopBarComponent } from './booking-top-bar.component';

@Component({ selector: 'bs-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('BookingTopBarComponent', () => {
  let component: BookingTopBarComponent;
  let fixture: ComponentFixture<BookingTopBarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingTopBarComponent],
      providers: [
        provideRouter([
          { path: 'book', component: DummyComponent },
          { path: 'book/:sessionTypeId', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingTopBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render header element', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.booking-bar');
    expect(header).toBeTruthy();
  });

  it('should render logo text', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.booking-bar__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Anansi');
  });

  it('should render booking subtitle', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.booking-bar__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Book a Session');
  });

  it('should render brand section as clickable', () => {
    fixture.detectChanges();
    const brand = fixture.nativeElement.querySelector('.booking-bar__brand');
    expect(brand).toBeTruthy();
    expect(brand.getAttribute('role')).toBe('button');
    expect(brand.getAttribute('tabindex')).toBe('0');
  });

  it('should navigate to /book when brand is clicked', async () => {
    fixture.detectChanges();
    const brand = fixture.nativeElement.querySelector('.booking-bar__brand');
    brand.click();
    await fixture.whenStable();
    expect(router.url).toBe('/book');
  });

  it('should have correct logo font styling', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.booking-bar__logo');
    const styles = getComputedStyle(logo);
    expect(styles.color).toBeTruthy();
  });

  it('should have correct header height', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.booking-bar');
    expect(header).toBeTruthy();
  });

  it('should have brand with cursor pointer', () => {
    fixture.detectChanges();
    const brand = fixture.nativeElement.querySelector('.booking-bar__brand');
    const styles = getComputedStyle(brand);
    expect(styles.cursor).toBe('pointer');
  });
});
