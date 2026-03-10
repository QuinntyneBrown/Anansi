import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList, PaginationParams } from '../models/common';
import {
  CollectionActivityParams,
  CollectionDto,
  CollectionListParams,
  CollectionSummaryDto,
  CreateCollectionCommand,
  UpdateCollectionCommand,
  BulkCreateCollectionsCommand,
  SetPasswordRequest,
  VerifyPasswordRequest,
  RegisterEmailRequest,
  GalleryEmailRegistrationDto,
  SetExpiryRequest,
  RequestDownloadRequest,
  DownloadRequestDto,
  ResetDownloadLimitRequest,
  SendEmailInvitationCommand,
  CreateQuickShareRequest,
  QuickShareLinkDto,
  GalleryActivityDto,
  SetGoogleAnalyticsRequest,
} from '../models/gallery.models';

@Injectable({ providedIn: 'root' })
export class CollectionsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  create(command: CreateCollectionCommand): Observable<CollectionDto> {
    return this.http.post<CollectionDto>(
      `${this.config.baseUrl}/api/collections`,
      command,
    );
  }

  list(params?: CollectionListParams): Observable<PagedList<CollectionSummaryDto>> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.starredOnly != null) httpParams = httpParams.set('starredOnly', params.starredOnly);
    if (params?.status != null) httpParams = httpParams.set('status', params.status);
    if (params?.search != null) httpParams = httpParams.set('search', params.search);
    return this.http.get<PagedList<CollectionSummaryDto>>(
      `${this.config.baseUrl}/api/collections`,
      { params: httpParams },
    );
  }

  get(id: string): Observable<CollectionDto> {
    return this.http.get<CollectionDto>(
      `${this.config.baseUrl}/api/collections/${id}`,
    );
  }

  update(id: string, command: UpdateCollectionCommand): Observable<CollectionDto> {
    return this.http.put<CollectionDto>(
      `${this.config.baseUrl}/api/collections/${id}`,
      command,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/collections/${id}`,
    );
  }

  bulkCreate(command: BulkCreateCollectionsCommand): Observable<CollectionDto[]> {
    return this.http.post<CollectionDto[]>(
      `${this.config.baseUrl}/api/collections/bulk`,
      command,
    );
  }

  toggleStar(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${id}/star`,
      {},
    );
  }

  setPassword(id: string, request: SetPasswordRequest): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/collections/${id}/password`,
      request,
    );
  }

  verifyPassword(id: string, request: VerifyPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${id}/verify-password`,
      request,
    );
  }

  registerEmail(id: string, request: RegisterEmailRequest): Observable<GalleryEmailRegistrationDto> {
    return this.http.post<GalleryEmailRegistrationDto>(
      `${this.config.baseUrl}/api/collections/${id}/register-email`,
      request,
    );
  }

  getEmailRegistrations(id: string, params?: PaginationParams): Observable<PagedList<GalleryEmailRegistrationDto>> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<GalleryEmailRegistrationDto>>(
      `${this.config.baseUrl}/api/collections/${id}/email-registrations`,
      { params: httpParams },
    );
  }

  setExpiry(id: string, request: SetExpiryRequest): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/collections/${id}/expiry`,
      request,
    );
  }

  requestDownload(id: string, request: RequestDownloadRequest): Observable<DownloadRequestDto> {
    return this.http.post<DownloadRequestDto>(
      `${this.config.baseUrl}/api/collections/${id}/download`,
      request,
    );
  }

  getDownloadStatus(id: string, downloadId: string): Observable<DownloadRequestDto> {
    return this.http.get<DownloadRequestDto>(
      `${this.config.baseUrl}/api/collections/${id}/download/${downloadId}/status`,
    );
  }

  getDownloadActivity(id: string, params?: { from?: string; to?: string; page?: number; pageSize?: number }): Observable<PagedList<GalleryActivityDto>> {
    let httpParams = new HttpParams();
    if (params?.from != null) httpParams = httpParams.set('from', params.from);
    if (params?.to != null) httpParams = httpParams.set('to', params.to);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<GalleryActivityDto>>(
      `${this.config.baseUrl}/api/collections/${id}/download-activity`,
      { params: httpParams },
    );
  }

  resetDownloadLimit(id: string, request: ResetDownloadLimitRequest): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/collections/${id}/download-limit`,
      request,
    );
  }

  sendInvitation(id: string, command: SendEmailInvitationCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/collections/${id}/invite`,
      command,
    );
  }

  createQuickShare(id: string, request: CreateQuickShareRequest): Observable<QuickShareLinkDto> {
    return this.http.post<QuickShareLinkDto>(
      `${this.config.baseUrl}/api/collections/${id}/quick-share`,
      request,
    );
  }

  revokeQuickShare(linkId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/collections/quick-share/${linkId}`,
    );
  }

  getActivities(id: string, params?: CollectionActivityParams): Observable<PagedList<GalleryActivityDto>> {
    let httpParams = new HttpParams();
    if (params?.type != null) httpParams = httpParams.set('type', params.type);
    if (params?.from != null) httpParams = httpParams.set('from', params.from);
    if (params?.to != null) httpParams = httpParams.set('to', params.to);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<GalleryActivityDto>>(
      `${this.config.baseUrl}/api/collections/${id}/activities`,
      { params: httpParams },
    );
  }

  setGoogleAnalytics(id: string, request: SetGoogleAnalyticsRequest): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/collections/${id}/analytics`,
      request,
    );
  }
}
