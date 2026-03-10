import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  AutomatedEmailConfigDto,
  CreateEmailTemplateCommand,
  EmailConversationDto,
  EmailConversationListParams,
  EmailTemplateDto,
  SendEmailCommand,
  UpsertAutomatedEmailConfigCommand,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  listConversations(params?: EmailConversationListParams): Observable<PagedList<EmailConversationDto>> {
    let httpParams = new HttpParams();
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<EmailConversationDto>>(
      `${this.config.baseUrl}/api/email/conversations`,
      { params: httpParams },
    );
  }

  send(command: SendEmailCommand): Observable<EmailConversationDto> {
    return this.http.post<EmailConversationDto>(
      `${this.config.baseUrl}/api/email/send`,
      command,
    );
  }

  createTemplate(command: CreateEmailTemplateCommand): Observable<EmailTemplateDto> {
    return this.http.post<EmailTemplateDto>(
      `${this.config.baseUrl}/api/email/templates`,
      command,
    );
  }

  listTemplates(category?: string): Observable<EmailTemplateDto[]> {
    let httpParams = new HttpParams();
    if (category != null) {
      httpParams = httpParams.set('category', category);
    }
    return this.http.get<EmailTemplateDto[]>(
      `${this.config.baseUrl}/api/email/templates`,
      { params: httpParams },
    );
  }

  upsertAutomatedConfig(command: UpsertAutomatedEmailConfigCommand): Observable<AutomatedEmailConfigDto> {
    return this.http.post<AutomatedEmailConfigDto>(
      `${this.config.baseUrl}/api/email/automated-configs`,
      command,
    );
  }

  listAutomatedConfigs(): Observable<AutomatedEmailConfigDto[]> {
    return this.http.get<AutomatedEmailConfigDto[]>(
      `${this.config.baseUrl}/api/email/automated-configs`,
    );
  }
}
