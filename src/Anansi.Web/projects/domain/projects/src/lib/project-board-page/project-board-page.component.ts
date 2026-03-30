import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ProjectsService,
  ProjectBoardDto,
  ProjectDto,
  ProjectStageDto,
  CreateProjectCommand,
  CreateStageCommand,
  MoveProjectCommand,
  UpdateStageCommand,
} from 'api';
import {
  TopBarComponent,
  ButtonComponent,
  CardComponent,
  BadgeComponent,
  SpinnerComponent,
} from 'components';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lib-project-board-page',
  standalone: true,
  imports: [
    FormsModule,
    CdkDrag,
    CdkDropList,
    TopBarComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SpinnerComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page">
      <lib-top-bar>
        <div topbar-left>
          <h1 class="page-title">Project Pipeline</h1>
        </div>
        <div topbar-right class="header-actions">
          <lib-button variant="secondary" (clicked)="toggleStageForm()">+ Add Stage</lib-button>
          <lib-button variant="primary" (clicked)="toggleProjectForm()">+ Add Project</lib-button>
        </div>
      </lib-top-bar>

      @if (showStageForm()) {
        <div class="inline-form">
          <h3 class="form-title">New Stage</h3>
          <div class="form-row">
            <input
              class="form-input"
              type="text"
              placeholder="Stage name"
              [value]="newStageName()"
              (input)="onStageNameInput($event)"
            />
            <lib-button variant="primary" (clicked)="createStage()">Create</lib-button>
            <lib-button variant="ghost" (clicked)="toggleStageForm()">Cancel</lib-button>
          </div>
          @if (stageError()) {
            <p class="error-text">{{ stageError() }}</p>
          }
        </div>
      }

      @if (showProjectForm()) {
        <div class="inline-form">
          <h3 class="form-title">New Project</h3>
          <div class="form-fields">
            <input
              class="form-input"
              type="text"
              placeholder="Project name"
              [value]="newProjectName()"
              (input)="onProjectNameInput($event)"
            />
            <input
              class="form-input"
              type="text"
              placeholder="Project type (optional)"
              [value]="newProjectType()"
              (input)="onProjectTypeInput($event)"
            />
            <select
              class="form-select"
              [value]="newProjectStageId()"
              (change)="onStageSelect($event)"
            >
              @for (stage of stages(); track stage.id) {
                <option [value]="stage.id">{{ stage.name }}</option>
              }
            </select>
          </div>
          <div class="form-actions">
            <lib-button variant="primary" (clicked)="createProject()">Create</lib-button>
            <lib-button variant="ghost" (clicked)="toggleProjectForm()">Cancel</lib-button>
          </div>
          @if (projectError()) {
            <p class="error-text">{{ projectError() }}</p>
          }
        </div>
      }

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (error()) {
        <div class="error-container">
          <p class="error-text">{{ error() }}</p>
          <lib-button variant="secondary" (clicked)="load()">Retry</lib-button>
        </div>
      } @else {
        <div class="board">
          @for (stage of stages(); track stage.id; let si = $index) {
            <div class="column">
              <div class="column-header">
                <span class="column-title">{{ stage.name }}</span>
                <div class="column-header-actions">
                  <button class="icon-btn" title="Rename stage" (click)="onRenameStage(stage)">
                    <lucide-icon name="pencil" [size]="14"></lucide-icon>
                  </button>
                  <button class="icon-btn icon-btn--danger" title="Delete stage" (click)="onDeleteStage(stage)">
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                  <span class="column-count">{{ stage.projects.length }}</span>
                </div>
              </div>
              <div
                class="column-body"
                cdkDropList
                [cdkDropListData]="{ stageIndex: si }"
                [id]="'stage-' + stage.id"
                [cdkDropListConnectedTo]="getConnectedLists(stage.id)"
                (cdkDropListDropped)="onDrop($event)"
              >
                @for (project of stage.projects; track project.id) {
                  <lib-card class="project-card" cdkDrag [cdkDragData]="project">
                    <div class="card-content">
                      <div class="card-top">
                        <span class="project-name">{{ project.name }}</span>
                        <div class="drag-handle" cdkDragHandle>
                          <lucide-icon name="grip-vertical" [size]="16"></lucide-icon>
                        </div>
                      </div>
                      @if (project.projectType) {
                        <lib-badge variant="neutral">{{ project.projectType }}</lib-badge>
                      }
                      @if (project.contactName) {
                        <span class="contact-name">{{ project.contactName }}</span>
                      }
                    </div>
                  </lib-card>
                }
                @if (stage.projects.length === 0) {
                  <div class="empty-column">No projects</div>
                }
              </div>
            </div>
          }
          @if (stages().length === 0) {
            <div class="empty-board">
              <p class="empty-text">No stages yet. Create a stage to get started.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .inline-form {
      margin: 16px 24px;
      padding: 16px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
    }

    .form-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 12px 0;
    }

    .form-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
    }

    .form-input {
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      flex: 1;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-input::placeholder {
      color: #6E6E70;
    }

    .form-input:focus {
      border-color: #C9A962;
    }

    .form-select {
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-select:focus {
      border-color: #C9A962;
    }

    .error-text {
      color: #C94A4A;
      font-family: Inter, sans-serif;
      font-size: 13px;
      margin: 8px 0 0 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px 0;
    }

    .board {
      display: flex;
      gap: 16px;
      padding: 24px;
      overflow-x: auto;
      align-items: flex-start;
    }

    .column {
      min-width: 280px;
      max-width: 320px;
      flex: 1;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
    }

    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #3A3A3C;
      gap: 8px;
    }

    .column-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon-btn {
      background: none;
      border: none;
      color: #6E6E70;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease, background 0.15s ease;
    }

    .icon-btn:hover {
      color: #C9A962;
      background: #1A1A1C;
    }

    .icon-btn--danger:hover {
      color: #C94A4A;
    }

    .column-title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .column-count {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      background: #1A1A1C;
      padding: 2px 8px;
      border-radius: 8px;
    }

    .column-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .project-card {
      display: block;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .project-name {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .drag-handle {
      color: #6E6E70;
      cursor: grab;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      transition: color 0.15s ease;
    }

    .drag-handle:hover {
      color: #C9A962;
    }

    .cdk-drag-preview {
      background: #242426;
      border: 1px solid #C9A962;
      border-radius: 20px;
      padding: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .cdk-drag-placeholder {
      background: #3A3A3C;
      border: 1px dashed #C9A962;
      border-radius: 20px;
      min-height: 60px;
      opacity: 0.4;
    }

    .cdk-drag-animating {
      transition: transform 200ms ease;
    }

    .column-body.cdk-drop-list-dragging .project-card:not(.cdk-drag-placeholder) {
      transition: transform 200ms ease;
    }

    .contact-name {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    .empty-column {
      text-align: center;
      padding: 24px 0;
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 13px;
    }

    .empty-board {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 64px 0;
    }

    .empty-text {
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
    }
  `,
})
export class ProjectBoardPageComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);

  readonly board = signal<ProjectBoardDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly stages = computed<ProjectStageDto[]>(() => {
    const b = this.board();
    return b ? b.stages : [];
  });

  // Stage form
  readonly showStageForm = signal(false);
  readonly newStageName = signal('');
  readonly stageError = signal<string | null>(null);

  // Project form
  readonly showProjectForm = signal(false);
  readonly newProjectName = signal('');
  readonly newProjectType = signal('');
  readonly newProjectStageId = signal('');
  readonly projectError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectsService.getBoard().subscribe({
      next: (result: ProjectBoardDto) => {
        this.board.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load project board.');
        this.loading.set(false);
      },
    });
  }

  toggleStageForm(): void {
    const open = !this.showStageForm();
    this.showStageForm.set(open);
    if (open) {
      this.newStageName.set('');
      this.stageError.set(null);
    }
  }

  onStageNameInput(event: Event): void {
    this.newStageName.set((event.target as HTMLInputElement).value);
  }

  createStage(): void {
    const name = this.newStageName().trim();
    if (!name) {
      this.stageError.set('Stage name is required.');
      return;
    }
    const sortOrder = this.stages().length;
    const command: CreateStageCommand = { name, sortOrder };
    this.stageError.set(null);
    this.projectsService.createStage(command).subscribe({
      next: () => {
        this.showStageForm.set(false);
        this.newStageName.set('');
        this.load();
      },
      error: () => {
        this.stageError.set('Failed to create stage.');
      },
    });
  }

  toggleProjectForm(): void {
    const open = !this.showProjectForm();
    this.showProjectForm.set(open);
    if (open) {
      this.newProjectName.set('');
      this.newProjectType.set('');
      this.projectError.set(null);
      const stages = this.stages();
      this.newProjectStageId.set(stages.length > 0 ? stages[0].id : '');
    }
  }

  onProjectNameInput(event: Event): void {
    this.newProjectName.set((event.target as HTMLInputElement).value);
  }

  onProjectTypeInput(event: Event): void {
    this.newProjectType.set((event.target as HTMLInputElement).value);
  }

  onStageSelect(event: Event): void {
    this.newProjectStageId.set((event.target as HTMLSelectElement).value);
  }

  createProject(): void {
    const name = this.newProjectName().trim();
    if (!name) {
      this.projectError.set('Project name is required.');
      return;
    }
    const stageId = this.newProjectStageId();
    if (!stageId) {
      this.projectError.set('Please select a stage.');
      return;
    }
    const projectType = this.newProjectType().trim() || undefined;
    const command: CreateProjectCommand = { name, projectType, stageId };
    this.projectError.set(null);
    this.projectsService.create(command).subscribe({
      next: () => {
        this.showProjectForm.set(false);
        this.newProjectName.set('');
        this.newProjectType.set('');
        this.load();
      },
      error: () => {
        this.projectError.set('Failed to create project.');
      },
    });
  }

  getConnectedLists(currentStageId: string): string[] {
    return this.stages()
      .filter((s) => s.id !== currentStageId)
      .map((s) => 'stage-' + s.id);
  }

  onDrop(event: CdkDragDrop<{ stageIndex: number }>): void {
    const board = this.board();
    if (!board) return;

    const prevStageIndex = event.previousContainer.data.stageIndex;
    const curStageIndex = event.container.data.stageIndex;
    const stages = [...board.stages].map((s) => ({
      ...s,
      projects: [...s.projects],
    }));

    if (prevStageIndex === curStageIndex) {
      moveItemInArray(stages[curStageIndex].projects, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        stages[prevStageIndex].projects,
        stages[curStageIndex].projects,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.board.set({ stages });

    const movedProject = stages[curStageIndex].projects[event.currentIndex];
    const targetStage = stages[curStageIndex];
    const command: MoveProjectCommand = {
      id: movedProject.id,
      stageId: targetStage.id,
      sortOrder: event.currentIndex,
    };
    this.projectsService.move(movedProject.id, command).subscribe({
      error: () => {
        this.load();
      },
    });
  }

  onRenameStage(stage: ProjectStageDto): void {
    const newName = prompt('Rename stage:', stage.name);
    if (newName && newName.trim() && newName.trim() !== stage.name) {
      this.projectsService.updateStage(stage.id, {
        id: stage.id,
        name: newName.trim(),
        sortOrder: stage.sortOrder,
      }).subscribe({
        next: () => this.load(),
      });
    }
  }

  onDeleteStage(stage: ProjectStageDto): void {
    if (stage.projects.length > 0) {
      alert('Cannot delete a stage that contains projects. Move or remove all projects first.');
      return;
    }
    if (confirm(`Delete stage "${stage.name}"?`)) {
      this.projectsService.deleteStage(stage.id).subscribe({
        next: () => this.load(),
      });
    }
  }
}
