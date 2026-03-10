import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CreateInvoiceCommand,
  InvoiceDto,
  InvoiceListParams,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  create(command: CreateInvoiceCommand): Observable<InvoiceDto> {
    return this.http.post<InvoiceDto>(
      `${this.config.baseUrl}/api/invoices`,
      command,
    );
  }

  get(id: string): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(
      `${this.config.baseUrl}/api/invoices/${id}`,
    );
  }

  list(params?: InvoiceListParams): Observable<PagedList<InvoiceDto>> {
    let httpParams = new HttpParams();
    if (params?.status != null) httpParams = httpParams.set('status', params.status);
    if (params?.isTemplate != null) httpParams = httpParams.set('isTemplate', params.isTemplate);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<InvoiceDto>>(
      `${this.config.baseUrl}/api/invoices`,
      { params: httpParams },
    );
  }
}
