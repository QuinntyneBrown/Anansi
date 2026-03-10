import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  CreateProjectCommand,
  CreateStageCommand,
  MoveProjectCommand,
  ProjectBoardDto,
  ProjectDto,
  ProjectStageDto,
  UpdateStageCommand,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getBoard(): Observable<ProjectBoardDto> {
    return this.http.get<ProjectBoardDto>(
      `${this.config.baseUrl}/api/projects/board`,
    );
  }

  create(command: CreateProjectCommand): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(
      `${this.config.baseUrl}/api/projects`,
      command,
    );
  }

  move(id: string, command: MoveProjectCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/projects/${id}/move`,
      command,
    );
  }

  createStage(command: CreateStageCommand): Observable<ProjectStageDto> {
    return this.http.post<ProjectStageDto>(
      `${this.config.baseUrl}/api/projects/stages`,
      command,
    );
  }

  updateStage(id: string, command: UpdateStageCommand): Observable<void> {
    return this.http.put<void>(
      `${this.config.baseUrl}/api/projects/stages/${id}`,
      command,
    );
  }

  deleteStage(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/projects/stages/${id}`,
    );
  }
}
