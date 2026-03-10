import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  BulkMarkupRequest,
  CreateProductRequest,
  ProductDto,
  ProductListParams,
  UpdateProductRequest,
} from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: ProductListParams): Observable<PagedList<ProductDto>> {
    let httpParams = new HttpParams();
    if (params?.productType != null) {
      httpParams = httpParams.set('productType', params.productType);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<ProductDto>>(
      `${this.config.baseUrl}/api/products`,
      { params: httpParams },
    );
  }

  get(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(
      `${this.config.baseUrl}/api/products/${id}`,
    );
  }

  create(request: CreateProductRequest): Observable<ProductDto> {
    return this.http.post<ProductDto>(
      `${this.config.baseUrl}/api/products`,
      request,
    );
  }

  update(id: string, request: UpdateProductRequest): Observable<ProductDto> {
    return this.http.put<ProductDto>(
      `${this.config.baseUrl}/api/products/${id}`,
      request,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/products/${id}`,
    );
  }

  bulkMarkup(request: BulkMarkupRequest): Observable<{ updatedCount: number }> {
    return this.http.post<{ updatedCount: number }>(
      `${this.config.baseUrl}/api/products/bulk-markup`,
      request,
    );
  }
}
