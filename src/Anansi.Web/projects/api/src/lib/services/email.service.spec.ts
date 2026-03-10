import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { EmailService } from './email.service';
import { PagedList } from '../models/common';
import {
  AutomatedEmailConfigDto,
  CreateEmailTemplateCommand,
  EmailConversationDto,
  EmailTemplateDto,
  SendEmailCommand,
  UpsertAutomatedEmailConfigCommand,
} from '../models/system.models';

describe('EmailService', () => {
  let service: EmailService;
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
    service = TestBed.inject(EmailService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockConversation: EmailConversationDto = {
    id: 'conv-1',
    subject: 'Wedding Photos',
    clientEmail: 'client@example.com',
    clientName: 'Jane Doe',
    isRead: false,
    messages: [
      {
        id: 'msg-1',
        isFromPhotographer: true,
        senderEmail: 'photographer@example.com',
        senderName: 'John Photo',
        body: 'Here are your photos!',
        isRead: true,
        sentAt: '2026-01-01T00:00:00Z',
        attachments: [],
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockPagedList: PagedList<EmailConversationDto> = {
    items: [mockConversation],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const mockTemplate: EmailTemplateDto = {
    id: 'tpl-1',
    name: 'Welcome Email',
    category: 'onboarding',
    subjectLine: 'Welcome!',
    body: 'Welcome to our studio.',
    useBranding: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockAutomatedConfig: AutomatedEmailConfigDto = {
    id: 'auto-1',
    eventType: 'SessionBooked',
    isEnabled: true,
    emailTemplateId: 'tpl-1',
    timingOffsetHours: 24,
  };

  describe('listConversations', () => {
    it('should GET /api/email/conversations without params', () => {
      service.listConversations().subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/email/conversations`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedList);
    });

    it('should GET /api/email/conversations with all params', () => {
      service.listConversations({ page: 2, pageSize: 10 }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/email/conversations`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedList);
    });

    it('should GET /api/email/conversations with partial params', () => {
      service.listConversations({ page: 3 }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/email/conversations`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedList);
    });
  });

  describe('send', () => {
    it('should POST to /api/email/send', () => {
      const command: SendEmailCommand = {
        recipientEmail: 'client@example.com',
        subject: 'Your photos are ready',
        body: 'Please find your photos attached.',
      };

      service.send(command).subscribe((result) => {
        expect(result).toEqual(mockConversation);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/email/send`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockConversation);
    });
  });

  describe('createTemplate', () => {
    it('should POST to /api/email/templates', () => {
      const command: CreateEmailTemplateCommand = {
        name: 'Welcome Email',
        category: 'onboarding',
        subjectLine: 'Welcome!',
        body: 'Welcome to our studio.',
        useBranding: true,
      };

      service.createTemplate(command).subscribe((result) => {
        expect(result).toEqual(mockTemplate);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/email/templates`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockTemplate);
    });
  });

  describe('listTemplates', () => {
    it('should GET /api/email/templates without category', () => {
      service.listTemplates().subscribe((result) => {
        expect(result).toEqual([mockTemplate]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/email/templates`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([mockTemplate]);
    });

    it('should GET /api/email/templates with category', () => {
      service.listTemplates('onboarding').subscribe((result) => {
        expect(result).toEqual([mockTemplate]);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/email/templates`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('category')).toBe('onboarding');
      req.flush([mockTemplate]);
    });
  });

  describe('upsertAutomatedConfig', () => {
    it('should POST to /api/email/automated-configs', () => {
      const command: UpsertAutomatedEmailConfigCommand = {
        eventType: 'SessionBooked',
        isEnabled: true,
        emailTemplateId: 'tpl-1',
        timingOffsetHours: 24,
      };

      service.upsertAutomatedConfig(command).subscribe((result) => {
        expect(result).toEqual(mockAutomatedConfig);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/email/automated-configs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockAutomatedConfig);
    });
  });

  describe('listAutomatedConfigs', () => {
    it('should GET /api/email/automated-configs', () => {
      service.listAutomatedConfigs().subscribe((result) => {
        expect(result).toEqual([mockAutomatedConfig]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/email/automated-configs`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAutomatedConfig]);
    });
  });
});
