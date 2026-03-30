import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from 'api';

/**
 * Formats a date string or Date object using the current locale.
 *
 * Usage: {{ dateValue | localeDate }}
 *        {{ dateValue | localeDate:'long' }}
 */
@Pipe({ name: 'localeDate', standalone: true, pure: false })
export class LocaleDatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(
    value: string | Date | null | undefined,
    style: 'short' | 'medium' | 'long' | 'full' = 'medium',
  ): string {
    if (value == null) return '';
    return this.i18n.formatDate(value, { dateStyle: style });
  }
}
