import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CodeInjectionDto,
  ConfigureFacebookPixelCommand,
  ConfigureGalleryAssistCommand,
  ConfigureGoogleAnalyticsCommand,
  ConfigureInstagramFeedCommand,
  ConfigurePayPalCommand,
  ConfigureStripeCommand,
  InstagramFeedDto,
  SaveCustomCodeInjectionCommand,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class IntegrationsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  configureGoogleAnalytics(command: ConfigureGoogleAnalyticsCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/integrations/google-analytics`,
      command,
    );
  }

  configureFacebookPixel(command: ConfigureFacebookPixelCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/integrations/facebook-pixel`,
      command,
    );
  }

  configureInstagram(command: ConfigureInstagramFeedCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/integrations/instagram`,
      command,
    );
  }

  getInstagramFeed(photographerId: string): Observable<InstagramFeedDto> {
    return this.http.get<InstagramFeedDto>(
      `${this.config.baseUrl}/api/integrations/instagram/feed/${photographerId}`,
    );
  }

  configureStripe(command: ConfigureStripeCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/integrations/stripe`,
      command,
    );
  }

  configurePayPal(command: ConfigurePayPalCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/integrations/paypal`,
      command,
    );
  }

  saveCodeInjection(command: SaveCustomCodeInjectionCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/integrations/code-injection`,
      command,
    );
  }

  getCodeInjections(): Observable<CodeInjectionDto[]> {
    return this.http.get<CodeInjectionDto[]>(
      `${this.config.baseUrl}/api/integrations/code-injection`,
    );
  }

  configureGalleryAssist(command: ConfigureGalleryAssistCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/integrations/gallery-assist`,
      command,
    );
  }
}
