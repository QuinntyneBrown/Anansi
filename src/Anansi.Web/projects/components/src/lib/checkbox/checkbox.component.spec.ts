import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

@Component({
  standalone: true,
  imports: [CheckboxComponent, ReactiveFormsModule],
  template: `<lib-checkbox [formControl]="ctrl" />`,
})
class TestHostComponent {
  ctrl = new FormControl(false);
}

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders unchecked by default', () => {
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('.checkbox__box');
    expect(box.classList.contains('checkbox__box--checked')).toBe(false);
    const icon = fixture.nativeElement.querySelector('svg');
    expect(icon).toBeNull();
  });

  it('toggles on click', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.checkbox');
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    const box = fixture.nativeElement.querySelector('.checkbox__box');
    expect(box.classList.contains('checkbox__box--checked')).toBe(true);
  });

  it('shows check icon when checked', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.checkbox');
    label.click();
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('toggles back to unchecked on second click', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.checkbox');
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(false);
  });

  it('disabled prevents toggle', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.checkbox');
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(false);
  });

  it('applies disabled class', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.checkbox');
    expect(label.classList.contains('checkbox--disabled')).toBe(true);
  });

  it('renders label when provided', () => {
    fixture.componentRef.setInput('label', 'Remember me');
    fixture.detectChanges();
    const labelEl = fixture.nativeElement.querySelector('.checkbox__label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent.trim()).toBe('Remember me');
  });

  it('does not render label when null', () => {
    fixture.componentRef.setInput('label', null);
    fixture.detectChanges();
    const labelEl = fixture.nativeElement.querySelector('.checkbox__label');
    expect(labelEl).toBeNull();
  });

  describe('ControlValueAccessor', () => {
    it('writeValue sets checked', () => {
      component.writeValue(true);
      fixture.detectChanges();
      expect(component.checked()).toBe(true);
    });

    it('writeValue handles falsy', () => {
      component.writeValue(null as unknown as boolean);
      fixture.detectChanges();
      expect(component.checked()).toBe(false);
    });

    it('registerOnChange is called on toggle', () => {
      const spy = vi.fn();
      component.registerOnChange(spy);
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.checkbox');
      label.click();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('registerOnTouched is called on toggle', () => {
      const spy = vi.fn();
      component.registerOnTouched(spy);
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.checkbox');
      label.click();
      expect(spy).toHaveBeenCalled();
    });

    it('works with reactive forms', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      const host = hostFixture.componentInstance;
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      host.ctrl.setValue(true);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const box = hostFixture.nativeElement.querySelector('.checkbox__box');
      expect(box.classList.contains('checkbox__box--checked')).toBe(true);

      const label = hostFixture.nativeElement.querySelector('.checkbox');
      label.click();
      hostFixture.detectChanges();
      expect(host.ctrl.value).toBe(false);
    });
  });
});
