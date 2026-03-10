import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreateWebhookSubscriptionCommand,
  WebhookSubscriptionDto,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class WebhooksService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<WebhookSubscriptionDto[]> {
    return this.http.get<WebhookSubscriptionDto[]>(
      `${this.config.baseUrl}/api/webhooks`,
    );
  }

  create(command: CreateWebhookSubscriptionCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/webhooks`,
      command,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/webhooks/${id}`,
    );
  }
}
