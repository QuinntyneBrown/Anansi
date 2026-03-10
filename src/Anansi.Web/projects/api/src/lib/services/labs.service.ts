import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { LabPricingDto, SubmitLabOrderCommand } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class LabsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getPricing(labName: string): Observable<LabPricingDto> {
    return this.http.get<LabPricingDto>(
      `${this.config.baseUrl}/api/labs/pricing/${labName}`,
    );
  }

  submitOrder(command: SubmitLabOrderCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/labs/orders`,
      command,
    );
  }
}
