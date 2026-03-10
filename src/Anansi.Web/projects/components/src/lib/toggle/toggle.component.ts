import {
  Component,
  forwardRef,
  input,
  model,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'lib-toggle',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
  template: `
    <label
      class="toggle"
      [class.toggle--disabled]="disabled()"
      (click)="toggle($event)"
      (keydown.space)="toggle($event)"
      tabindex="0"
      role="switch"
      [attr.aria-checked]="checked()"
    >
      <span class="toggle__track" [class.toggle__track--on]="checked()">
        <span class="toggle__knob" [class.toggle__knob--on]="checked()"></span>
      </span>
      @if (label()) {
        <span class="toggle__label">{{ label() }}</span>
      }
    </label>
  `,
  styles: `
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .toggle:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
      border-radius: 12px;
    }

    .toggle--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle__track {
      display: flex;
      align-items: center;
      width: 40px;
      height: 24px;
      border-radius: 12px;
      background: #3A3A3C;
      padding: 2px;
      box-sizing: border-box;
      transition: background 0.2s;
      flex-shrink: 0;
    }

    .toggle__track--on {
      background: #C9A962;
    }

    .toggle__knob {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #F5F5F0;
      transition: transform 0.2s, background 0.2s;
      transform: translateX(0);
    }

    .toggle__knob--on {
      background: #1A1A1C;
      transform: translateX(16px);
    }

    .toggle__label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }
  `,
})
export class ToggleComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly label = input<string | null>(null);

  private onChange: (value: boolean) => void = () => {};
  private onTouchedFn: () => void = () => {};

  toggle(event: Event): void {
    event.preventDefault();
    if (this.disabled()) {
      return;
    }
    const newValue = !this.checked();
    this.checked.set(newValue);
    this.onChange(newValue);
    this.onTouchedFn();
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
}
