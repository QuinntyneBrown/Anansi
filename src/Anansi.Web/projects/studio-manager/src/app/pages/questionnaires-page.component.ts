import { Component, inject, signal, OnInit } from '@angular/core';
import {
  CreateQuestionnaireCommand,
  PagedList,
  QuestionnaireDto,
  QuestionnairesService,
  QuestionnaireStatus,
  QuestionType,
} from 'api';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  InputGroupComponent,
  PillTabBarComponent,
  SpinnerComponent,
  TableDataRowComponent,
  TableHeaderRowComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

type QuestionnaireFilter = 'All' | 'Draft' | 'Sent' | 'Completed';

@Component({
  selector: 'sm-questionnaires-page',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    FormsModule,
    InputGroupComponent,
    PillTabBarComponent,
    SpinnerComponent,
    TableDataRowComponent,
    TableHeaderRowComponent,
  ],
  template: `
    <div class="page">
      <div class="page__header">
        <div>
          <h1 class="page__title">Questionnaires</h1>
          <p class="page__subtitle">Send intake forms, manage templates, and keep response workflows moving.</p>
        </div>
        <lib-button variant="primary" (clicked)="toggleCreateForm()">
          {{ showCreateForm() ? 'Close' : '+ New Questionnaire' }}
        </lib-button>
      </div>

      @if (showCreateForm()) {
        <div class="create-form">
          <lib-card>
            <div card-header class="card-title">Create Questionnaire</div>
            <div class="form-grid">
              <lib-input-group
                label="Title"
                placeholder="Pre-session questionnaire"
                [(ngModel)]="newTitle"
              />
              <lib-input-group
                label="Description"
                placeholder="Help us prepare for your session"
                [(ngModel)]="newDescription"
              />
              <lib-input-group
                label="First Question"
                placeholder="Tell us about your vision for the session"
                [(ngModel)]="newQuestionLabel"
              />
              <div class="select-group">
                <label class="select-label" for="question-type">Question Type</label>
                <select
                  id="question-type"
                  class="select-input"
                  [value]="newQuestionType()"
                  (change)="onQuestionTypeChange($event)"
                >
                  <option [value]="questionType.ShortText">Short Text</option>
                  <option [value]="questionType.LongText">Long Text</option>
                  <option [value]="questionType.Email">Email</option>
                  <option [value]="questionType.Date">Date</option>
                </select>
              </div>
              <div class="checkbox-row">
                <label><input type="checkbox" [(ngModel)]="newAllowMultipleSubmissions" /> Allow multiple submissions</label>
                <label><input type="checkbox" [(ngModel)]="newAutoRemindersEnabled" /> Auto reminders</label>
                <label><input type="checkbox" [(ngModel)]="newIsTemplate" /> Save as template</label>
              </div>
            </div>
            <div class="form-actions">
              <lib-button variant="outline" (clicked)="cancelCreate()">Cancel</lib-button>
              <lib-button variant="primary" (clicked)="submitCreate()">Create Questionnaire</lib-button>
            </div>
          </lib-card>
        </div>
      }

      <div class="toolbar">
        <input
          class="search-input"
          type="text"
          placeholder="Search questionnaires..."
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearchChange($event)"
        />
      </div>

      <lib-pill-tab-bar
        [tabs]="statusTabs"
        [activeTab]="activeFilter()"
        (tabChange)="onFilterChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (questionnaires().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No questionnaires found"
            description="Create a questionnaire to start collecting client information."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-title">Title</span>
            <span class="col-status">Status</span>
            <span class="col-questions">Questions</span>
            <span class="col-template">Template</span>
            <span class="col-created">Created</span>
          </lib-table-header-row>

          @for (questionnaire of questionnaires(); track questionnaire.id) {
            <lib-table-data-row>
              <span class="col-title title-text">{{ questionnaire.title }}</span>
              <span class="col-status">
                <lib-badge [variant]="getStatusBadgeVariant(questionnaire.status)">
                  {{ getStatusLabel(questionnaire.status) }}
                </lib-badge>
              </span>
              <span class="col-questions">{{ questionnaire.questions.length }}</span>
              <span class="col-template">{{ questionnaire.isTemplate ? 'Yes' : 'No' }}</span>
              <span class="col-created">{{ formatDate(questionnaire.createdAt) }}</span>
            </lib-table-data-row>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 24px;
    }

    .page__header {
      align-items: flex-start;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .page__title {
      color: #F5F5F0;
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .page__subtitle {
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
      margin: 8px 0 0;
    }

    .create-form {
      margin-bottom: 24px;
    }

    .card-title {
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      gap: 16px;
      padding: 16px;
    }

    .select-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .select-label {
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
    }

    .select-input {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      color: #F5F5F0;
      padding: 12px 16px;
    }

    .checkbox-row {
      color: #F5F5F0;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-family: Inter, sans-serif;
      font-size: 13px;
    }

    .checkbox-row label {
      align-items: center;
      display: flex;
      gap: 8px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 0 16px 16px;
    }

    .toolbar {
      margin-bottom: 16px;
    }

    .search-input {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      padding: 12px 16px;
      width: min(360px, 100%);
    }

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .table-container {
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      margin-top: 24px;
      overflow: hidden;
    }

    .col-title { flex: 2; }
    .col-status { flex: 1; }
    .col-questions { flex: 1; }
    .col-template { flex: 1; }
    .col-created { flex: 1.2; }

    .title-text {
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-weight: 500;
    }
  `,
})
export class QuestionnairesPageComponent implements OnInit {
  private readonly questionnairesService = inject(QuestionnairesService);

  readonly questionType = QuestionType;
  readonly questionnaires = signal<QuestionnaireDto[]>([]);
  readonly loading = signal(true);
  readonly showCreateForm = signal(false);
  readonly activeFilter = signal<QuestionnaireFilter>('All');
  readonly searchQuery = signal('');
  readonly newQuestionType = signal<QuestionType>(QuestionType.ShortText);

  newTitle = '';
  newDescription = '';
  newQuestionLabel = '';
  newAllowMultipleSubmissions = false;
  newAutoRemindersEnabled = true;
  newIsTemplate = false;

  readonly statusTabs = [
    { label: 'All', icon: 'layers', value: 'All' },
    { label: 'Draft', icon: 'file-edit', value: 'Draft' },
    { label: 'Sent', icon: 'send', value: 'Sent' },
    { label: 'Completed', icon: 'check-circle', value: 'Completed' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.questionnairesService.list({
      status: this.getStatusFilter(),
      search: this.searchQuery() || undefined,
      page: 1,
      pageSize: 10,
    }).subscribe({
      next: (result: PagedList<QuestionnaireDto>) => {
        this.questionnaires.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.resetForm();
  }

  onFilterChange(value: string): void {
    this.activeFilter.set(value as QuestionnaireFilter);
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.load();
  }

  onQuestionTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as QuestionType;
    this.newQuestionType.set(value);
  }

  submitCreate(): void {
    const title = this.newTitle.trim();
    const questionLabel = this.newQuestionLabel.trim();
    if (!title || !questionLabel) {
      return;
    }

    const command: CreateQuestionnaireCommand = {
      title,
      description: this.newDescription.trim() || undefined,
      allowMultipleSubmissions: this.newAllowMultipleSubmissions,
      autoRemindersEnabled: this.newAutoRemindersEnabled,
      reminderIntervalDays: this.newAutoRemindersEnabled ? 3 : undefined,
      isTemplate: this.newIsTemplate,
      templateName: this.newIsTemplate ? title : undefined,
      questions: [
        {
          label: questionLabel,
          questionType: this.newQuestionType(),
          isRequired: true,
          sortOrder: 0,
        },
      ],
    };

    this.questionnairesService.create(command).subscribe({
      next: (questionnaire) => {
        this.questionnaires.set([questionnaire, ...this.questionnaires()]);
        this.showCreateForm.set(false);
        this.resetForm();
      },
    });
  }

  getStatusLabel(status: QuestionnaireStatus): string {
    return QuestionnaireStatus[status] ?? 'Unknown';
  }

  getStatusBadgeVariant(
    status: QuestionnaireStatus,
  ): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case QuestionnaireStatus.Completed:
        return 'success';
      case QuestionnaireStatus.Sent:
      case QuestionnaireStatus.Viewed:
        return 'warning';
      default:
        return 'neutral';
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private getStatusFilter(): QuestionnaireStatus | undefined {
    switch (this.activeFilter()) {
      case 'Draft':
        return QuestionnaireStatus.Draft;
      case 'Sent':
        return QuestionnaireStatus.Sent;
      case 'Completed':
        return QuestionnaireStatus.Completed;
      default:
        return undefined;
    }
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.newQuestionLabel = '';
    this.newAllowMultipleSubmissions = false;
    this.newAutoRemindersEnabled = true;
    this.newIsTemplate = false;
    this.newQuestionType.set(QuestionType.ShortText);
  }
}
