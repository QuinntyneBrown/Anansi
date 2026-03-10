import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreatePageCommand,
  UpdatePageCommand,
  WebsitePageDto,
} from '../models/website.models';

@Injectable({ providedIn: 'root' })
export class WebsitePagesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(websiteId: string): Observable<WebsitePageDto[]> {
    return this.http.get<WebsitePageDto[]>(
      `${this.config.baseUrl}/api/websites/${websiteId}/pages`,
    );
  }

  create(websiteId: string, command: CreatePageCommand): Observable<WebsitePageDto> {
    return this.http.post<WebsitePageDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/pages`,
      command,
    );
  }

  update(websiteId: string, pageId: string, command: UpdatePageCommand): Observable<WebsitePageDto> {
    return this.http.put<WebsitePageDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/pages/${pageId}`,
      command,
    );
  }

  delete(websiteId: string, pageId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/websites/${websiteId}/pages/${pageId}`,
    );
  }
}
