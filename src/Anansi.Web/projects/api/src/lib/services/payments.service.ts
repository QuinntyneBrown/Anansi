import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import { GiftCardDto } from '../models/store.models';
import {
  ApplyForFinancingCommand,
  CreateGiftCardCommand,
  FinancingApplicationDto,
  PaymentExportParams,
  PaymentRecordDto,
  PaymentTransactionListParams,
  RecordPaymentCommand,
  RedeemGiftCardCommand,
  RevenueDashboardDto,
  RevenueDashboardParams,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  record(command: RecordPaymentCommand): Observable<PaymentRecordDto> {
    return this.http.post<PaymentRecordDto>(
      `${this.config.baseUrl}/api/payments`,
      command,
    );
  }

  getDashboard(params?: RevenueDashboardParams): Observable<RevenueDashboardDto> {
    let httpParams = new HttpParams();
    if (params?.from != null) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params?.to != null) {
      httpParams = httpParams.set('to', params.to);
    }
    return this.http.get<RevenueDashboardDto>(
      `${this.config.baseUrl}/api/payments/dashboard`,
      { params: httpParams },
    );
  }

  listTransactions(params?: PaymentTransactionListParams): Observable<PagedList<PaymentRecordDto>> {
    let httpParams = new HttpParams();
    if (params?.method != null) {
      httpParams = httpParams.set('method', params.method);
    }
    if (params?.search != null) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.from != null) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params?.to != null) {
      httpParams = httpParams.set('to', params.to);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<PaymentRecordDto>>(
      `${this.config.baseUrl}/api/payments/transactions`,
      { params: httpParams },
    );
  }

  exportTransactions(params?: PaymentExportParams): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.from != null) httpParams = httpParams.set('from', params.from);
    if (params?.to != null) httpParams = httpParams.set('to', params.to);
    return this.http.get(`${this.config.baseUrl}/api/payments/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }

  createGiftCard(command: CreateGiftCardCommand): Observable<GiftCardDto> {
    return this.http.post<GiftCardDto>(
      `${this.config.baseUrl}/api/payments/gift-cards`,
      command,
    );
  }

  redeemGiftCard(command: RedeemGiftCardCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/payments/gift-cards/redeem`,
      command,
    );
  }

  applyForFinancing(command: ApplyForFinancingCommand): Observable<FinancingApplicationDto> {
    return this.http.post<FinancingApplicationDto>(
      `${this.config.baseUrl}/api/payments/financing/apply`,
      command,
    );
  }

  getFinancing(id: string): Observable<FinancingApplicationDto> {
    return this.http.get<FinancingApplicationDto>(
      `${this.config.baseUrl}/api/payments/financing/${id}`,
    );
  }
}
