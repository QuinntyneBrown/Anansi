import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  FavoriteListDto,
  FavoriteListParams,
  CreateFavoriteListCommand,
  FavoriteItemDto,
  AddFavoriteItemRequest,
  UpdateCommentRequest,
} from '../models/gallery.models';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: FavoriteListParams): Observable<PagedList<FavoriteListDto>> {
    let httpParams = new HttpParams();
    if (params?.collectionId != null) httpParams = httpParams.set('collectionId', params.collectionId);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<FavoriteListDto>>(
      `${this.config.baseUrl}/api/favorites`,
      { params: httpParams },
    );
  }

  create(command: CreateFavoriteListCommand): Observable<FavoriteListDto> {
    return this.http.post<FavoriteListDto>(
      `${this.config.baseUrl}/api/favorites`,
      command,
    );
  }

  getItems(id: string): Observable<FavoriteItemDto[]> {
    return this.http.get<FavoriteItemDto[]>(
      `${this.config.baseUrl}/api/favorites/${id}/items`,
    );
  }

  addItem(id: string, request: AddFavoriteItemRequest): Observable<FavoriteItemDto> {
    return this.http.post<FavoriteItemDto>(
      `${this.config.baseUrl}/api/favorites/${id}/items`,
      request,
    );
  }

  removeItem(itemId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/favorites/items/${itemId}`,
    );
  }

  updateComment(itemId: string, request: UpdateCommentRequest): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/favorites/items/${itemId}/comment`,
      request,
    );
  }

  markComplete(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/favorites/${id}/complete`,
      {},
    );
  }
}
