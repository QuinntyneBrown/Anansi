import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputGroupComponent } from './input-group.component';

@Component({
  standalone: true,
  imports: [InputGroupComponent, ReactiveFormsModule],
  template: `<lib-input-group [formControl]="ctrl" />`,
})
class TestHostComponent {
  ctrl = new FormControl('');
}

describe('InputGroupComponent', () => {
  let component: InputGroupComponent;
  let fixture: ComponentFixture<InputGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputGroupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders label when provided', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.input-group__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Email');
  });

  it('does not render label when empty', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.input-group__label');
    expect(label).toBeNull();
  });

  it('renders placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Enter email');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.placeholder).toBe('Enter email');
  });

  it('binds value', () => {
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('hello');
  });

  it('emits value on input', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'new value';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toBe('new value');
  });

  it('shows error message when set', () => {
    fixture.componentRef.setInput('errorMessage', 'Required field');
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.input-group__error');
    expect(error).toBeTruthy();
    expect(error.textContent.trim()).toBe('Required field');
  });

  it('applies error styles to input when errorMessage is set', () => {
    fixture.componentRef.setInput('errorMessage', 'Error');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input-group__input--error')).toBe(true);
  });

  it('does not show error when errorMessage is null', () => {
    fixture.componentRef.setInput('errorMessage', null);
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.input-group__error');
    expect(error).toBeNull();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input-group__input--error')).toBe(false);
  });

  it('sets disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('sets input type', () => {
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('email');
  });

  it('defaults type to text', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('text');
  });

  describe('ControlValueAccessor', () => {
    it('writeValue sets the value', () => {
      component.writeValue('test');
      fixture.detectChanges();
      expect(component.value()).toBe('test');
    });

    it('writeValue handles null', () => {
      component.writeValue(null as unknown as string);
      fixture.detectChanges();
      expect(component.value()).toBe('');
    });

    it('registerOnChange is called on input', () => {
      const spy = vi.fn();
      component.registerOnChange(spy);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'changed';
      input.dispatchEvent(new Event('input'));
      expect(spy).toHaveBeenCalledWith('changed');
    });

    it('registerOnTouched is called on blur', () => {
      const spy = vi.fn();
      component.registerOnTouched(spy);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));
      expect(spy).toHaveBeenCalled();
    });

    it('works with reactive forms', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      const host = hostFixture.componentInstance;
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      host.ctrl.setValue('reactive value');
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('reactive value');

      input.value = 'user typed';
      input.dispatchEvent(new Event('input'));
      expect(host.ctrl.value).toBe('user typed');
    });
  });
});
