import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CollectionPresetDto,
  CreatePresetCommand,
  UpdatePresetCommand,
} from '../models/gallery.models';

@Injectable({ providedIn: 'root' })
export class CollectionPresetsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<CollectionPresetDto[]> {
    return this.http.get<CollectionPresetDto[]>(
      `${this.config.baseUrl}/api/collection-presets`,
    );
  }

  create(command: CreatePresetCommand): Observable<CollectionPresetDto> {
    return this.http.post<CollectionPresetDto>(
      `${this.config.baseUrl}/api/collection-presets`,
      command,
    );
  }

  update(id: string, command: UpdatePresetCommand): Observable<CollectionPresetDto> {
    return this.http.put<CollectionPresetDto>(
      `${this.config.baseUrl}/api/collection-presets/${id}`,
      command,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/collection-presets/${id}`,
    );
  }
}
