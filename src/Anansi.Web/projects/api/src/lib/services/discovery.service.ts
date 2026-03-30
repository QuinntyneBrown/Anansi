import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CulturalTagDto,
  DirectorySearchParams,
  PhotographerProfileDto,
  UpdateProfileDiscoveryCommand,
} from '../models/discovery.models';

@Injectable({ providedIn: 'root' })
export class DiscoveryService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  listCulturalTags(): Observable<CulturalTagDto[]> {
    return this.http.get<CulturalTagDto[]>(
      `${this.config.baseUrl}/api/discovery/cultural-tags`,
    );
  }

  getProfile(): Observable<PhotographerProfileDto> {
    return this.http.get<PhotographerProfileDto>(
      `${this.config.baseUrl}/api/discovery/profile`,
    );
  }

  updateProfile(command: UpdateProfileDiscoveryCommand): Observable<PhotographerProfileDto> {
    return this.http.put<PhotographerProfileDto>(
      `${this.config.baseUrl}/api/discovery/profile`,
      command,
    );
  }

  searchDirectory(params?: DirectorySearchParams): Observable<PagedList<PhotographerProfileDto>> {
    let httpParams = new HttpParams();
    if (params?.search != null) httpParams = httpParams.set('search', params.search);
    if (params?.culturalTagId != null) httpParams = httpParams.set('culturalTagId', params.culturalTagId);
    if (params?.neighborhood != null) httpParams = httpParams.set('neighborhood', params.neighborhood);
    if (params?.sortBy != null) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<PhotographerProfileDto>>(
      `${this.config.baseUrl}/api/discovery/directory`,
      { params: httpParams },
    );
  }
}
