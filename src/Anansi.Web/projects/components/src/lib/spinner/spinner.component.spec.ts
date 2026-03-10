import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  let component: SpinnerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default size of 24px', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner');
    expect(spinner.style.width).toBe('24px');
    expect(spinner.style.height).toBe('24px');
  });

  it('should render with custom size', () => {
    fixture.componentRef.setInput('size', 48);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.spinner');
    expect(spinner.style.width).toBe('48px');
    expect(spinner.style.height).toBe('48px');
  });

  it('should have spinner class for animation', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner');
    expect(spinner).toBeTruthy();
    expect(spinner.classList.contains('spinner')).toBe(true);
  });
});
