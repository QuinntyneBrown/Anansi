import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { CreateTaxRateRequest, TaxRateDto } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class TaxRatesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<TaxRateDto[]> {
    return this.http.get<TaxRateDto[]>(
      `${this.config.baseUrl}/api/taxrates`,
    );
  }

  create(request: CreateTaxRateRequest): Observable<TaxRateDto> {
    return this.http.post<TaxRateDto>(
      `${this.config.baseUrl}/api/taxrates`,
      request,
    );
  }
}
