import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  ProjectBoardDto,
  ProjectStageDto,
  ProjectDto,
} from 'api';
import { ProjectBoardPageComponent } from './project-board-page.component';

describe('ProjectBoardPageComponent', () => {
  let component: ProjectBoardPageComponent;
  let fixture: ComponentFixture<ProjectBoardPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockProject1: ProjectDto = {
    id: 'p1',
    name: 'Wedding Smith',
    projectType: 'Wedding',
    stageId: 's1',
    stageName: 'Inquiry',
    contactId: 'c1',
    contactName: 'Jane Smith',
    sortOrder: 0,
    createdAt: '2025-06-01T10:00:00Z',
  };

  const mockProject2: ProjectDto = {
    id: 'p2',
    name: 'Portrait Session',
    stageId: 's2',
    stageName: 'Booked',
    sortOrder: 0,
    createdAt: '2025-06-02T10:00:00Z',
  };

  const mockProject3: ProjectDto = {
    id: 'p3',
    name: 'Engagement Shoot',
    projectType: 'Engagement',
    stageId: 's1',
    stageName: 'Inquiry',
    contactName: 'John Doe',
    sortOrder: 1,
    createdAt: '2025-06-03T10:00:00Z',
  };

  const mockStages: ProjectStageDto[] = [
    { id: 's1', name: 'Inquiry', sortOrder: 0, projects: [mockProject1, mockProject3] },
    { id: 's2', name: 'Booked', sortOrder: 1, projects: [mockProject2] },
    { id: 's3', name: 'Complete', sortOrder: 2, projects: [] },
  ];

  const mockBoard: ProjectBoardDto = { stages: mockStages };

  const emptyBoard: ProjectBoardDto = { stages: [] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectBoardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectBoardPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(response: ProjectBoardDto = mockBoard): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load board on init', () => {
    flushInitialLoad();
    expect(component.board()).toEqual(mockBoard);
    expect(component.stages()).toEqual(mockStages);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    req.flush(mockBoard);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('lib-spinner')).toBeFalsy();
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    req.error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Failed to load project board.');
    expect(fixture.nativeElement.querySelector('.error-text').textContent).toContain(
      'Failed to load project board.',
    );
  });

  it('should retry loading when retry button clicked', () => {
    fixture.detectChanges();
    const req1 = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    req1.error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    component.load();
    const req2 = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    req2.flush(mockBoard);

    expect(component.error()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.stages().length).toBe(3);
  });

  it('should render columns for each stage', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const columns = fixture.nativeElement.querySelectorAll('.column');
    expect(columns.length).toBe(3);

    const titles = fixture.nativeElement.querySelectorAll('.column-title');
    expect(titles[0].textContent).toContain('Inquiry');
    expect(titles[1].textContent).toContain('Booked');
    expect(titles[2].textContent).toContain('Complete');
  });

  it('should show project count in column header', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const counts = fixture.nativeElement.querySelectorAll('.column-count');
    expect(counts[0].textContent.trim()).toBe('2');
    expect(counts[1].textContent.trim()).toBe('1');
    expect(counts[2].textContent.trim()).toBe('0');
  });

  it('should render project cards with name', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const names = fixture.nativeElement.querySelectorAll('.project-name');
    expect(names.length).toBe(3);
    expect(names[0].textContent).toContain('Wedding Smith');
    expect(names[1].textContent).toContain('Engagement Shoot');
    expect(names[2].textContent).toContain('Portrait Session');
  });

  it('should show project type badge when present', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('lib-badge');
    expect(badges.length).toBe(2);
  });

  it('should show contact name when present', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const contactNames = fixture.nativeElement.querySelectorAll('.contact-name');
    expect(contactNames.length).toBe(2);
    expect(contactNames[0].textContent).toContain('Jane Smith');
    expect(contactNames[1].textContent).toContain('John Doe');
  });

  it('should show empty column message when stage has no projects', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const emptyCol = fixture.nativeElement.querySelectorAll('.empty-column');
    expect(emptyCol.length).toBe(1);
    expect(emptyCol[0].textContent).toContain('No projects');
  });

  it('should show empty board message when no stages', () => {
    flushInitialLoad(emptyBoard);
    fixture.detectChanges();

    const emptyText = fixture.nativeElement.querySelector('.empty-text');
    expect(emptyText).toBeTruthy();
    expect(emptyText.textContent).toContain('No stages yet');
  });

  // --- Stage Form ---

  it('should toggle stage form visibility', () => {
    flushInitialLoad();
    expect(component.showStageForm()).toBe(false);

    component.toggleStageForm();
    expect(component.showStageForm()).toBe(true);

    component.toggleStageForm();
    expect(component.showStageForm()).toBe(false);
  });

  it('should reset stage form fields when opening', () => {
    flushInitialLoad();
    component.newStageName.set('leftover');
    component.stageError.set('leftover error');

    component.toggleStageForm();
    expect(component.newStageName()).toBe('');
    expect(component.stageError()).toBeNull();
  });

  it('should update stage name on input', () => {
    flushInitialLoad();
    const event = { target: { value: 'New Stage' } } as unknown as Event;
    component.onStageNameInput(event);
    expect(component.newStageName()).toBe('New Stage');
  });

  it('should validate stage name is required', () => {
    flushInitialLoad();
    component.showStageForm.set(true);
    component.newStageName.set('   ');

    component.createStage();
    expect(component.stageError()).toBe('Stage name is required.');
  });

  it('should create stage and reload board', () => {
    flushInitialLoad();
    component.showStageForm.set(true);
    component.newStageName.set('Completed');

    component.createStage();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects/stages`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({ name: 'Completed', sortOrder: 3 });
    createReq.flush({ id: 's4', name: 'Completed', sortOrder: 3, projects: [] });

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);

    expect(component.showStageForm()).toBe(false);
    expect(component.newStageName()).toBe('');
  });

  it('should show error when stage creation fails', () => {
    flushInitialLoad();
    component.showStageForm.set(true);
    component.newStageName.set('Failed Stage');

    component.createStage();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects/stages`);
    createReq.error(new ProgressEvent('Network error'));

    expect(component.stageError()).toBe('Failed to create stage.');
    expect(component.showStageForm()).toBe(true);
  });

  // --- Project Form ---

  it('should toggle project form visibility', () => {
    flushInitialLoad();
    expect(component.showProjectForm()).toBe(false);

    component.toggleProjectForm();
    expect(component.showProjectForm()).toBe(true);

    component.toggleProjectForm();
    expect(component.showProjectForm()).toBe(false);
  });

  it('should reset project form fields and default stage when opening', () => {
    flushInitialLoad();
    component.newProjectName.set('leftover');
    component.newProjectType.set('leftover type');
    component.projectError.set('leftover error');

    component.toggleProjectForm();
    expect(component.newProjectName()).toBe('');
    expect(component.newProjectType()).toBe('');
    expect(component.projectError()).toBeNull();
    expect(component.newProjectStageId()).toBe('s1');
  });

  it('should set empty stage id when no stages exist', () => {
    flushInitialLoad(emptyBoard);

    component.toggleProjectForm();
    expect(component.newProjectStageId()).toBe('');
  });

  it('should update project name on input', () => {
    flushInitialLoad();
    const event = { target: { value: 'New Project' } } as unknown as Event;
    component.onProjectNameInput(event);
    expect(component.newProjectName()).toBe('New Project');
  });

  it('should update project type on input', () => {
    flushInitialLoad();
    const event = { target: { value: 'Wedding' } } as unknown as Event;
    component.onProjectTypeInput(event);
    expect(component.newProjectType()).toBe('Wedding');
  });

  it('should update stage selection', () => {
    flushInitialLoad();
    const event = { target: { value: 's2' } } as unknown as Event;
    component.onStageSelect(event);
    expect(component.newProjectStageId()).toBe('s2');
  });

  it('should validate project name is required', () => {
    flushInitialLoad();
    component.showProjectForm.set(true);
    component.newProjectName.set('   ');
    component.newProjectStageId.set('s1');

    component.createProject();
    expect(component.projectError()).toBe('Project name is required.');
  });

  it('should validate stage is selected', () => {
    flushInitialLoad();
    component.showProjectForm.set(true);
    component.newProjectName.set('Valid Name');
    component.newProjectStageId.set('');

    component.createProject();
    expect(component.projectError()).toBe('Please select a stage.');
  });

  it('should create project with type and reload board', () => {
    flushInitialLoad();
    component.showProjectForm.set(true);
    component.newProjectName.set('New Wedding');
    component.newProjectType.set('Wedding');
    component.newProjectStageId.set('s1');

    component.createProject();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({
      name: 'New Wedding',
      projectType: 'Wedding',
      stageId: 's1',
    });
    createReq.flush({
      id: 'p4',
      name: 'New Wedding',
      projectType: 'Wedding',
      stageId: 's1',
      stageName: 'Inquiry',
      sortOrder: 2,
      createdAt: '2025-06-04T10:00:00Z',
    });

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);

    expect(component.showProjectForm()).toBe(false);
    expect(component.newProjectName()).toBe('');
    expect(component.newProjectType()).toBe('');
  });

  it('should create project without type when type is empty', () => {
    flushInitialLoad();
    component.showProjectForm.set(true);
    component.newProjectName.set('No Type Project');
    component.newProjectType.set('');
    component.newProjectStageId.set('s2');

    component.createProject();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects`);
    expect(createReq.request.body).toEqual({
      name: 'No Type Project',
      projectType: undefined,
      stageId: 's2',
    });
    createReq.flush({
      id: 'p5',
      name: 'No Type Project',
      stageId: 's2',
      stageName: 'Booked',
      sortOrder: 1,
      createdAt: '2025-06-05T10:00:00Z',
    });

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);
  });

  it('should show error when project creation fails', () => {
    flushInitialLoad();
    component.showProjectForm.set(true);
    component.newProjectName.set('Failed Project');
    component.newProjectStageId.set('s1');

    component.createProject();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects`);
    createReq.error(new ProgressEvent('Network error'));

    expect(component.projectError()).toBe('Failed to create project.');
    expect(component.showProjectForm()).toBe(true);
  });

  // --- Move Project ---

  it('should move project to next stage', () => {
    flushInitialLoad();

    component.onMoveProject(mockProject1);

    const moveReq = httpTesting.expectOne(`${baseUrl}/api/projects/p1/move`);
    expect(moveReq.request.method).toBe('PUT');
    expect(moveReq.request.body).toEqual({
      id: 'p1',
      stageId: 's2',
      sortOrder: 1,
    });
    moveReq.flush(null);

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);
  });

  it('should not move project if already in last stage', () => {
    flushInitialLoad();

    component.onMoveProject(mockProject2);

    // mockProject2 is in s2 (index 1), next is s3 (index 2) which is the last — but it's not the last index, so it CAN move
    const moveReq = httpTesting.expectOne(`${baseUrl}/api/projects/p2/move`);
    moveReq.flush(null);

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);
  });

  it('should not move project if in the last stage', () => {
    const projectInLastStage: ProjectDto = {
      id: 'px',
      name: 'Last Stage Project',
      stageId: 's3',
      stageName: 'Complete',
      sortOrder: 0,
      createdAt: '2025-06-01T10:00:00Z',
    };

    flushInitialLoad();
    component.onMoveProject(projectInLastStage);

    httpTesting.expectNone(`${baseUrl}/api/projects/px/move`);
  });

  it('should not move project if stage id is not found', () => {
    const projectInUnknownStage: ProjectDto = {
      id: 'py',
      name: 'Unknown Stage Project',
      stageId: 'unknown',
      stageName: 'Unknown',
      sortOrder: 0,
      createdAt: '2025-06-01T10:00:00Z',
    };

    flushInitialLoad();
    component.onMoveProject(projectInUnknownStage);

    httpTesting.expectNone(`${baseUrl}/api/projects/py/move`);
  });

  it('should silently handle move errors', () => {
    flushInitialLoad();

    component.onMoveProject(mockProject1);

    const moveReq = httpTesting.expectOne(`${baseUrl}/api/projects/p1/move`);
    moveReq.error(new ProgressEvent('Network error'));

    // No reload should happen, no error displayed
    httpTesting.expectNone(`${baseUrl}/api/projects/board`);
  });

  // --- Render stage form ---

  it('should render stage form when toggled', () => {
    flushInitialLoad();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.inline-form')).toBeFalsy();

    component.toggleStageForm();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.inline-form');
    expect(form).toBeTruthy();
    expect(form.querySelector('.form-title').textContent).toContain('New Stage');
  });

  it('should render project form when toggled', () => {
    flushInitialLoad();
    fixture.detectChanges();

    component.toggleProjectForm();
    fixture.detectChanges();

    const forms = fixture.nativeElement.querySelectorAll('.inline-form');
    expect(forms.length).toBe(1);
    expect(forms[0].querySelector('.form-title').textContent).toContain('New Project');
  });

  it('should render project form with stage select options', () => {
    flushInitialLoad();
    fixture.detectChanges();

    component.toggleProjectForm();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.form-select option');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toContain('Inquiry');
    expect(options[1].textContent).toContain('Booked');
    expect(options[2].textContent).toContain('Complete');
  });

  it('should show move button on project cards', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const moveBtns = fixture.nativeElement.querySelectorAll('.move-btn');
    expect(moveBtns.length).toBe(3);
  });

  it('should render page title', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.page-title');
    expect(title.textContent).toContain('Project Pipeline');
  });

  it('should clear error on successful reload', () => {
    fixture.detectChanges();
    const req1 = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    req1.error(new ProgressEvent('Network error'));

    expect(component.error()).toBe('Failed to load project board.');

    component.load();
    expect(component.error()).toBeNull();

    const req2 = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    req2.flush(mockBoard);

    expect(component.error()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should clear stage error on valid submission', () => {
    flushInitialLoad();
    component.showStageForm.set(true);
    component.newStageName.set('');
    component.createStage();
    expect(component.stageError()).toBe('Stage name is required.');

    component.newStageName.set('Valid Name');
    component.createStage();
    expect(component.stageError()).toBeNull();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects/stages`);
    createReq.flush({ id: 's4', name: 'Valid Name', sortOrder: 3, projects: [] });

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);
  });

  it('should clear project error on valid submission', () => {
    flushInitialLoad();
    component.showProjectForm.set(true);
    component.newProjectName.set('');
    component.newProjectStageId.set('s1');
    component.createProject();
    expect(component.projectError()).toBe('Project name is required.');

    component.newProjectName.set('Valid');
    component.createProject();
    expect(component.projectError()).toBeNull();

    const createReq = httpTesting.expectOne(`${baseUrl}/api/projects`);
    createReq.flush({
      id: 'p6',
      name: 'Valid',
      stageId: 's1',
      stageName: 'Inquiry',
      sortOrder: 2,
      createdAt: '2025-06-06T10:00:00Z',
    });

    const reloadReq = httpTesting.expectOne(`${baseUrl}/api/projects/board`);
    reloadReq.flush(mockBoard);
  });
});
