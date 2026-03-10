import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to success variant', () => {
    expect(component.variant).toBe('success');
    expect(component.accentColor).toBe('#6E9E6E');
  });

  it('should render success variant with correct accent color and icon', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const accentBar = fixture.nativeElement.querySelector('.accent-bar') as HTMLElement;
    expect(accentBar.style.backgroundColor).toContain('110, 158, 110');

    const icon = fixture.nativeElement.querySelector('.icon svg');
    expect(icon).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.icon svg circle')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.icon svg path[d="m9 12 2 2 4-4"]')).toBeTruthy();
  });

  it('should render error variant with correct accent color and icon', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.detectChanges();

    const accentBar = fixture.nativeElement.querySelector('.accent-bar') as HTMLElement;
    expect(accentBar.style.backgroundColor).toContain('201, 74, 74');

    expect(component.accentColor).toBe('#C94A4A');
    const icon = fixture.nativeElement.querySelector('.icon svg');
    expect(icon).toBeTruthy();
  });

  it('should render warning variant with correct accent color and icon', () => {
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();

    const accentBar = fixture.nativeElement.querySelector('.accent-bar') as HTMLElement;
    expect(accentBar.style.backgroundColor).toContain('201, 169, 98');

    expect(component.accentColor).toBe('#C9A962');
    const icon = fixture.nativeElement.querySelector('.icon svg');
    expect(icon).toBeTruthy();
  });

  it('should show title and message', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('message', 'Test message body');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.title');
    const message = fixture.nativeElement.querySelector('.message');
    expect(title.textContent).toBe('Test Title');
    expect(message.textContent).toBe('Test message body');
  });

  it('should emit dismissed when close button is clicked', () => {
    const spy = vi.spyOn(component.dismissed, 'emit');

    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();

    expect(spy).toHaveBeenCalled();
  });
});
