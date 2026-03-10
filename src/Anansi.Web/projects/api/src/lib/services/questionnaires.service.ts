import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreateQuestionnaireCommand,
  QuestionnaireDto,
  SubmitQuestionnaireResponseCommand,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class QuestionnairesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

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
