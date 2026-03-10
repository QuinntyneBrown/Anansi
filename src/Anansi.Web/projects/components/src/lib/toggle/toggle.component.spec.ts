import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent } from './toggle.component';

@Component({
  standalone: true,
  imports: [ToggleComponent, ReactiveFormsModule],
  template: `<lib-toggle [formControl]="ctrl" />`,
})
class TestHostComponent {
  ctrl = new FormControl(false);
}

describe('ToggleComponent', () => {
  let component: ToggleComponent;
  let fixture: ComponentFixture<ToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders off state by default', () => {
    fixture.detectChanges();
    const track = fixture.nativeElement.querySelector('.toggle__track');
    expect(track.classList.contains('toggle__track--on')).toBe(false);
    const knob = fixture.nativeElement.querySelector('.toggle__knob');
    expect(knob.classList.contains('toggle__knob--on')).toBe(false);
  });

  it('toggles on click', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.toggle');
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    const track = fixture.nativeElement.querySelector('.toggle__track');
    expect(track.classList.contains('toggle__track--on')).toBe(true);
  });

  it('animates knob position on toggle', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.toggle');
    label.click();
    fixture.detectChanges();
    const knob = fixture.nativeElement.querySelector('.toggle__knob');
    expect(knob.classList.contains('toggle__knob--on')).toBe(true);
  });

  it('toggles back to off on second click', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.toggle');
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(false);
    const track = fixture.nativeElement.querySelector('.toggle__track');
    expect(track.classList.contains('toggle__track--on')).toBe(false);
  });

  it('disabled prevents toggle', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.toggle');
    label.click();
    fixture.detectChanges();
    expect(component.checked()).toBe(false);
  });

  it('applies disabled class', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.toggle');
    expect(label.classList.contains('toggle--disabled')).toBe(true);
  });

  it('renders label when provided', () => {
    fixture.componentRef.setInput('label', 'Dark mode');
    fixture.detectChanges();
    const labelEl = fixture.nativeElement.querySelector('.toggle__label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent.trim()).toBe('Dark mode');
  });

  it('does not render label when null', () => {
    fixture.componentRef.setInput('label', null);
    fixture.detectChanges();
    const labelEl = fixture.nativeElement.querySelector('.toggle__label');
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
      const label = fixture.nativeElement.querySelector('.toggle');
      label.click();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('registerOnTouched is called on toggle', () => {
      const spy = vi.fn();
      component.registerOnTouched(spy);
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.toggle');
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

      const track = hostFixture.nativeElement.querySelector('.toggle__track');
      expect(track.classList.contains('toggle__track--on')).toBe(true);

      const label = hostFixture.nativeElement.querySelector('.toggle');
      label.click();
      hostFixture.detectChanges();
      expect(host.ctrl.value).toBe(false);
    });
  });
});
