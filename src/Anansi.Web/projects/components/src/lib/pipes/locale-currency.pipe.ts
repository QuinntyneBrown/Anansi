import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from 'api';

/**
 * Formats cents to a locale-aware currency string.
 *
 * Usage: {{ amountCents | localeCurrency }}
 *        {{ amountCents | localeCurrency:'USD' }}
 */
@Pipe({ name: 'localeCurrency', standalone: true, pure: false })
export class LocaleCurrencyPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(cents: number | null | undefined, currency = 'CAD'): string {
    if (cents == null) return '';
    return this.i18n.formatCurrency(cents, currency);
  }
}
