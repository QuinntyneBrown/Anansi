import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { ProjectsService } from './projects.service';
import {
  CreateProjectCommand,
  CreateStageCommand,
  MoveProjectCommand,
  ProjectBoardDto,
  ProjectDto,
  ProjectStageDto,
  UpdateStageCommand,
} from '../models/crm.models';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(ProjectsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockProject: ProjectDto = {
    id: 'project-1',
    name: 'Smith Wedding',
    projectType: 'Wedding',
    stageId: 'stage-2',
    stageName: 'In Progress',
    contactId: 'contact-1',
    contactName: 'Jane Doe',
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockStage: ProjectStageDto = {
    id: 'stage-1',
    name: 'Inquiry',
    sortOrder: 1,
    projects: [],
  };

  describe('getBoard', () => {
    it('should GET /api/projects/board and return ProjectBoardDto', () => {
      const mockBoard: ProjectBoardDto = {
        stages: [
          {
            id: 'stage-1',
            name: 'Inquiry',
            sortOrder: 1,
            projects: [],
          },
          {
            id: 'stage-2',
            name: 'In Progress',
            sortOrder: 2,
            projects: [mockProject],
          },
          {
            id: 'stage-3',
            name: 'Completed',
            sortOrder: 3,
            projects: [],
          },
        ],
      };

      service.getBoard().subscribe((result) => {
        expect(result).toEqual(mockBoard);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBoard);
    });
  });

  describe('create', () => {
    it('should POST to /api/projects and return ProjectDto', () => {
      const command: CreateProjectCommand = {
        name: 'Smith Wedding',
        projectType: 'Wedding',
        stageId: 'stage-2',
        contactId: 'contact-1',
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockProject);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/projects`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockProject);
    });
  });

  describe('move', () => {
    it('should PUT to /api/projects/{id}/move', () => {
      const command: MoveProjectCommand = {
        id: 'project-1',
        stageId: 'stage-3',
        sortOrder: 0,
      };

      service.move('project-1', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/projects/project-1/move`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('createStage', () => {
    it('should POST to /api/projects/stages and return ProjectStageDto', () => {
      const command: CreateStageCommand = {
        name: 'Inquiry',
        sortOrder: 1,
      };

      service.createStage(command).subscribe((result) => {
        expect(result).toEqual(mockStage);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/projects/stages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockStage);
    });
  });

  describe('updateStage', () => {
    it('should PUT to /api/projects/stages/{id}', () => {
      const command: UpdateStageCommand = {
        id: 'stage-1',
        name: 'Initial Inquiry',
        sortOrder: 1,
      };

      service.updateStage('stage-1', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/projects/stages/stage-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('deleteStage', () => {
    it('should DELETE /api/projects/stages/{id}', () => {
      service.deleteStage('stage-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/projects/stages/stage-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
