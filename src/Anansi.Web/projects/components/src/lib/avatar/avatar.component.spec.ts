import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let component: AvatarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default user icon when no src or initials', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.classList.contains('avatar__icon')).toBe(true);
  });

  it('should render img when src is provided', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.png');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
  });

  it('should render initials when provided and no src', () => {
    fixture.componentRef.setInput('initials', 'AB');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.avatar__initials');
    expect(span).toBeTruthy();
    expect(span.textContent.trim()).toBe('AB');
  });

  it('should prefer src over initials', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('initials', 'AB');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    const span = fixture.nativeElement.querySelector('.avatar__initials');
    expect(img).toBeTruthy();
    expect(span).toBeNull();
  });

  it('should use default size of 40px', () => {
    const div = fixture.nativeElement.querySelector('.avatar');
    expect(div.style.width).toBe('40px');
    expect(div.style.height).toBe('40px');
  });

  it('should apply custom size', () => {
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('.avatar');
    expect(div.style.width).toBe('64px');
    expect(div.style.height).toBe('64px');
  });

  it('should set alt attribute on img', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('alt', 'User avatar');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe('User avatar');
  });
});
