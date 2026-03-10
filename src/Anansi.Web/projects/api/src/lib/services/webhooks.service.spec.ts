import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { WebhooksService } from './webhooks.service';
import { WebhookEventType } from '../models/enums';
import {
  CreateWebhookSubscriptionCommand,
  WebhookSubscriptionDto,
} from '../models/system.models';

describe('WebhooksService', () => {
  let service: WebhooksService;
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
    service = TestBed.inject(WebhooksService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockWebhook: WebhookSubscriptionDto = {
    id: 'wh-1',
    url: 'https://example.com/webhook',
    eventType: WebhookEventType.BookingCreated,
    secret: 'secret-123',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should GET /api/webhooks', () => {
      const mockList: WebhookSubscriptionDto[] = [mockWebhook];

      service.list().subscribe((result) => {
        expect(result).toEqual(mockList);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/webhooks`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('create', () => {
    it('should POST to /api/webhooks', () => {
      const command: CreateWebhookSubscriptionCommand = {
        url: 'https://example.com/webhook',
        eventType: WebhookEventType.PaymentReceived,
        secret: 'new-secret',
      };

      service.create(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/webhooks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/webhooks/{id}', () => {
      service.delete('wh-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/webhooks/wh-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
