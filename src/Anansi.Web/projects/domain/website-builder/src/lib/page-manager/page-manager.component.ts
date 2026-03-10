import { Component, inject, signal, input, OnInit } from '@angular/core';
import {
  WebsitePagesService,
  WebsitePageDto,
  WebsitePageType,
  CreatePageCommand,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  TableHeaderRowComponent,
  TableDataRowComponent,
  EmptyStateComponent,
  InputGroupComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-page-manager',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
    EmptyStateComponent,
    InputGroupComponent,
    FormsModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Pages</h1>
        <lib-button variant="primary" (clicked)="toggleAddForm()">+ Add Page</lib-button>
      </div>

      @if (showAddForm()) {
        <div class="add-form">
          <lib-card>
            <div card-header class="form-header">
              <h3 class="form-title">Add New Page</h3>
            </div>
            <div class="form-body">
              <div class="form-row">
                <lib-input-group
                  label="Title"
                  placeholder="Page title"
                  [(ngModel)]="newTitle"
                />
                <lib-input-group
                  label="Slug"
                  placeholder="page-slug"
                  [(ngModel)]="newSlug"
                />
                <div class="select-group">
                  <label class="select-label">Page Type</label>
                  <select
                    class="select-input"
                    [value]="newPageType()"
                    (change)="onPageTypeChange($event)"
                  >
                    @for (pt of pageTypeOptions; track pt.value) {
                      <option [value]="pt.value">{{ pt.label }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-actions">
                <lib-button variant="outline" (clicked)="cancelAdd()">Cancel</lib-button>
                <lib-button variant="primary" (clicked)="submitAdd()">Create Page</lib-button>
              </div>
            </div>
          </lib-card>
        </div>
      }

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (pages().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No pages yet"
            description="Add a page to get started building your website."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-order">#</span>
            <span class="col-title">Title</span>
            <span class="col-slug">Slug</span>
            <span class="col-type">Type</span>
            <span class="col-visible">Visible</span>
            <span class="col-nav">Navigation</span>
          </lib-table-header-row>

          @for (page of pages(); track page.id) {
            <lib-table-data-row>
              <span class="col-order">{{ page.sortOrder }}</span>
              <span class="col-title">{{ page.title }}</span>
              <span class="col-slug slug-text">/{{ page.slug }}</span>
              <span class="col-type">
                <lib-badge [variant]="getPageTypeBadgeVariant(page.pageType)">{{ getPageTypeLabel(page.pageType) }}</lib-badge>
              </span>
              <span class="col-visible">
                <span class="visibility-indicator" [class.visibility-indicator--visible]="page.isVisible">
                  {{ page.isVisible ? 'Visible' : 'Hidden' }}
                </span>
              </span>
              <span class="col-nav">{{ page.showInNavigation ? 'Yes' : 'No' }}</span>
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
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .add-form {
      padding: 0 24px 24px;
    }

    .form-header {
      display: flex;
      align-items: center;
    }

    .form-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .form-body {
      padding: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .select-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .select-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
    }

    .select-input {
      font-family: Inter, sans-serif;
      font-size: 14px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 12px 16px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .select-input:focus {
      border-color: #C9A962;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .table-container {
      margin: 0 24px;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
    }

    .col-order { flex: 0.5; }
    .col-title { flex: 2; }
    .col-slug { flex: 1.5; }
    .col-type { flex: 1; }
    .col-visible { flex: 1; }
    .col-nav { flex: 1; }

    .slug-text {
      font-family: monospace;
      font-size: 13px;
      color: #6E6E70;
    }

    .visibility-indicator {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .visibility-indicator--visible {
      color: #6E9E6E;
    }
  `,
})
export class PageManagerComponent implements OnInit {
  private readonly pagesService = inject(WebsitePagesService);

  readonly websiteId = input.required<string>();
  readonly pages = signal<WebsitePageDto[]>([]);
  readonly loading = signal(true);
  readonly showAddForm = signal(false);

  newTitle = '';
  newSlug = '';
  readonly newPageType = signal<WebsitePageType>(WebsitePageType.Custom);
  readonly submitting = signal(false);

  readonly pageTypeOptions = [
    { value: WebsitePageType.Homepage, label: 'Homepage' },
    { value: WebsitePageType.Portfolio, label: 'Portfolio' },
    { value: WebsitePageType.About, label: 'About' },
    { value: WebsitePageType.Services, label: 'Services' },
    { value: WebsitePageType.Contact, label: 'Contact' },
    { value: WebsitePageType.Pricing, label: 'Pricing' },
    { value: WebsitePageType.Gallery, label: 'Gallery' },
    { value: WebsitePageType.Blog, label: 'Blog' },
    { value: WebsitePageType.Custom, label: 'Custom' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.pagesService.list(this.websiteId()).subscribe({
      next: (pages) => {
        this.pages.set(pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
    this.resetForm();
  }

  submitAdd(): void {
    const command: CreatePageCommand = {
      websiteId: this.websiteId(),
      title: this.newTitle,
      slug: this.newSlug,
      pageType: this.newPageType(),
    };
    this.submitting.set(true);
    this.pagesService.create(this.websiteId(), command).subscribe({
      next: (page) => {
        this.pages.set([...this.pages(), page]);
        this.showAddForm.set(false);
        this.resetForm();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  onPageTypeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value) as WebsitePageType;
    this.newPageType.set(value);
  }

  getPageTypeLabel(pageType: WebsitePageType): string {
    switch (pageType) {
      case WebsitePageType.Homepage: return 'Homepage';
      case WebsitePageType.Portfolio: return 'Portfolio';
      case WebsitePageType.About: return 'About';
      case WebsitePageType.Services: return 'Services';
      case WebsitePageType.Contact: return 'Contact';
      case WebsitePageType.Pricing: return 'Pricing';
      case WebsitePageType.Gallery: return 'Gallery';
      case WebsitePageType.Blog: return 'Blog';
      case WebsitePageType.Custom: return 'Custom';
      default: return 'Unknown';
    }
  }

  getPageTypeBadgeVariant(pageType: WebsitePageType): 'success' | 'warning' | 'neutral' {
    switch (pageType) {
      case WebsitePageType.Homepage: return 'success';
      case WebsitePageType.Portfolio: return 'warning';
      case WebsitePageType.Blog: return 'warning';
      default: return 'neutral';
    }
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newSlug = '';
    this.newPageType.set(WebsitePageType.Custom);
  }
}
