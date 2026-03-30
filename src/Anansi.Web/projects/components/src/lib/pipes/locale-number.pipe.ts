import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from 'api';

/**
 * Formats a number using the current locale.
 *
 * Usage: {{ value | localeNumber }}
 *        {{ value | localeNumber:2 }}
 */
@Pipe({ name: 'localeNumber', standalone: true, pure: false })
export class LocaleNumberPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(
    value: number | null | undefined,
    minimumFractionDigits?: number,
  ): string {
    if (value == null) return '';
    const options: Intl.NumberFormatOptions = {};
    if (minimumFractionDigits != null) {
      options.minimumFractionDigits = minimumFractionDigits;
      options.maximumFractionDigits = minimumFractionDigits;
    }
    return this.i18n.formatNumber(value, options);
  }
}
