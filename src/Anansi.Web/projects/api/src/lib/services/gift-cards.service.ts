import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { CreateGiftCardRequest, GiftCardDto } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class GiftCardsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<GiftCardDto[]> {
    return this.http.get<GiftCardDto[]>(
      `${this.config.baseUrl}/api/giftcards`,
    );
  }

  create(request: CreateGiftCardRequest): Observable<GiftCardDto> {
    return this.http.post<GiftCardDto>(
      `${this.config.baseUrl}/api/giftcards`,
      request,
    );
  }
}
