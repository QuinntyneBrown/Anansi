import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  SeoAuditResultDto,
  SeoIssueDto,
  UrlRedirectDto,
  RedirectType,
} from 'api';
import { SeoManagerComponent } from './seo-manager.component';

describe('SeoManagerComponent', () => {
  let component: SeoManagerComponent;
  let fixture: ComponentFixture<SeoManagerComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';
  const websiteId = 'ws-1';

  const mockIssues: SeoIssueDto[] = [
    {
      pageTitle: 'Home',
      slug: 'home',
      pageId: 'pg-1',
      issueType: 'missing-meta-description',
      description: 'Page is missing a meta description',
    },
    {
      pageTitle: 'About',
      slug: 'about',
      issueType: 'missing-alt-text',
      description: 'Images are missing alt text',
    },
  ];

  const mockAudit: SeoAuditResultDto = {
    websiteId,
    issues: mockIssues,
  };

  const mockRedirects: UrlRedirectDto[] = [
    {
      id: 'rd-1',
      websiteId,
      sourcePath: '/old-page',
      destinationUrl: '/new-page',
      redirectType: RedirectType.Permanent301,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'rd-2',
      websiteId,
      sourcePath: '/temp',
      destinationUrl: '/temporary-destination',
      redirectType: RedirectType.Temporary302,
      isActive: false,
      createdAt: '2025-02-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeoManagerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SeoManagerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('websiteId', websiteId);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(
    audit: SeoAuditResultDto = mockAudit,
    redirects: UrlRedirectDto[] = mockRedirects,
  ): void {
    fixture.detectChanges();

    const auditReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
    expect(auditReq.request.method).toBe('GET');
    auditReq.flush(audit);

    const redirectsReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/redirects`,
    );
    expect(redirectsReq.request.method).toBe('GET');
    redirectsReq.flush(redirects);
  }

  it('should create', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
  });

  it('should load audit issues on init', () => {
    flushInitialLoad();
    expect(component.issues()).toEqual(mockIssues);
    expect(component.auditLoading()).toBe(false);
  });

  it('should load redirects on init', () => {
    flushInitialLoad();
    expect(component.redirects()).toEqual(mockRedirects);
    expect(component.redirectsLoading()).toBe(false);
  });

  it('should set auditLoading to false on error', () => {
    fixture.detectChanges();
    const auditReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
    auditReq.error(new ProgressEvent('Network error'));

    const redirectsReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/redirects`,
    );
    redirectsReq.flush(mockRedirects);

    expect(component.auditLoading()).toBe(false);
  });

  it('should set redirectsLoading to false on error', () => {
    fixture.detectChanges();
    const auditReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
    auditReq.flush(mockAudit);

    const redirectsReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/redirects`,
    );
    redirectsReq.error(new ProgressEvent('Network error'));

    expect(component.redirectsLoading()).toBe(false);
  });

  it('should show spinners while loading', () => {
    fixture.detectChanges();
    const spinners = fixture.nativeElement.querySelectorAll('lib-spinner');
    expect(spinners.length).toBe(2);

    const auditReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
    auditReq.flush(mockAudit);

    const redirectsReq = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/redirects`,
    );
    redirectsReq.flush(mockRedirects);
    fixture.detectChanges();

    const spinnersAfter = fixture.nativeElement.querySelectorAll('lib-spinner');
    expect(spinnersAfter.length).toBe(0);
  });

  it('should show empty state when no issues', () => {
    flushInitialLoad({ websiteId, issues: [] }, mockRedirects);
    fixture.detectChanges();

    const emptyStates =
      fixture.nativeElement.querySelectorAll('lib-empty-state');
    expect(emptyStates.length).toBe(1);
    expect(emptyStates[0].getAttribute('heading')).toBe(
      'No SEO issues found',
    );
  });

  it('should show empty state when no redirects', () => {
    flushInitialLoad(mockAudit, []);
    fixture.detectChanges();

    const emptyStates =
      fixture.nativeElement.querySelectorAll('lib-empty-state');
    expect(emptyStates.length).toBe(1);
    expect(emptyStates[0].getAttribute('heading')).toBe(
      'No redirects configured',
    );
  });

  it('should show both empty states when no data', () => {
    flushInitialLoad({ websiteId, issues: [] }, []);
    fixture.detectChanges();

    const emptyStates =
      fixture.nativeElement.querySelectorAll('lib-empty-state');
    expect(emptyStates.length).toBe(2);
  });

  it('should render issue rows', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const pageTitles = fixture.nativeElement.querySelectorAll(
      '.col-page-title',
    );
    // 1 header + 2 data rows
    expect(pageTitles.length).toBe(3);
    expect(pageTitles[1].textContent).toContain('Home');
    expect(pageTitles[2].textContent).toContain('About');
  });

  it('should render issue slugs with leading slash', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const sections = fixture.nativeElement.querySelectorAll('.section');
    const issueSection = sections[0];
    const slugs = issueSection.querySelectorAll('.slug-text');
    expect(slugs[0].textContent).toContain('/home');
    expect(slugs[1].textContent).toContain('/about');
  });

  it('should render issue descriptions', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const descriptions = fixture.nativeElement.querySelectorAll(
      '.col-description',
    );
    // 1 header + 2 data rows
    expect(descriptions[1].textContent).toContain(
      'Page is missing a meta description',
    );
  });

  it('should render redirect rows', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const sources = fixture.nativeElement.querySelectorAll('.col-source');
    // 1 header + 2 data rows
    expect(sources.length).toBe(3);
    expect(sources[1].textContent).toContain('/old-page');
    expect(sources[2].textContent).toContain('/temp');
  });

  it('should render redirect destinations', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const destinations = fixture.nativeElement.querySelectorAll(
      '.col-destination',
    );
    expect(destinations[1].textContent).toContain('/new-page');
  });

  it('should display redirect active status', () => {
    flushInitialLoad();
    fixture.detectChanges();

    const statuses = fixture.nativeElement.querySelectorAll(
      '.status-indicator',
    );
    expect(statuses[0].textContent.trim()).toBe('Active');
    expect(
      statuses[0].classList.contains('status-indicator--active'),
    ).toBe(true);
    expect(statuses[1].textContent.trim()).toBe('Inactive');
    expect(
      statuses[1].classList.contains('status-indicator--active'),
    ).toBe(false);
  });

  it('should return correct redirect type labels', () => {
    flushInitialLoad();
    expect(component.getRedirectTypeLabel(RedirectType.Permanent301)).toBe(
      '301',
    );
    expect(component.getRedirectTypeLabel(RedirectType.Temporary302)).toBe(
      '302',
    );
    expect(component.getRedirectTypeLabel(999 as RedirectType)).toBe(
      'Unknown',
    );
  });

  it('should return correct redirect type badge variants', () => {
    flushInitialLoad();
    expect(
      component.getRedirectTypeBadgeVariant(RedirectType.Permanent301),
    ).toBe('success');
    expect(
      component.getRedirectTypeBadgeVariant(RedirectType.Temporary302),
    ).toBe('warning');
    expect(
      component.getRedirectTypeBadgeVariant(999 as RedirectType),
    ).toBe('neutral');
  });

  it('should re-run audit when Run Audit button is clicked', () => {
    flushInitialLoad();

    component.runAudit();
    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ websiteId, issues: [] });

    expect(component.issues().length).toBe(0);
    expect(component.auditLoading()).toBe(false);
  });

  it('should show audit loading when re-running audit', () => {
    flushInitialLoad();

    component.runAudit();
    expect(component.auditLoading()).toBe(true);

    const req = httpTesting.expectOne(
      `${baseUrl}/api/websites/${websiteId}/seo/audit`,
    );
    req.flush(mockAudit);
    expect(component.auditLoading()).toBe(false);
  });
});
