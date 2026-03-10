import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { CouponDto, CreateCouponRequest } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<CouponDto[]> {
    return this.http.get<CouponDto[]>(
      `${this.config.baseUrl}/api/coupons`,
    );
  }

  create(request: CreateCouponRequest): Observable<CouponDto> {
    return this.http.post<CouponDto>(
      `${this.config.baseUrl}/api/coupons`,
      request,
    );
  }
}
