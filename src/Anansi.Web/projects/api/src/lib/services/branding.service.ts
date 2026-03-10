import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  BrandingProfileDto,
  CreateCustomDomainCommand,
  CreateWatermarkCommand,
  CustomDomainDto,
  DocumentBrandingDto,
  UpdateBrandingProfileCommand,
  UpdateWatermarkCommand,
  UpsertDocumentBrandingCommand,
  WatermarkDto,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getProfile(): Observable<BrandingProfileDto> {
    return this.http.get<BrandingProfileDto>(
      `${this.config.baseUrl}/api/branding/profile`,
    );
  }

  updateProfile(command: UpdateBrandingProfileCommand): Observable<BrandingProfileDto> {
    return this.http.put<BrandingProfileDto>(
      `${this.config.baseUrl}/api/branding/profile`,
      command,
    );
  }

  listWatermarks(): Observable<WatermarkDto[]> {
    return this.http.get<WatermarkDto[]>(
      `${this.config.baseUrl}/api/branding/watermarks`,
    );
  }

  createWatermark(command: CreateWatermarkCommand): Observable<WatermarkDto> {
    return this.http.post<WatermarkDto>(
      `${this.config.baseUrl}/api/branding/watermarks`,
      command,
    );
  }

  updateWatermark(id: string, command: UpdateWatermarkCommand): Observable<WatermarkDto> {
    return this.http.put<WatermarkDto>(
      `${this.config.baseUrl}/api/branding/watermarks/${id}`,
      command,
    );
  }

  deleteWatermark(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/branding/watermarks/${id}`,
    );
  }

  listDomains(): Observable<CustomDomainDto[]> {
    return this.http.get<CustomDomainDto[]>(
      `${this.config.baseUrl}/api/branding/domains`,
    );
  }

  createDomain(command: CreateCustomDomainCommand): Observable<CustomDomainDto> {
    return this.http.post<CustomDomainDto>(
      `${this.config.baseUrl}/api/branding/domains`,
      command,
    );
  }

  verifyDomain(id: string): Observable<CustomDomainDto> {
    return this.http.post<CustomDomainDto>(
      `${this.config.baseUrl}/api/branding/domains/${id}/verify`,
      null,
    );
  }

  deleteDomain(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/branding/domains/${id}`,
    );
  }

  listDocumentBrandings(): Observable<DocumentBrandingDto[]> {
    return this.http.get<DocumentBrandingDto[]>(
      `${this.config.baseUrl}/api/branding/documents`,
    );
  }

  getDocumentBranding(documentType: string): Observable<DocumentBrandingDto> {
    return this.http.get<DocumentBrandingDto>(
      `${this.config.baseUrl}/api/branding/documents/${documentType}`,
    );
  }

  upsertDocumentBranding(command: UpsertDocumentBrandingCommand): Observable<DocumentBrandingDto> {
    return this.http.put<DocumentBrandingDto>(
      `${this.config.baseUrl}/api/branding/documents`,
      command,
    );
  }
}
