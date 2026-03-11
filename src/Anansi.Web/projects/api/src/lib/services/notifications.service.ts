import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  NotificationDto,
  NotificationListParams,
  NotificationPreferencesDto,
  RegisterDeviceTokenCommand,
  UnreadCountResponse,
  UnregisterDeviceTokenCommand,
  UpdateNotificationPreferenceCommand,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: NotificationListParams): Observable<PagedList<NotificationDto>> {
    let httpParams = new HttpParams();
    if (params?.category != null) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.isRead != null) {
      httpParams = httpParams.set('isRead', params.isRead);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<NotificationDto>>(
      `${this.config.baseUrl}/api/notifications`,
      { params: httpParams },
    );
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(
      `${this.config.baseUrl}/api/notifications/unread-count`,
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/notifications/${id}/read`,
      null,
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/notifications/read-all`,
      null,
    );
  }

  getPreferences(): Observable<NotificationPreferencesDto> {
    return this.http.get<NotificationPreferencesDto>(
      `${this.config.baseUrl}/api/notifications/preferences`,
    );
  }

  updatePreferences(command: UpdateNotificationPreferenceCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/notifications/preferences`,
      command,
    );
  }

  registerDeviceToken(command: RegisterDeviceTokenCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/notifications/device-tokens`,
      command,
    );
  }

  unregisterDeviceToken(command: UnregisterDeviceTokenCommand): Observable<void> {
    return this.http.request<void>(
      'DELETE',
      `${this.config.baseUrl}/api/notifications/device-tokens`,
      { body: command },
    );
  }
}
