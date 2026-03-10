import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  GalleryMediaDto,
  GalleryMediaListParams,
  MoveMediaRequest,
  BulkStarRequest,
  TogglePrivateRequest,
} from '../models/gallery.models';

@Injectable({ providedIn: 'root' })
export class GalleryMediaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(collectionId: string, params?: GalleryMediaListParams): Observable<PagedList<GalleryMediaDto>> {
    let httpParams = new HttpParams();
    if (params?.setId != null) httpParams = httpParams.set('setId', params.setId);
    if (params?.starredOnly != null) httpParams = httpParams.set('starredOnly', params.starredOnly);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<GalleryMediaDto>>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media`,
      { params: httpParams },
    );
  }

  upload(collectionId: string, file: File): Observable<GalleryMediaDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<GalleryMediaDto>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media`,
      formData,
    );
  }

  delete(collectionId: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media/${id}`,
    );
  }

  move(collectionId: string, id: string, request: MoveMediaRequest): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media/${id}/move`,
      request,
    );
  }

  toggleStar(collectionId: string, id: string): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media/${id}/star`,
      {},
    );
  }

  bulkStar(collectionId: string, request: BulkStarRequest): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media/bulk-star`,
      request,
    );
  }

  togglePrivate(collectionId: string, id: string, request: TogglePrivateRequest): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${collectionId}/media/${id}/private`,
      request,
    );
  }
}
