import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent, ButtonVariant } from './button.component';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

const Plus = [['path', { d: 'M5 12h14' }], ['path', { d: 'M12 5v14' }]] as any;
const Trash2 = [['path', { d: 'M3 6h18' }], ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }]] as any;

@Component({
  imports: [ButtonComponent],
  template: `<lib-button>Click me</lib-button>`,
})
class TestHostComponent {}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, TestHostComponent],
      providers: [
        { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Plus, Trash2 }) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create with default primary variant', () => {
    expect(component).toBeTruthy();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('btn-primary')).toBe(true);
  });

  it('should render projected content', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    await hostFixture.whenStable();
    const button = hostFixture.nativeElement.querySelector('button');
    expect(button.textContent.trim()).toBe('Click me');
  });

  describe('variant classes', () => {
    const variants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive'];

    variants.forEach((variant) => {
      it(`should apply btn-${variant} class for '${variant}' variant`, () => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        expect(button.classList.contains(`btn-${variant}`)).toBe(true);
      });
    });
  });

  describe('icon', () => {
    it('should show lucide-icon when icon input is provided', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.detectChanges();
      const iconEl = fixture.nativeElement.querySelector('lucide-icon');
      expect(iconEl).toBeTruthy();
    });

    it('should hide icon when no icon input is set', () => {
      const iconEl = fixture.nativeElement.querySelector('lucide-icon');
      expect(iconEl).toBeNull();
    });
  });

  describe('clicked output', () => {
    it('should emit clicked event on click', () => {
      const spy = vi.fn();
      component.clicked.subscribe(spy);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    });

    it('should NOT emit clicked when disabled', () => {
      const spy = vi.fn();
      component.clicked.subscribe(spy);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('disabled attribute', () => {
    it('should apply disabled attribute to native button when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should not have disabled attribute when disabled is false', () => {
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(false);
    });
  });

  describe('type attribute', () => {
    it('should default to type="button"', () => {
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.type).toBe('button');
    });

    it('should apply type="submit" when set', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.type).toBe('submit');
    });

    it('should apply type="reset" when set', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.type).toBe('reset');
    });
  });
});
