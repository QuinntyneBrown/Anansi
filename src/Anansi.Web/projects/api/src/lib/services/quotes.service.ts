import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreateQuoteCommand,
  QuoteDto,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

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
