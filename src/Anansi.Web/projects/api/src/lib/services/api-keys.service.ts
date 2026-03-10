import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  ApiKeyResponse,
  CreateApiKeyCommand,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  create(command: CreateApiKeyCommand): Observable<ApiKeyResponse> {
    return this.http.post<ApiKeyResponse>(
      `${this.config.baseUrl}/api/api-keys`,
      command,
    );
  }

  revoke(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/api-keys/${id}`,
    );
  }
}
