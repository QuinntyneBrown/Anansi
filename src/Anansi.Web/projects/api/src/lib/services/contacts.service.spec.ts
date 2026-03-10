import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { ContactsService } from './contacts.service';
import { PagedList } from '../models/common';
import { ContactType, QuestionType } from '../models/enums';
import {
  ContactDto,
  ContactListParams,
  CreateContactCommand,
  CreateLeadCaptureFormCommand,
  ImportContactsCommand,
  ImportResult,
  LeadCaptureFormDto,
  SubmitLeadCaptureFormCommand,
  UpdateContactCommand,
} from '../models/crm.models';

describe('ContactsService', () => {
  let service: ContactsService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(ContactsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('create', () => {
    it('should POST to /api/contacts and return ContactDto', () => {
      const command: CreateContactCommand = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555-1234',
        contactType: ContactType.Client,
      };
      const mockResponse: ContactDto = {
        id: 'contact-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555-1234',
        contactType: ContactType.Client,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('get', () => {
    it('should GET /api/contacts/{id} and return ContactDto', () => {
      const mockResponse: ContactDto = {
        id: 'contact-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        contactType: ContactType.Client,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      service.get('contact-1').subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts/contact-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('list', () => {
    const mockPagedResponse: PagedList<ContactDto> = {
      items: [
        {
          id: 'contact-1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          contactType: ContactType.Client,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    };

    it('should GET /api/contacts without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedResponse);
    });

    it('should GET /api/contacts with all query params', () => {
      const params: ContactListParams = {
        type: ContactType.Lead,
        search: 'jane',
        page: 2,
        pageSize: 10,
      };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/contacts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('type')).toBe(ContactType.Lead);
      expect(req.request.params.get('search')).toBe('jane');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedResponse);
    });

    it('should GET /api/contacts with partial params', () => {
      const params: ContactListParams = { page: 1 };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/contacts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.has('type')).toBe(false);
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedResponse);
    });
  });

  describe('update', () => {
    it('should PUT to /api/contacts/{id} and return ContactDto', () => {
      const command: UpdateContactCommand = {
        id: 'contact-1',
        firstName: 'Janet',
        lastName: 'Doe',
        email: 'janet@example.com',
        contactType: ContactType.Client,
      };
      const mockResponse: ContactDto = {
        id: 'contact-1',
        firstName: 'Janet',
        lastName: 'Doe',
        email: 'janet@example.com',
        contactType: ContactType.Client,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      };

      service.update('contact-1', command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts/contact-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/contacts/{id}', () => {
      service.delete('contact-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts/contact-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('import', () => {
    it('should POST to /api/contacts/import and return ImportResult', () => {
      const command: ImportContactsCommand = {
        contacts: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            contactType: ContactType.Client,
          },
          {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            contactType: ContactType.Lead,
          },
        ],
      };
      const mockResponse: ImportResult = {
        importedCount: 2,
        skippedCount: 0,
        errors: [],
      };

      service.import(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('createLeadForm', () => {
    it('should POST to /api/contacts/lead-capture-forms and return LeadCaptureFormDto', () => {
      const command: CreateLeadCaptureFormCommand = {
        name: 'Wedding Inquiry',
        description: 'Contact form for wedding inquiries',
        defaultContactType: ContactType.Lead,
        fields: [
          {
            label: 'Your Name',
            fieldType: QuestionType.ShortText,
            isRequired: true,
            sortOrder: 1,
          },
        ],
      };
      const mockResponse: LeadCaptureFormDto = {
        id: 'form-1',
        name: 'Wedding Inquiry',
        description: 'Contact form for wedding inquiries',
        defaultContactType: ContactType.Lead,
        slug: 'wedding-inquiry',
        isActive: true,
        fields: [
          {
            id: 'field-1',
            label: 'Your Name',
            fieldType: QuestionType.ShortText,
            isRequired: true,
            sortOrder: 1,
          },
        ],
        createdAt: '2026-01-01T00:00:00Z',
      };

      service.createLeadForm(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts/lead-capture-forms`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('submitLeadForm', () => {
    it('should POST to /api/contacts/lead-capture-forms/{slug}/submit', () => {
      const command: SubmitLeadCaptureFormCommand = {
        slug: 'wedding-inquiry',
        email: 'visitor@example.com',
        firstName: 'Visitor',
        lastName: 'Smith',
        message: 'Interested in wedding photography',
      };

      service.submitLeadForm('wedding-inquiry', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/contacts/lead-capture-forms/wedding-inquiry/submit`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });
});
