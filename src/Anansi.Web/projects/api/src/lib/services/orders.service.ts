import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CreateOrderRequest,
  OrderDto,
  OrderListParams,
  UpdateOrderStatusRequest,
} from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: OrderListParams): Observable<PagedList<OrderDto>> {
    let httpParams = new HttpParams();
    if (params?.status != null) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.search != null) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<OrderDto>>(
      `${this.config.baseUrl}/api/orders`,
      { params: httpParams },
    );
  }

  get(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(
      `${this.config.baseUrl}/api/orders/${id}`,
    );
  }

  create(request: CreateOrderRequest): Observable<OrderDto> {
    return this.http.post<OrderDto>(
      `${this.config.baseUrl}/api/orders`,
      request,
    );
  }

  updateStatus(id: string, request: UpdateOrderStatusRequest): Observable<OrderDto> {
    return this.http.put<OrderDto>(
      `${this.config.baseUrl}/api/orders/${id}/status`,
      request,
    );
  }
}
