import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { CreatePriceSheetRequest, PriceSheetDto } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class PriceSheetsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<PriceSheetDto[]> {
    return this.http.get<PriceSheetDto[]>(
      `${this.config.baseUrl}/api/pricesheets`,
    );
  }

  create(request: CreatePriceSheetRequest): Observable<PriceSheetDto> {
    return this.http.post<PriceSheetDto>(
      `${this.config.baseUrl}/api/pricesheets`,
      request,
    );
  }
}
