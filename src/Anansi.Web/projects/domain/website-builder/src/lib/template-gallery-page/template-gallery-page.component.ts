import { Component, inject, signal, computed, output, OnInit } from '@angular/core';
import {
  WebsiteTemplatesService,
  WebsiteTemplateDto,
  TemplateCategory,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  PillTabBarComponent,
  PillTabItem,
  EmptyStateComponent,
} from 'components';

@Component({
  selector: 'lib-template-gallery-page',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    PillTabBarComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Website Templates</h1>
      </div>

      <lib-pill-tab-bar
        [tabs]="tabs"
        [activeTab]="activeTab()"
        (tabChange)="onTabChange($event)"
      />

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else if (filteredTemplates().length === 0) {
        <div class="empty-container">
          <lib-empty-state
            heading="No templates found"
            description="No templates available for the selected category."
          />
        </div>
      } @else {
        <div class="grid">
          @for (template of filteredTemplates(); track template.id) {
            <lib-card>
              <div class="template-card">
                <div class="template-preview">
                  @if (template.previewImageUrl) {
                    <img [src]="template.previewImageUrl" [alt]="template.name" class="preview-image" />
                  } @else {
                    <div class="preview-placeholder">
                      <span class="preview-placeholder-text">Preview</span>
                    </div>
                  }
                </div>
                <div class="template-info">
                  <div class="template-header">
                    <h3 class="template-name">{{ template.name }}</h3>
                    <lib-badge [variant]="getCategoryBadgeVariant(template.category)">{{ getCategoryLabel(template.category) }}</lib-badge>
                  </div>
                  @if (template.description) {
                    <p class="template-description">{{ template.description }}</p>
                  }
                  <div class="template-actions">
                    <lib-button variant="primary" (clicked)="onUseTemplate(template)">Use Template</lib-button>
                  </div>
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

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      padding: 0 24px 24px;
    }

    .template-card {
      display: flex;
      flex-direction: column;
    }

    .template-preview {
      width: 100%;
      height: 200px;
      overflow: hidden;
      border-radius: 12px 12px 0 0;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-placeholder {
      width: 100%;
      height: 100%;
      background: #3A3A3C;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-placeholder-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .template-info {
      padding: 16px;
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .template-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .template-description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0 0 16px;
      line-height: 1.5;
    }

    .template-actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class TemplateGalleryPageComponent implements OnInit {
  private readonly templatesService = inject(WebsiteTemplatesService);

  readonly templates = signal<WebsiteTemplateDto[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal('All');

  readonly templateSelected = output<WebsiteTemplateDto>();

  readonly tabs: PillTabItem[] = [
    { label: 'All', icon: 'layout-grid', value: 'All' },
    { label: 'Business', icon: 'briefcase', value: 'Business' },
    { label: 'Portfolio', icon: 'image', value: 'Portfolio' },
    { label: 'One Page', icon: 'file', value: 'OnePage' },
  ];

  readonly filteredTemplates = computed(() => {
    const tab = this.activeTab();
    const all = this.templates();
    if (tab === 'All') {
      return all;
    }
    const category = this.getCategoryFromTab(tab);
    return all.filter((t) => t.category === category);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.templatesService.list().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  onUseTemplate(template: WebsiteTemplateDto): void {
    this.templateSelected.emit(template);
  }

  getCategoryFromTab(tab: string): TemplateCategory {
    switch (tab) {
      case 'Business': return TemplateCategory.Business;
      case 'Portfolio': return TemplateCategory.Portfolio;
      case 'OnePage': return TemplateCategory.OnePage;
      default: return TemplateCategory.Business;
    }
  }

  getCategoryLabel(category: TemplateCategory): string {
    switch (category) {
      case TemplateCategory.Business: return 'Business';
      case TemplateCategory.Portfolio: return 'Portfolio';
      case TemplateCategory.OnePage: return 'One Page';
      default: return 'Unknown';
    }
  }

  getCategoryBadgeVariant(category: TemplateCategory): 'success' | 'warning' | 'neutral' {
    switch (category) {
      case TemplateCategory.Business: return 'success';
      case TemplateCategory.Portfolio: return 'warning';
      case TemplateCategory.OnePage: return 'neutral';
      default: return 'neutral';
    }
  }
}
