import { Injectable, signal, computed } from '@angular/core';
import { GalleryLanguage } from '../models/enums';
import { TranslationKeys, en } from './translations/en';
import { es } from './translations/es';
import { fr } from './translations/fr';
import { de } from './translations/de';
import { nl } from './translations/nl';
import { zh } from './translations/zh';
import { pt } from './translations/pt';
import { sv } from './translations/sv';

const TRANSLATIONS: Record<GalleryLanguage, TranslationKeys> = {
  [GalleryLanguage.English]: en,
  [GalleryLanguage.Spanish]: es,
  [GalleryLanguage.French]: fr,
  [GalleryLanguage.German]: de,
  [GalleryLanguage.Dutch]: nl,
  [GalleryLanguage.ChineseSimplified]: zh,
  [GalleryLanguage.Portuguese]: pt,
  [GalleryLanguage.Swedish]: sv,
};

const LOCALE_MAP: Record<GalleryLanguage, string> = {
  [GalleryLanguage.English]: 'en-CA',
  [GalleryLanguage.Spanish]: 'es',
  [GalleryLanguage.French]: 'fr-CA',
  [GalleryLanguage.German]: 'de',
  [GalleryLanguage.Dutch]: 'nl',
  [GalleryLanguage.ChineseSimplified]: 'zh-Hans',
  [GalleryLanguage.Portuguese]: 'pt-BR',
  [GalleryLanguage.Swedish]: 'sv',
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _language = signal<GalleryLanguage>(GalleryLanguage.English);

  readonly language = this._language.asReadonly();

  readonly t = computed<TranslationKeys>(
    () => TRANSLATIONS[this._language()] ?? en,
  );

  readonly locale = computed<string>(
    () => LOCALE_MAP[this._language()] ?? 'en-CA',
  );

  setLanguage(language: GalleryLanguage): void {
    this._language.set(language);
  }

  /**
   * Interpolate placeholders like {key} in a translation string.
   *
   * @example
   * interpolate('Your {sessionType} session on {date}.', { sessionType: 'Portrait', date: 'Jan 5' })
   * // => 'Your Portrait session on Jan 5.'
   */
  interpolate(template: string, params: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
  }

  /**
   * Format cents as a currency string using the current locale.
   *
   * @param cents Amount in cents
   * @param currency ISO 4217 currency code (default: 'CAD')
   */
  formatCurrency(cents: number, currency = 'CAD'): string {
    const amount = cents / 100;
    try {
      return new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  /**
   * Format a date string or Date using the current locale.
   */
  formatDate(
    date: string | Date,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  ): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    try {
      return new Intl.DateTimeFormat(this.locale(), options).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  }

  /**
   * Format a number using the current locale.
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.locale(), options).format(value);
    } catch {
      return value.toString();
    }
  }
}
