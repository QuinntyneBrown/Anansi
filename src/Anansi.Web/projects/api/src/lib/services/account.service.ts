import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  AccountSettings,
  StorageUsageDto,
  UpdateAccountSettingsCommand,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getSettings(): Observable<AccountSettings> {
    return this.http.get<AccountSettings>(
      `${this.config.baseUrl}/api/account/settings`,
    );
  }

  updateSettings(command: UpdateAccountSettingsCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/account/settings`,
      command,
    );
  }

  deleteAccount(exportFirst?: boolean): Observable<void> {
    let params = new HttpParams();
    if (exportFirst !== undefined) {
      params = params.set('exportFirst', exportFirst.toString());
    }
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/account`,
      { params },
    );
  }

  getStorageUsage(): Observable<StorageUsageDto> {
    return this.http.get<StorageUsageDto>(
      `${this.config.baseUrl}/api/account/storage`,
    );
  }
}
