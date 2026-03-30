import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CreatePresetCommand,
  PresetDto,
  PresetListParams,
} from '../models/discovery.models';

@Injectable({ providedIn: 'root' })
export class PresetsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: PresetListParams): Observable<PagedList<PresetDto>> {
    let httpParams = new HttpParams();
    if (params?.skinTone != null) httpParams = httpParams.set('skinTone', params.skinTone);
    if (params?.context != null) httpParams = httpParams.set('context', params.context);
    if (params?.search != null) httpParams = httpParams.set('search', params.search);
    if (params?.favoritesOnly != null) httpParams = httpParams.set('favoritesOnly', params.favoritesOnly);
    if (params?.myPresetsOnly != null) httpParams = httpParams.set('myPresetsOnly', params.myPresetsOnly);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<PresetDto>>(
      `${this.config.baseUrl}/api/presets`,
      { params: httpParams },
    );
  }

  get(id: string): Observable<PresetDto> {
    return this.http.get<PresetDto>(
      `${this.config.baseUrl}/api/presets/${id}`,
    );
  }

  create(command: CreatePresetCommand): Observable<PresetDto> {
    return this.http.post<PresetDto>(
      `${this.config.baseUrl}/api/presets`,
      command,
    );
  }

  toggleFavorite(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/presets/${id}/favorite`,
      {},
    );
  }

  download(id: string): Observable<Blob> {
    return this.http.get(
      `${this.config.baseUrl}/api/presets/${id}/download`,
      { responseType: 'blob' },
    );
  }
}
