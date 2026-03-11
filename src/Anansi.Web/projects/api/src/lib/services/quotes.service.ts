import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CreateQuoteCommand,
  QuoteListParams,
  QuoteDto,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: QuoteListParams): Observable<PagedList<QuoteDto>> {
    let httpParams = new HttpParams();
    if (params?.status != null) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.search != null) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.isTemplate != null) {
      httpParams = httpParams.set('isTemplate', params.isTemplate);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<QuoteDto>>(
      `${this.config.baseUrl}/api/quotes`,
      { params: httpParams },
    );
  }

  create(command: CreateQuoteCommand): Observable<QuoteDto> {
    return this.http.post<QuoteDto>(
      `${this.config.baseUrl}/api/quotes`,
      command,
    );
  }

  get(id: string): Observable<QuoteDto> {
    return this.http.get<QuoteDto>(
      `${this.config.baseUrl}/api/quotes/${id}`,
    );
  }

  accept(id: string): Observable<QuoteDto> {
    return this.http.post<QuoteDto>(
      `${this.config.baseUrl}/api/quotes/${id}/accept`,
      {},
    );
  }
}
