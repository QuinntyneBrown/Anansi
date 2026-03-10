import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  ConfigureWebsiteCustomDomainCommand,
  CreateWebsiteCommand,
  UpdateWebsiteCommand,
  WebsiteAnalyticsDto,
  WebsiteAnalyticsParams,
  WebsiteDto,
  WebsiteListParams,
} from '../models/website.models';

@Injectable({ providedIn: 'root' })
export class WebsitesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: WebsiteListParams): Observable<WebsiteDto[]> {
    let httpParams = new HttpParams();
    if (params?.status != null) {
      httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<WebsiteDto[]>(
      `${this.config.baseUrl}/api/websites`,
      { params: httpParams },
    );
  }

  get(id: string): Observable<WebsiteDto> {
    return this.http.get<WebsiteDto>(
      `${this.config.baseUrl}/api/websites/${id}`,
    );
  }

  create(command: CreateWebsiteCommand): Observable<WebsiteDto> {
    return this.http.post<WebsiteDto>(
      `${this.config.baseUrl}/api/websites`,
      command,
    );
  }

  update(id: string, command: UpdateWebsiteCommand): Observable<WebsiteDto> {
    return this.http.put<WebsiteDto>(
      `${this.config.baseUrl}/api/websites/${id}`,
      command,
    );
  }

  publish(id: string): Observable<WebsiteDto> {
    return this.http.post<WebsiteDto>(
      `${this.config.baseUrl}/api/websites/${id}/publish`,
      {},
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/websites/${id}`,
    );
  }

  configureCustomDomain(id: string, command: ConfigureWebsiteCustomDomainCommand): Observable<WebsiteDto> {
    return this.http.put<WebsiteDto>(
      `${this.config.baseUrl}/api/websites/${id}/custom-domain`,
      command,
    );
  }

  getAnalytics(id: string, params?: WebsiteAnalyticsParams): Observable<WebsiteAnalyticsDto> {
    let httpParams = new HttpParams();
    if (params?.startDate != null) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params?.endDate != null) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<WebsiteAnalyticsDto>(
      `${this.config.baseUrl}/api/websites/${id}/analytics`,
      { params: httpParams },
    );
  }
}
