import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CreateQuestionnaireCommand,
  QuestionnaireListParams,
  QuestionnaireDto,
  SubmitQuestionnaireResponseCommand,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class QuestionnairesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: QuestionnaireListParams): Observable<PagedList<QuestionnaireDto>> {
    let httpParams = new HttpParams();
    if (params?.status != null) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.search != null) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.isTemplate != null) {
      httpParams = httpParams.set('isTemplate', params.isTemplate);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<QuestionnaireDto>>(
      `${this.config.baseUrl}/api/questionnaires`,
      { params: httpParams },
    );
  }

  create(command: CreateQuestionnaireCommand): Observable<QuestionnaireDto> {
    return this.http.post<QuestionnaireDto>(
      `${this.config.baseUrl}/api/questionnaires`,
      command,
    );
  }

  get(id: string): Observable<QuestionnaireDto> {
    return this.http.get<QuestionnaireDto>(
      `${this.config.baseUrl}/api/questionnaires/${id}`,
    );
  }

  submitResponse(id: string, command: SubmitQuestionnaireResponseCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/questionnaires/${id}/responses`,
      command,
    );
  }
}
