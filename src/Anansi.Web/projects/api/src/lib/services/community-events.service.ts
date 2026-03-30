import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CommunityEventDto,
  CreateCommunityEventCommand,
  EventListParams,
} from '../models/discovery.models';

@Injectable({ providedIn: 'root' })
export class CommunityEventsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: EventListParams): Observable<PagedList<CommunityEventDto>> {
    let httpParams = new HttpParams();
    if (params?.month != null) httpParams = httpParams.set('month', params.month);
    if (params?.year != null) httpParams = httpParams.set('year', params.year);
    if (params?.category != null) httpParams = httpParams.set('category', params.category);
    if (params?.neighborhood != null) httpParams = httpParams.set('neighborhood', params.neighborhood);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<CommunityEventDto>>(
      `${this.config.baseUrl}/api/community-events`,
      { params: httpParams },
    );
  }

  get(id: string): Observable<CommunityEventDto> {
    return this.http.get<CommunityEventDto>(
      `${this.config.baseUrl}/api/community-events/${id}`,
    );
  }

  create(command: CreateCommunityEventCommand): Observable<CommunityEventDto> {
    return this.http.post<CommunityEventDto>(
      `${this.config.baseUrl}/api/community-events`,
      command,
    );
  }

  update(id: string, command: CreateCommunityEventCommand): Observable<CommunityEventDto> {
    return this.http.put<CommunityEventDto>(
      `${this.config.baseUrl}/api/community-events/${id}`,
      command,
    );
  }
}
