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
  selector: 'lib-textarea-group',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaGroupComponent),
      multi: true,
    },
  ],
  template: `
    <label class="textarea-group">
      @if (label()) {
        <span class="textarea-group__label">{{ label() }}</span>
      }
      <textarea
        class="textarea-group__input"
        [class.textarea-group__input--error]="errorMessage()"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [disabled]="disabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      ></textarea>
      @if (errorMessage()) {
        <span class="textarea-group__error">{{ errorMessage() }}</span>
      }
    </label>
  `,
  styles: `
    .textarea-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .textarea-group__label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
    }

    .textarea-group__input {
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
      min-height: 100px;
      resize: vertical;
    }

    .textarea-group__input:focus {
      border-color: #C9A962;
    }

    .textarea-group__input::placeholder {
      color: #4A4A4C;
    }

    .textarea-group__input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .textarea-group__input--error {
      border-color: #C94A4A;
    }

    .textarea-group__error {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #C94A4A;
    }
  `,
})
export class TextareaGroupComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = model<string>('');
  readonly rows = input<number>(4);
  readonly disabled = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
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
