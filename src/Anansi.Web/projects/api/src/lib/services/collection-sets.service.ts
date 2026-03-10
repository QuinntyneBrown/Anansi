import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CollectionSetDto,
  CreateSetRequest,
  UpdateSetRequest,
  ReorderSetsRequest,
} from '../models/gallery.models';

@Injectable({ providedIn: 'root' })
export class CollectionSetsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(collectionId: string): Observable<CollectionSetDto[]> {
    return this.http.get<CollectionSetDto[]>(
      `${this.config.baseUrl}/api/collections/${collectionId}/sets`,
    );
  }

  create(collectionId: string, request: CreateSetRequest): Observable<CollectionSetDto> {
    return this.http.post<CollectionSetDto>(
      `${this.config.baseUrl}/api/collections/${collectionId}/sets`,
      request,
    );
  }

  update(collectionId: string, id: string, request: UpdateSetRequest): Observable<CollectionSetDto> {
    return this.http.put<CollectionSetDto>(
      `${this.config.baseUrl}/api/collections/${collectionId}/sets/${id}`,
      request,
    );
  }

  delete(collectionId: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/sets/${id}`,
    );
  }

  reorder(collectionId: string, request: ReorderSetsRequest): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/sets/reorder`,
      request,
    );
  }
}
