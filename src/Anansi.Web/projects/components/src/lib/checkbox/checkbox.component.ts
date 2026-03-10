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
  selector: 'lib-checkbox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label
      class="checkbox"
      [class.checkbox--disabled]="disabled()"
      (click)="toggle($event)"
      (keydown.space)="toggle($event)"
      tabindex="0"
      role="checkbox"
      [attr.aria-checked]="checked()"
    >
      <span class="checkbox__box" [class.checkbox__box--checked]="checked()">
        @if (checked()) {
          <svg
            class="checkbox__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      </span>
      @if (label()) {
        <span class="checkbox__label">{{ label() }}</span>
      }
    </label>
  `,
  styles: `
    .checkbox {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .checkbox:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
      border-radius: 4px;
    }

    .checkbox--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .checkbox__box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: transparent;
      border: 1px solid #3A3A3C;
      flex-shrink: 0;
    }

    .checkbox__box--checked {
      background: #C9A962;
      border-color: #C9A962;
    }

    .checkbox__icon {
      width: 14px;
      height: 14px;
      color: #1A1A1C;
    }

    .checkbox__label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
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
