import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CreateWebsiteCommand,
  WebsiteDto,
  WebsitesService,
  WebsiteStatus,
} from 'api';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  InputGroupComponent,
  SpinnerComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wb-website-list-page',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    FormsModule,
    InputGroupComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="page">
      <div class="page__header">
        <div>
          <h1 class="page__title">Websites</h1>
          <p class="page__subtitle">Create a site, publish it, and jump into editing workflows.</p>
        </div>
        <lib-button variant="primary" (clicked)="toggleCreateForm()">
          {{ showCreateForm() ? 'Close' : '+ New Website' }}
        </lib-button>
      </div>

      @if (showCreateForm()) {
        <div class="create-form">
          <lib-card>
            <div card-header class="card-title">Create Website</div>
            <div class="form-grid">
              <lib-input-group
                label="Site Name"
                placeholder="Studio Portfolio"
                [(ngModel)]="newName"
              />
              <lib-input-group
                label="Subdomain"
                placeholder="studio-portfolio"
                [(ngModel)]="newSubdomain"
              />
              <div class="form-grid__full">
                <lib-input-group
                  label="Description"
                  placeholder="Short description for the website"
                  [(ngModel)]="newDescription"
                />
              </div>
            </div>
            <div class="form-actions">
              <lib-button variant="outline" (clicked)="cancelCreate()">Cancel</lib-button>
              <lib-button variant="primary" (clicked)="submitCreate()">Create Website</lib-button>
            </div>
          </lib-card>
        </div>
      }

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (websites().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No websites yet"
            description="Create your first website to start managing pages, SEO, blog posts, and analytics."
          />
        </div>
      } @else {
        <div class="site-grid">
          @for (site of websites(); track site.id) {
            <lib-card>
              <div class="site-card">
                <div class="site-card__header">
                  <div>
                    <h2 class="site-card__title">{{ site.name }}</h2>
                    <p class="site-card__domain">{{ getDomainLabel(site) }}</p>
                  </div>
                  <lib-badge [variant]="getStatusBadgeVariant(site.status)">
                    {{ getStatusLabel(site.status) }}
                  </lib-badge>
                </div>

                @if (site.description) {
                  <p class="site-card__description">{{ site.description }}</p>
                }

                <div class="site-card__stats">
                  <span>Blog layout: {{ site.blogLayout }}</span>
                  <span>Analytics: {{ site.builtInAnalyticsEnabled ? 'On' : 'Off' }}</span>
                  <span>Created: {{ formatDate(site.createdAt) }}</span>
                </div>

                <div class="site-card__actions">
                  <lib-button variant="outline" (clicked)="manageSite(site.id)">Manage</lib-button>
                  @if (site.status === websiteStatus.Draft) {
                    <lib-button variant="primary" (clicked)="publishSite(site.id)">Publish</lib-button>
                  }
                </div>
              </div>
            </lib-card>
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
      max-width: 560px;
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

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 0 16px 16px;
    }

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .site-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }

    .site-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 4px 0;
    }

    .site-card__header {
      align-items: flex-start;
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }

    .site-card__title {
      color: #F5F5F0;
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      margin: 0;
    }

    .site-card__domain {
      color: #C9A962;
      font-family: Inter, sans-serif;
      font-size: 13px;
      margin: 6px 0 0;
    }

    .site-card__description {
      color: #B8B8BC;
      font-family: Inter, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
    }

    .site-card__stats {
      color: #6E6E70;
      display: flex;
      flex-direction: column;
      font-family: Inter, sans-serif;
      font-size: 13px;
      gap: 6px;
    }

    .site-card__actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  `,
})
export class WebsiteListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly websitesService = inject(WebsitesService);

  readonly websiteStatus = WebsiteStatus;
  readonly websites = signal<WebsiteDto[]>([]);
  readonly loading = signal(true);
  readonly showCreateForm = signal(false);
  readonly submitting = signal(false);

  newName = '';
  newSubdomain = '';
  newDescription = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.websitesService.list().subscribe({
      next: (websites) => {
        this.websites.set(websites);
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

  submitCreate(): void {
    const name = this.newName.trim();
    const subdomain = this.newSubdomain.trim();
    if (!name || !subdomain || this.submitting()) {
      return;
    }

    const command: CreateWebsiteCommand = {
      name,
      description: this.newDescription.trim() || undefined,
      subdomain,
    };

    this.submitting.set(true);
    this.websitesService.create(command).subscribe({
      next: (website) => {
        this.websites.set([website, ...this.websites()]);
        this.showCreateForm.set(false);
        this.resetForm();
        this.submitting.set(false);
        this.manageSite(website.id);
      },
      error: () => this.submitting.set(false),
    });
  }

  manageSite(siteId: string): void {
    this.router.navigate(['/sites', siteId, 'templates']);
  }

  publishSite(siteId: string): void {
    this.websitesService.publish(siteId).subscribe({
      next: (updated) => {
        this.websites.update((sites) =>
          sites.map((site) => (site.id === updated.id ? updated : site)),
        );
      },
    });
  }

  getDomainLabel(site: WebsiteDto): string {
    return site.customDomain || `${site.subdomain}.anansi.local`;
  }

  getStatusLabel(status: WebsiteStatus): string {
    return WebsiteStatus[status] ?? 'Unknown';
  }

  getStatusBadgeVariant(
    status: WebsiteStatus,
  ): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case WebsiteStatus.Published:
        return 'success';
      case WebsiteStatus.Archived:
        return 'neutral';
      default:
        return 'warning';
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private resetForm(): void {
    this.newName = '';
    this.newSubdomain = '';
    this.newDescription = '';
  }
}
