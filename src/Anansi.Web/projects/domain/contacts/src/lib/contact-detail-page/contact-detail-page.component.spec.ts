import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, ContactDto, ContactType } from 'api';
import { ContactDetailPageComponent } from './contact-detail-page.component';

describe('ContactDetailPageComponent', () => {
  let component: ContactDetailPageComponent;
  let fixture: ComponentFixture<ContactDetailPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  const mockContact: ContactDto = {
    id: 'c-1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    phone: '555-0101',
    contactType: ContactType.Client,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-03-01T14:30:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactDetailPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contactId', 'c-1');
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushContactLoad(contact: ContactDto = mockContact): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts/c-1`);
    expect(req.request.method).toBe('GET');
    req.flush(contact);
  }

  it('should create', () => {
    flushContactLoad();
    expect(component).toBeTruthy();
  });

  it('should load contact on init', () => {
    flushContactLoad();
    expect(component.contact()).toEqual(mockContact);
    expect(component.loading()).toBe(false);
  });

  it('should set loading to false and error to true on error', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts/c-1`);
    req.error(new ProgressEvent('Network error'));
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(true);
    expect(component.contact()).toBeNull();
  });

  it('should show error message on load failure', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/contacts/c-1`);
    req.error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-text');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Failed to load contact');
  });

  it('should show spinner while loading', () => {
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/contacts/c-1`);
    req.flush(mockContact);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });

  it('should display contact name', () => {
    flushContactLoad();
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector('.contact-name');
    expect(name.textContent).toContain('Alice Johnson');
  });

  it('should display contact email', () => {
    flushContactLoad();
    fixture.detectChanges();

    const meta = fixture.nativeElement.querySelector('.contact-meta');
    expect(meta.textContent).toContain('alice@example.com');
  });

  it('should display contact phone', () => {
    flushContactLoad();
    fixture.detectChanges();

    const meta = fixture.nativeElement.querySelector('.contact-meta');
    expect(meta.textContent).toContain('555-0101');
  });

  it('should not show phone separator when phone is not provided', () => {
    const contactNoPhone: ContactDto = { ...mockContact, phone: undefined };
    flushContactLoad(contactNoPhone);
    fixture.detectChanges();

    const separator = fixture.nativeElement.querySelector('.meta-separator');
    expect(separator).toBeFalsy();
  });

  it('should display breadcrumbs', () => {
    flushContactLoad();
    fixture.detectChanges();

    const breadcrumb = fixture.nativeElement.querySelector('lib-breadcrumb');
    expect(breadcrumb).toBeTruthy();
  });

  it('should build correct breadcrumbs', () => {
    flushContactLoad();
    const crumbs = component.getBreadcrumbs(mockContact);
    expect(crumbs).toEqual([
      { label: 'Contacts', href: '/contacts' },
      { label: 'Alice Johnson' },
    ]);
  });

  it('should compute initials correctly', () => {
    flushContactLoad();
    expect(component.getInitials(mockContact)).toBe('AJ');
  });

  it('should return correct badge variant for Client', () => {
    flushContactLoad();
    expect(component.getBadgeVariant(ContactType.Client)).toBe('success');
  });

  it('should return correct badge variant for Lead', () => {
    flushContactLoad();
    expect(component.getBadgeVariant(ContactType.Lead)).toBe('warning');
  });

  it('should return correct badge variant for Other', () => {
    flushContactLoad();
    expect(component.getBadgeVariant(ContactType.Other)).toBe('neutral');
  });

  it('should format dates', () => {
    flushContactLoad();
    const formatted = component.formatDate('2025-01-15T10:00:00Z');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2025');
  });

  it('should default to documents tab', () => {
    flushContactLoad();
    expect(component.activeTab()).toBe('documents');
  });

  it('should switch tabs', () => {
    flushContactLoad();
    component.onTabChange('emails');
    expect(component.activeTab()).toBe('emails');
  });

  it('should have correct tabs', () => {
    flushContactLoad();
    expect(component.tabs).toEqual([
      { label: 'Documents', value: 'documents' },
      { label: 'Emails', value: 'emails' },
      { label: 'Sessions', value: 'sessions' },
      { label: 'Galleries', value: 'galleries' },
      { label: 'Payments', value: 'payments' },
    ]);
  });

  it('should show documents placeholder by default', () => {
    flushContactLoad();
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.tab-content .placeholder');
    expect(placeholder.textContent).toContain('No documents linked');
  });

  it('should show emails placeholder when emails tab selected', () => {
    flushContactLoad();
    component.onTabChange('emails');
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.tab-content .placeholder');
    expect(placeholder.textContent).toContain('No emails sent');
  });

  it('should show sessions placeholder when sessions tab selected', () => {
    flushContactLoad();
    component.onTabChange('sessions');
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.tab-content .placeholder');
    expect(placeholder.textContent).toContain('No sessions booked');
  });

  it('should show galleries placeholder when galleries tab selected', () => {
    flushContactLoad();
    component.onTabChange('galleries');
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.tab-content .placeholder');
    expect(placeholder.textContent).toContain('No galleries shared');
  });

  it('should show payments placeholder when payments tab selected', () => {
    flushContactLoad();
    component.onTabChange('payments');
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.tab-content .placeholder');
    expect(placeholder.textContent).toContain('No payments received');
  });

  it('should display Quick Info card with type badge', () => {
    flushContactLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    expect(cards.length).toBe(2);
    const badge = cards[0].querySelector('lib-badge');
    expect(badge).toBeTruthy();
  });

  it('should display Linked Projects card', () => {
    flushContactLoad();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lib-card');
    const projectsCard = cards[1];
    const header = projectsCard.querySelector('[card-header]');
    expect(header.textContent).toContain('Linked Projects');
  });

  it('should display avatar with initials', () => {
    flushContactLoad();
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('lib-avatar');
    expect(avatar).toBeTruthy();
  });

  it('should display Quick Info dates', () => {
    flushContactLoad();
    fixture.detectChanges();

    const infoValues = fixture.nativeElement.querySelectorAll('.info-value');
    expect(infoValues.length).toBe(2);
    expect(infoValues[0].textContent).toContain('Jan');
    expect(infoValues[1].textContent).toContain('Mar');
  });
});
