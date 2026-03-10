import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  BookingCouponDto,
  BookingListParams,
  BookingRecordDto,
  ConfirmBookingCommand,
  CreateBookingCommand,
  CreateBookingCouponCommand,
  CreateSessionTypeCommand,
  SessionTypeDto,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  createSessionType(command: CreateSessionTypeCommand): Observable<SessionTypeDto> {
    return this.http.post<SessionTypeDto>(
      `${this.config.baseUrl}/api/bookings/session-types`,
      command,
    );
  }

  listSessionTypes(): Observable<SessionTypeDto[]> {
    return this.http.get<SessionTypeDto[]>(
      `${this.config.baseUrl}/api/bookings/session-types`,
    );
  }

  create(command: CreateBookingCommand): Observable<BookingRecordDto> {
    return this.http.post<BookingRecordDto>(
      `${this.config.baseUrl}/api/bookings`,
      command,
    );
  }

  confirm(id: string, command: ConfirmBookingCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/bookings/${id}/confirm`,
      command,
    );
  }

  list(params?: BookingListParams): Observable<PagedList<BookingRecordDto>> {
    let httpParams = new HttpParams();
    if (params?.status != null) httpParams = httpParams.set('status', params.status);
    if (params?.from != null) httpParams = httpParams.set('from', params.from);
    if (params?.to != null) httpParams = httpParams.set('to', params.to);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<BookingRecordDto>>(
      `${this.config.baseUrl}/api/bookings`,
      { params: httpParams },
    );
  }

  createCoupon(command: CreateBookingCouponCommand): Observable<BookingCouponDto> {
    return this.http.post<BookingCouponDto>(
      `${this.config.baseUrl}/api/bookings/coupons`,
      command,
    );
  }
}
