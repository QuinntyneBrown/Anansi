import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreateUrlRedirectCommand,
  GenerateAiAltTextCommand,
  SeoAuditResultDto,
  UpdateUrlRedirectCommand,
  UrlRedirectDto,
} from '../models/website.models';

@Injectable({ providedIn: 'root' })
export class WebsiteSeoService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  runAudit(websiteId: string): Observable<SeoAuditResultDto> {
    return this.http.get<SeoAuditResultDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
  }

  generateAltText(websiteId: string, command: GenerateAiAltTextCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/ai-alt-text`,
      command,
    );
  }

  generateDescription(websiteId: string, pageId: string): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/ai-description/${pageId}`,
      {},
    );
  }

  listRedirects(websiteId: string): Observable<UrlRedirectDto[]> {
    return this.http.get<UrlRedirectDto[]>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/redirects`,
    );
  }

  createRedirect(websiteId: string, command: CreateUrlRedirectCommand): Observable<UrlRedirectDto> {
    return this.http.post<UrlRedirectDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/redirects`,
      command,
    );
  }

  updateRedirect(websiteId: string, redirectId: string, command: UpdateUrlRedirectCommand): Observable<UrlRedirectDto> {
    return this.http.put<UrlRedirectDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/redirects/${redirectId}`,
      command,
    );
  }

  deleteRedirect(websiteId: string, redirectId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/websites/${websiteId}/seo/redirects/${redirectId}`,
    );
  }
}
