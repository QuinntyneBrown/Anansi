import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { CreateShippingMethodRequest, ShippingMethodDto } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class ShippingMethodsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<ShippingMethodDto[]> {
    return this.http.get<ShippingMethodDto[]>(
      `${this.config.baseUrl}/api/shippingmethods`,
    );
  }

  create(request: CreateShippingMethodRequest): Observable<ShippingMethodDto> {
    return this.http.post<ShippingMethodDto>(
      `${this.config.baseUrl}/api/shippingmethods`,
      request,
    );
  }
}
