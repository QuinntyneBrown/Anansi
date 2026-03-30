import {
  Component,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'lib-input-group',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGroupComponent),
      multi: true,
    },
  ],
  template: `
    <label class="input-group">
      @if (label()) {
        <span class="input-group__label">{{ label() }}</span>
      }
      <input
        class="input-group__input"
        [class.input-group__input--error]="errorMessage()"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      @if (errorMessage()) {
        <span class="input-group__error">{{ errorMessage() }}</span>
      }
    </label>
  `,
  styles: `
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .input-group__label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
    }

    .input-group__input {
      font-family: Inter, sans-serif;
      font-size: 14px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 12px 16px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .input-group__input:focus {
      border-color: #C9A962;
    }

    .input-group__input::placeholder {
      color: #4A4A4C;
    }

    .input-group__input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input-group__input--error {
      border-color: #C94A4A;
    }

    .input-group__error {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #C94A4A;
    }
  `,
})
export class InputGroupComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = model<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date'>('text');
  readonly disabled = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
