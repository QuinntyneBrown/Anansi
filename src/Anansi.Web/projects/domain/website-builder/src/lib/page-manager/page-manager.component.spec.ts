import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  WebsitePageDto,
  WebsitePageType,
} from 'api';
import { PageManagerComponent } from './page-manager.component';

describe('PageManagerComponent', () => {
  let component: PageManagerComponent;
  let fixture: ComponentFixture<PageManagerComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';
  const websiteId = 'ws-1';

  const mockPages: WebsitePageDto[] = [
    {
      id: 'pg-1',
      websiteId,
      title: 'Home',
      slug: 'home',
      pageType: WebsitePageType.Homepage,
      sortOrder: 0,
      isVisible: true,
      showInNavigation: true,
      hasPassword: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'pg-2',
      websiteId,
      title: 'About',
      slug: 'about',
      pageType: WebsitePageType.About,
      sortOrder: 1,
      isVisible: true,
      showInNavigation: true,
      hasPassword: false,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
    {
      id: 'pg-3',
      websiteId,
      title: 'Draft Page',
      slug: 'draft',
      pageType: WebsitePageType.Custom,
      sortOrder: 2,
      isVisible: false,
      showInNavigation: false,
      hasPassword: false,
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageManagerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PageManagerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('websiteId', websiteId);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    response: WebsitePageDto[] = mockPages,
  ): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/pages`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load pages on init', () => {
    flushInitialLoad();
    expect(component.pages()).toEqual(mockPages);
    expect(component.loading()).toBe(false);
  });

  it('should set loading to false on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/pages`,
    );
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/pages`,
    );
    req.flush(mockPages);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should show empty state when no pages', () => {
    flushInitialLoad([]);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('lib-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should render page rows with titles', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const titles = fixture.nativeElement.querySelectorAll('.col-title');
    // First is the header row, then data rows
    expect(titles.length).toBe(4); // 1 header + 3 data
    expect(titles[1].textContent).toContain('Home');
    expect(titles[2].textContent).toContain('About');
  });

  it('should display slug with leading slash', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const slugs = fixture.nativeElement.querySelectorAll('.slug-text');
    expect(slugs[0].textContent).toContain('/home');
    expect(slugs[1].textContent).toContain('/about');
  });

  it('should display visibility indicator', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll(
      '.visibility-indicator',
    );
    expect(indicators[0].textContent.trim()).toBe('Visible');
    expect(
      indicators[0].classList.contains('visibility-indicator--visible'),
    ).toBe(true);
    expect(indicators[2].textContent.trim()).toBe('Hidden');
    expect(
      indicators[2].classList.contains('visibility-indicator--visible'),
    ).toBe(false);
  });

  it('should display showInNavigation', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const navCols = fixture.nativeElement.querySelectorAll('.col-nav');
    // header + 3 data rows
    expect(navCols[1].textContent.trim()).toBe('Yes');
    expect(navCols[3].textContent.trim()).toBe('No');
  });

  it('should display sort order', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const orderCols = fixture.nativeElement.querySelectorAll('.col-order');
    expect(orderCols[1].textContent.trim()).toBe('0');
    expect(orderCols[2].textContent.trim()).toBe('1');
  });

  it('should toggle add form', () => {
    flushInitialLoad();
    expect(component.showAddForm()).toBe(false);

    component.toggleAddForm();
    expect(component.showAddForm()).toBe(true);

    component.toggleAddForm();
    expect(component.showAddForm()).toBe(false);
  });

  it('should cancel add form and reset', () => {
    flushInitialLoad();
    component.toggleAddForm();
    component.newTitle = 'Test';
    component.newSlug = 'test';

    component.cancelAdd();

    expect(component.showAddForm()).toBe(false);
    expect(component.newTitle).toBe('');
    expect(component.newSlug).toBe('');
    expect(component.newPageType()).toBe(WebsitePageType.Custom);
  });

  it('should submit add form and append new page', () => {
    flushInitialLoad();
    component.toggleAddForm();
    component.newTitle = 'Services';
    component.newSlug = 'services';
    component.newPageType.set(WebsitePageType.Services);

    component.submitAdd();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/pages`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      websiteId,
      title: 'Services',
      slug: 'services',
      pageType: WebsitePageType.Services,
    });

    const newPage: WebsitePageDto = {
      id: 'pg-4',
      websiteId,
      title: 'Services',
      slug: 'services',
      pageType: WebsitePageType.Services,
      sortOrder: 3,
      isVisible: true,
      showInNavigation: true,
      hasPassword: false,
      createdAt: '2025-01-04T00:00:00Z',
      updatedAt: '2025-01-04T00:00:00Z',
    };
    req.flush(newPage);

    expect(component.pages().length).toBe(4);
    expect(component.pages()[3].title).toBe('Services');
    expect(component.showAddForm()).toBe(false);
    expect(component.newTitle).toBe('');
    expect(component.submitting()).toBe(false);
  });

  it('should set submitting to false on error', () => {
    flushInitialLoad();
    component.toggleAddForm();
    component.newTitle = 'Fail';
    component.newSlug = 'fail';

    component.submitAdd();

    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/pages`,
    );
    req.error(new ProgressEvent('Network error'));

    expect(component.submitting()).toBe(false);
  });

  it('should change page type via onPageTypeChange', () => {
    flushInitialLoad();
    const event = {
      target: { value: String(WebsitePageType.Blog) },
    } as unknown as Event;
    component.onPageTypeChange(event);
    expect(component.newPageType()).toBe(WebsitePageType.Blog);
  });

  it('should return correct page type labels', () => {
    flushInitialLoad();
    expect(component.getPageTypeLabel(WebsitePageType.Homepage)).toBe(
      'Homepage',
    );
    expect(component.getPageTypeLabel(WebsitePageType.Portfolio)).toBe(
      'Portfolio',
    );
    expect(component.getPageTypeLabel(WebsitePageType.About)).toBe('About');
    expect(component.getPageTypeLabel(WebsitePageType.Services)).toBe(
      'Services',
    );
    expect(component.getPageTypeLabel(WebsitePageType.Contact)).toBe(
      'Contact',
    );
    expect(component.getPageTypeLabel(WebsitePageType.Pricing)).toBe(
      'Pricing',
    );
    expect(component.getPageTypeLabel(WebsitePageType.Gallery)).toBe(
      'Gallery',
    );
    expect(component.getPageTypeLabel(WebsitePageType.Blog)).toBe('Blog');
    expect(component.getPageTypeLabel(WebsitePageType.Custom)).toBe('Custom');
    expect(component.getPageTypeLabel(99 as WebsitePageType)).toBe('Unknown');
  });

  it('should return correct page type badge variants', () => {
    flushInitialLoad();
    expect(
      component.getPageTypeBadgeVariant(WebsitePageType.Homepage),
    ).toBe('success');
    expect(
      component.getPageTypeBadgeVariant(WebsitePageType.Portfolio),
    ).toBe('warning');
    expect(component.getPageTypeBadgeVariant(WebsitePageType.Blog)).toBe(
      'warning',
    );
    expect(
      component.getPageTypeBadgeVariant(WebsitePageType.Custom),
    ).toBe('neutral');
    expect(
      component.getPageTypeBadgeVariant(WebsitePageType.About),
    ).toBe('neutral');
  });

  it('should have correct page type options', () => {
    flushInitialLoad();
    expect(component.pageTypeOptions.length).toBe(9);
    expect(component.pageTypeOptions[0].label).toBe('Homepage');
    expect(component.pageTypeOptions[8].label).toBe('Custom');
  });

  it('should render add form when toggled', () => {
    flushInitialLoad();
    fixture.detectChanges();

    let form = fixture.nativeElement.querySelector('.add-form');
    expect(form).toBeFalsy();

    component.toggleAddForm();
    fixture.detectChanges();

    form = fixture.nativeElement.querySelector('.add-form');
    expect(form).toBeTruthy();
  });
});
