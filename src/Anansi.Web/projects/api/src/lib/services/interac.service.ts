import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  ConfirmInteracTransferCommand,
  CreateInteracPaymentRequestCommand,
  InteracConfigDto,
  InteracPaymentRequestDto,
  InteracPaymentRequestListParams,
  UpdateInteracConfigCommand,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class InteracService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getConfig(): Observable<InteracConfigDto> {
    return this.http.get<InteracConfigDto>(
      `${this.config.baseUrl}/api/interac/config`,
    );
  }

  updateConfig(command: UpdateInteracConfigCommand): Observable<InteracConfigDto> {
    return this.http.put<InteracConfigDto>(
      `${this.config.baseUrl}/api/interac/config`,
      command,
    );
  }

  listRequests(params?: InteracPaymentRequestListParams): Observable<PagedList<InteracPaymentRequestDto>> {
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
    return this.http.get<PagedList<InteracPaymentRequestDto>>(
      `${this.config.baseUrl}/api/interac/requests`,
      { params: httpParams },
    );
  }

  getRequest(id: string): Observable<InteracPaymentRequestDto> {
    return this.http.get<InteracPaymentRequestDto>(
      `${this.config.baseUrl}/api/interac/requests/${id}`,
    );
  }

  createRequest(command: CreateInteracPaymentRequestCommand): Observable<InteracPaymentRequestDto> {
    return this.http.post<InteracPaymentRequestDto>(
      `${this.config.baseUrl}/api/interac/requests`,
      command,
    );
  }

  confirmTransfer(command: ConfirmInteracTransferCommand): Observable<InteracPaymentRequestDto> {
    return this.http.post<InteracPaymentRequestDto>(
      `${this.config.baseUrl}/api/interac/requests/confirm`,
      command,
    );
  }

  cancelRequest(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/interac/requests/${id}`,
    );
  }
}
