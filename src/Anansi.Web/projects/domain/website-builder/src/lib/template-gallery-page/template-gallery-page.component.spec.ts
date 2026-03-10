import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  WebsiteTemplateDto,
  TemplateCategory,
} from 'api';
import { LUCIDE_ICONS } from 'lucide-angular';
import { TemplateGalleryPageComponent } from './template-gallery-page.component';

const DUMMY_ICON = [['path', { d: 'M0 0' }]] as const;

class AllIconsProvider {
  hasIcon(): boolean {
    return true;
  }
  getIcon() {
    return DUMMY_ICON;
  }
}

describe('TemplateGalleryPageComponent', () => {
  let component: TemplateGalleryPageComponent;
  let fixture: ComponentFixture<TemplateGalleryPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockTemplates: WebsiteTemplateDto[] = [
    {
      id: 'tpl-1',
      name: 'Modern Portfolio',
      description: 'A clean modern portfolio template',
      category: TemplateCategory.Portfolio,
      previewImageUrl: 'https://example.com/preview1.jpg',
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'tpl-2',
      name: 'Business Pro',
      description: 'Professional business template',
      category: TemplateCategory.Business,
      previewImageUrl: 'https://example.com/preview2.jpg',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'tpl-3',
      name: 'One Page Landing',
      category: TemplateCategory.OnePage,
      isActive: true,
      sortOrder: 2,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateGalleryPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TemplateGalleryPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    response: WebsiteTemplateDto[] = mockTemplates,
  ): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/websitetemplates`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load templates on init', () => {
    flushInitialLoad();
    expect(component.templates()).toEqual(mockTemplates);
    expect(component.loading()).toBe(false);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/websitetemplates`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should show all templates when All tab is active', () => {
    flushInitialLoad();
    expect(component.activeTab()).toBe('All');
    expect(component.filteredTemplates().length).toBe(3);
  });

  it('should filter templates by Business category', () => {
    flushInitialLoad();
    component.onTabChange('Business');
    expect(component.activeTab()).toBe('Business');
    expect(component.filteredTemplates().length).toBe(1);
    expect(component.filteredTemplates()[0].id).toBe('tpl-2');
  });

  it('should filter templates by Portfolio category', () => {
    flushInitialLoad();
    component.onTabChange('Portfolio');
    expect(component.filteredTemplates().length).toBe(1);
    expect(component.filteredTemplates()[0].id).toBe('tpl-1');
  });

  it('should filter templates by OnePage category', () => {
    flushInitialLoad();
    component.onTabChange('OnePage');
    expect(component.filteredTemplates().length).toBe(1);
    expect(component.filteredTemplates()[0].id).toBe('tpl-3');
  });

  it('should return correct category labels', () => {
    flushInitialLoad();
    expect(component.getCategoryLabel(TemplateCategory.Business)).toBe(
      'Business',
    );
    expect(component.getCategoryLabel(TemplateCategory.Portfolio)).toBe(
      'Portfolio',
    );
    expect(component.getCategoryLabel(TemplateCategory.OnePage)).toBe(
      'One Page',
    );
  });

  it('should return Unknown for unrecognized category label', () => {
    flushInitialLoad();
    expect(component.getCategoryLabel(99 as TemplateCategory)).toBe('Unknown');
  });

  it('should return correct badge variants', () => {
    flushInitialLoad();
    expect(
      component.getCategoryBadgeVariant(TemplateCategory.Business),
    ).toBe('success');
    expect(
      component.getCategoryBadgeVariant(TemplateCategory.Portfolio),
    ).toBe('warning');
    expect(
      component.getCategoryBadgeVariant(TemplateCategory.OnePage),
    ).toBe('neutral');
  });

  it('should return neutral badge for unknown category', () => {
    flushInitialLoad();
    expect(
      component.getCategoryBadgeVariant(99 as TemplateCategory),
    ).toBe('neutral');
  });

  it('should emit templateSelected when Use Template is clicked', () => {
    flushInitialLoad();
    const spy = vi.fn();
    component.templateSelected.subscribe(spy);
    component.onUseTemplate(mockTemplates[0]);
    expect(spy).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('should have correct tabs', () => {
    flushInitialLoad();
    expect(component.tabs.length).toBe(4);
    expect(component.tabs[0].value).toBe('All');
    expect(component.tabs[1].value).toBe('Business');
    expect(component.tabs[2].value).toBe('Portfolio');
    expect(component.tabs[3].value).toBe('OnePage');
  });

  it('should show empty state when no templates match filter', () => {
    flushInitialLoad([
      {
        id: 'tpl-1',
        name: 'Business Only',
        category: TemplateCategory.Business,
        isActive: true,
        sortOrder: 0,
      },
    ]);
    component.onTabChange('Portfolio');
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show empty state when no templates loaded', () => {
    flushInitialLoad([]);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/websitetemplates`);
    req.flush(mockTemplates);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should render template cards with names', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const names = fixture.nativeElement.querySelectorAll('.template-name');
    expect(names.length).toBe(3);
    expect(names[0].textContent).toContain('Modern Portfolio');
  });

  it('should render template description when provided', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const descriptions = fixture.nativeElement.querySelectorAll(
      '.template-description',
    );
    expect(descriptions.length).toBe(2);
  });

  it('should show preview placeholder when no previewImageUrl', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const placeholders = fixture.nativeElement.querySelectorAll(
      '.preview-placeholder',
    );
    expect(placeholders.length).toBe(1);
  });

  it('should show preview image when previewImageUrl is provided', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const images = fixture.nativeElement.querySelectorAll('.preview-image');
    expect(images.length).toBe(2);
    expect(images[0].src).toContain('preview1.jpg');
  });

  it('should map tab values to correct categories', () => {
    flushInitialLoad();
    expect(component.getCategoryFromTab('Business')).toBe(
      TemplateCategory.Business,
    );
    expect(component.getCategoryFromTab('Portfolio')).toBe(
      TemplateCategory.Portfolio,
    );
    expect(component.getCategoryFromTab('OnePage')).toBe(
      TemplateCategory.OnePage,
    );
    expect(component.getCategoryFromTab('Unknown')).toBe(
      TemplateCategory.Business,
    );
  });

  it('should render Use Template buttons', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('lib-button');
    expect(buttons.length).toBe(3);
  });
});
