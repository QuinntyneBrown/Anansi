import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaGroupComponent } from './textarea-group.component';

@Component({
  standalone: true,
  imports: [TextareaGroupComponent, ReactiveFormsModule],
  template: `<lib-textarea-group [formControl]="ctrl" />`,
})
class TestHostComponent {
  ctrl = new FormControl('');
}

describe('TextareaGroupComponent', () => {
  let component: TextareaGroupComponent;
  let fixture: ComponentFixture<TextareaGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaGroupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a textarea element', () => {
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('renders label when provided', () => {
    fixture.componentRef.setInput('label', 'Description');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.textarea-group__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Description');
  });

  it('does not render label when empty', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.textarea-group__label');
    expect(label).toBeNull();
  });

  it('renders placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Enter description');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.placeholder).toBe('Enter description');
  });

  it('binds value', () => {
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.value).toBe('hello');
  });

  it('emits value on input', () => {
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'new value';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toBe('new value');
  });

  it('shows error message when set', () => {
    fixture.componentRef.setInput('errorMessage', 'Required field');
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.textarea-group__error');
    expect(error).toBeTruthy();
    expect(error.textContent.trim()).toBe('Required field');
  });

  it('applies error styles to textarea when errorMessage is set', () => {
    fixture.componentRef.setInput('errorMessage', 'Error');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.classList.contains('textarea-group__input--error')).toBe(true);
  });

  it('does not show error when errorMessage is null', () => {
    fixture.componentRef.setInput('errorMessage', null);
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.textarea-group__error');
    expect(error).toBeNull();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.classList.contains('textarea-group__input--error')).toBe(false);
  });

  it('sets disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.disabled).toBe(true);
  });

  it('respects rows input', () => {
    fixture.componentRef.setInput('rows', 8);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.rows).toBe(8);
  });

  it('defaults rows to 4', () => {
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.rows).toBe(4);
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
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'changed';
      textarea.dispatchEvent(new Event('input'));
      expect(spy).toHaveBeenCalledWith('changed');
    });

    it('registerOnTouched is called on blur', () => {
      const spy = vi.fn();
      component.registerOnTouched(spy);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      textarea.dispatchEvent(new Event('blur'));
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

      const textarea = hostFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('reactive value');

      textarea.value = 'user typed';
      textarea.dispatchEvent(new Event('input'));
      expect(host.ctrl.value).toBe('user typed');
    });
  });
});
