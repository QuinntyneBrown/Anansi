import { Component, inject, input, signal, OnInit } from '@angular/core';
import {
  BlogCategoryDto,
  BlogPostDto,
  BlogPostStatus,
  BlogService,
  CreateBlogPostCommand,
  PagedList,
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

type StatusFilter = 'All' | 'Draft' | 'Published' | 'Scheduled';

@Component({
  selector: 'wb-blog-manager-page',
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
          <h1 class="page__title">Blog</h1>
          <p class="page__subtitle">Draft, publish, and monitor editorial content for this site.</p>
        </div>
        <lib-button variant="primary" (clicked)="toggleCreateForm()">
          {{ showCreateForm() ? 'Close' : '+ New Post' }}
        </lib-button>
      </div>

      @if (showCreateForm()) {
        <div class="create-form">
          <lib-card>
            <div card-header class="card-title">Create Blog Post</div>
            <div class="form-grid">
              <lib-input-group
                label="Title"
                placeholder="Behind the scenes of our latest session"
                [(ngModel)]="newTitle"
              />
              <lib-input-group
                label="Slug"
                placeholder="behind-the-scenes-session"
                [(ngModel)]="newSlug"
              />
              <div class="form-grid__full">
                <lib-input-group
                  label="Excerpt"
                  placeholder="Short summary for feeds and previews"
                  [(ngModel)]="newExcerpt"
                />
              </div>
              <div class="select-group">
                <label class="select-label" for="post-status">Status</label>
                <select
                  id="post-status"
                  class="select-input"
                  [value]="newStatus()"
                  (change)="onStatusSelect($event)"
                >
                  <option [value]="blogPostStatus.Draft">Draft</option>
                  <option [value]="blogPostStatus.Published">Published</option>
                  <option [value]="blogPostStatus.Scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <lib-button variant="outline" (clicked)="cancelCreate()">Cancel</lib-button>
              <lib-button variant="primary" (clicked)="submitCreate()">Create Post</lib-button>
            </div>
          </lib-card>
        </div>
      }

      @if (categories().length > 0) {
        <div class="category-row">
          @for (category of categories(); track category.id) {
            <span class="category-pill">{{ category.name }}</span>
          }
        </div>
      }

      <lib-pill-tab-bar
        [tabs]="statusTabs"
        [activeTab]="activeStatus()"
        (tabChange)="onStatusChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (posts().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No posts yet"
            description="Create your first post to start building out the blog."
          />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-title">Title</span>
            <span class="col-status">Status</span>
            <span class="col-categories">Categories</span>
            <span class="col-publish">Publish Date</span>
            <span class="col-updated">Updated</span>
          </lib-table-header-row>

          @for (post of posts(); track post.id) {
            <lib-table-data-row>
              <span class="col-title title-text">{{ post.title }}</span>
              <span class="col-status">
                <lib-badge [variant]="getStatusBadgeVariant(post.status)">
                  {{ getStatusLabel(post.status) }}
                </lib-badge>
              </span>
              <span class="col-categories">{{ getCategoryText(post) }}</span>
              <span class="col-publish">{{ post.publishDate ? formatDate(post.publishDate) : '-' }}</span>
              <span class="col-updated">{{ formatDate(post.updatedAt) }}</span>
            </lib-table-data-row>
          }
        </div>

        <div class="summary-row">
          <span>Showing {{ posts().length }} of {{ totalCount() }} posts</span>
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
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding: 16px;
    }

    .form-grid__full {
      grid-column: 1 / -1;
    }

    .select-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .select-label {
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
    }

    .select-input {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      padding: 12px 16px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 0 16px 16px;
    }

    .category-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .category-pill {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 999px;
      color: #C9A962;
      font-family: Inter, sans-serif;
      font-size: 12px;
      padding: 6px 10px;
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
    .col-categories { flex: 1.5; }
    .col-publish { flex: 1.2; }
    .col-updated { flex: 1.2; }

    .title-text {
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-weight: 500;
    }

    .summary-row {
      color: #6E6E70;
      display: flex;
      justify-content: flex-end;
      font-family: Inter, sans-serif;
      font-size: 13px;
      margin-top: 12px;
    }
  `,
})
export class BlogManagerPageComponent implements OnInit {
  private readonly blogService = inject(BlogService);

  readonly blogPostStatus = BlogPostStatus;
  readonly websiteId = input.required<string>();
  readonly posts = signal<BlogPostDto[]>([]);
  readonly categories = signal<BlogCategoryDto[]>([]);
  readonly loading = signal(true);
  readonly showCreateForm = signal(false);
  readonly activeStatus = signal<StatusFilter>('All');
  readonly newStatus = signal<BlogPostStatus>(BlogPostStatus.Draft);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  newTitle = '';
  newSlug = '';
  newExcerpt = '';

  readonly statusTabs = [
    { label: 'All', icon: 'layers', value: 'All' },
    { label: 'Draft', icon: 'file-edit', value: 'Draft' },
    { label: 'Published', icon: 'send', value: 'Published' },
    { label: 'Scheduled', icon: 'clock', value: 'Scheduled' },
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.blogService.listPosts(this.websiteId(), {
      status: this.getStatusFilter(),
      page: this.currentPage(),
      pageSize: this.pageSize,
    }).subscribe({
      next: (result: PagedList<BlogPostDto>) => {
        this.posts.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCategories(): void {
    this.blogService.listCategories(this.websiteId()).subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.resetForm();
  }

  onStatusChange(status: string): void {
    this.activeStatus.set(status as StatusFilter);
    this.currentPage.set(1);
    this.loadPosts();
  }

  onStatusSelect(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value) as BlogPostStatus;
    this.newStatus.set(value);
  }

  submitCreate(): void {
    const title = this.newTitle.trim();
    const slug = this.newSlug.trim();
    if (!title || !slug) {
      return;
    }

    const command: CreateBlogPostCommand = {
      websiteId: this.websiteId(),
      title,
      slug,
      excerpt: this.newExcerpt.trim() || undefined,
      bodyHtml: `<p>${title}</p>`,
      status: this.newStatus(),
      publishDate: this.newStatus() === BlogPostStatus.Published
        ? new Date().toISOString()
        : undefined,
    };

    this.blogService.createPost(this.websiteId(), command).subscribe({
      next: (post) => {
        this.posts.set([post, ...this.posts()]);
        this.totalCount.set(this.totalCount() + 1);
        this.showCreateForm.set(false);
        this.resetForm();
      },
    });
  }

  getStatusLabel(status: BlogPostStatus): string {
    return BlogPostStatus[status] ?? 'Unknown';
  }

  getStatusBadgeVariant(
    status: BlogPostStatus,
  ): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case BlogPostStatus.Published:
        return 'success';
      case BlogPostStatus.Scheduled:
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getCategoryText(post: BlogPostDto): string {
    if (post.categories.length === 0) {
      return 'Uncategorized';
    }

    return post.categories.map((category) => category.name).join(', ');
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private getStatusFilter(): BlogPostStatus | undefined {
    switch (this.activeStatus()) {
      case 'Draft':
        return BlogPostStatus.Draft;
      case 'Published':
        return BlogPostStatus.Published;
      case 'Scheduled':
        return BlogPostStatus.Scheduled;
      default:
        return undefined;
    }
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newSlug = '';
    this.newExcerpt = '';
    this.newStatus.set(BlogPostStatus.Draft);
  }
}
