import { Component, inject, signal, input, OnInit } from '@angular/core';
import {
  WebsiteSeoService,
  SeoAuditResultDto,
  SeoIssueDto,
  UrlRedirectDto,
  RedirectType,
} from 'api';
import {
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  TableHeaderRowComponent,
  TableDataRowComponent,
  EmptyStateComponent,
} from 'components';

@Component({
  selector: 'lib-seo-manager',
  standalone: true,
  imports: [
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">SEO Manager</h1>
        <lib-button variant="outline" icon="search" (clicked)="runAudit()">Run Audit</lib-button>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-row">
        <div class="metric-card">
          <span class="metric-label">Pages Optimized</span>
          <span class="metric-value metric-value--success">12 / 15</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Missing Alt Text</span>
          <span class="metric-value metric-value--gold">8</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Missing Descriptions</span>
          <span class="metric-value metric-value--gold">3</span>
        </div>
      </div>

      <!-- SEO Issues Section -->
      <div class="section">
        <h2 class="section-title">SEO Issues</h2>

        @if (auditLoading()) {
          <div class="loading-container">
            <lib-spinner [size]="32" />
          </div>
        } @else if (issues().length === 0) {
          <div class="empty-container">
            <lib-empty-state
              heading="No SEO issues found"
              description="Your website is looking great for search engines."
            />
          </div>
        } @else {
          <div class="table-container">
            <lib-table-header-row>
              <span class="col-page-title">Page</span>
              <span class="col-seo-title">SEO Title</span>
              <span class="col-meta-description">Meta Description</span>
            </lib-table-header-row>

            @for (issue of issues(); track $index) {
              <lib-table-data-row>
                <span class="col-page-title">{{ issue.pageTitle }}</span>
                <span class="col-seo-title">{{ issue.issueType }}</span>
                <span class="col-meta-description">{{ issue.description }}</span>
              </lib-table-data-row>
            }
          </div>
        }
      </div>

      <!-- URL Redirects Section -->
      <div class="section">
        <h2 class="section-title">URL Redirects</h2>

        @if (redirectsLoading()) {
          <div class="loading-container">
            <lib-spinner [size]="32" />
          </div>
        } @else if (redirects().length === 0) {
          <div class="empty-container">
            <lib-empty-state
              heading="No redirects configured"
              description="Add URL redirects to manage old or changed page URLs."
            />
          </div>
        } @else {
          <div class="table-container">
            <lib-table-header-row>
              <span class="col-source">Source Path</span>
              <span class="col-destination">Destination URL</span>
              <span class="col-redirect-type">Type</span>
              <span class="col-active">Status</span>
            </lib-table-header-row>

            @for (redirect of redirects(); track redirect.id) {
              <lib-table-data-row>
                <span class="col-source slug-text">{{ redirect.sourcePath }}</span>
                <span class="col-destination">{{ redirect.destinationUrl }}</span>
                <span class="col-redirect-type">
                  <lib-badge [variant]="getRedirectTypeBadgeVariant(redirect.redirectType)">{{ getRedirectTypeLabel(redirect.redirectType) }}</lib-badge>
                </span>
                <span class="col-active">
                  <span class="status-indicator" [class.status-indicator--active]="redirect.isActive">
                    {{ redirect.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </span>
              </lib-table-data-row>
            }
          </div>
        }
      </div>
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

    .section {
      padding: 0 24px 24px;
    }

    .section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .empty-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .table-container {
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
    }

    .metrics-row {
      display: flex;
      gap: 24px;
      padding: 0 24px 24px;
    }

    .metric-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .metric-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .metric-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
    }

    .metric-value--success {
      color: #6E9E6E;
    }

    .metric-value--gold {
      color: #C9A962;
    }

    .col-page-title { flex: 1.5; }
    .col-seo-title { flex: 1.5; }
    .col-meta-description { flex: 2; }

    .col-source { flex: 1.5; }
    .col-destination { flex: 2; }
    .col-redirect-type { flex: 1; }
    .col-active { flex: 1; }

    .slug-text {
      font-family: monospace;
      font-size: 13px;
      color: #6E6E70;
    }

    .status-indicator {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .status-indicator--active {
      color: #6E9E6E;
    }
  `,
})
export class SeoManagerComponent implements OnInit {
  private readonly seoService = inject(WebsiteSeoService);

  readonly websiteId = input.required<string>();
  readonly issues = signal<SeoIssueDto[]>([]);
  readonly redirects = signal<UrlRedirectDto[]>([]);
  readonly auditLoading = signal(true);
  readonly redirectsLoading = signal(true);

  ngOnInit(): void {
    this.loadAudit();
    this.loadRedirects();
  }

  loadAudit(): void {
    this.auditLoading.set(true);
    this.seoService.runAudit(this.websiteId()).subscribe({
      next: (result: SeoAuditResultDto) => {
        this.issues.set(result.issues);
        this.auditLoading.set(false);
      },
      error: () => this.auditLoading.set(false),
    });
  }

  loadRedirects(): void {
    this.redirectsLoading.set(true);
    this.seoService.listRedirects(this.websiteId()).subscribe({
      next: (redirects) => {
        this.redirects.set(redirects);
        this.redirectsLoading.set(false);
      },
      error: () => this.redirectsLoading.set(false),
    });
  }

  runAudit(): void {
    this.loadAudit();
  }

  getRedirectTypeLabel(type: RedirectType): string {
    switch (type) {
      case RedirectType.Permanent301: return '301';
      case RedirectType.Temporary302: return '302';
      default: return 'Unknown';
    }
  }

  getRedirectTypeBadgeVariant(type: RedirectType): 'success' | 'warning' | 'neutral' {
    switch (type) {
      case RedirectType.Permanent301: return 'success';
      case RedirectType.Temporary302: return 'warning';
      default: return 'neutral';
    }
  }
}
