import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreateElementCommand,
  PageElementDto,
  UpdateElementCommand,
} from '../models/website.models';

@Injectable({ providedIn: 'root' })
export class PageElementsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(pageId: string): Observable<PageElementDto[]> {
    return this.http.get<PageElementDto[]>(
      `${this.config.baseUrl}/api/pages/${pageId}/elements`,
    );
  }

  create(pageId: string, command: CreateElementCommand): Observable<PageElementDto> {
    return this.http.post<PageElementDto>(
      `${this.config.baseUrl}/api/pages/${pageId}/elements`,
      command,
    );
  }

  update(pageId: string, elementId: string, command: UpdateElementCommand): Observable<PageElementDto> {
    return this.http.put<PageElementDto>(
      `${this.config.baseUrl}/api/pages/${pageId}/elements/${elementId}`,
      command,
    );
  }

  delete(pageId: string, elementId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/pages/${pageId}/elements/${elementId}`,
    );
  }
}
