import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { NotificationsService } from './notifications.service';
import { PagedList } from '../models/common';
import {
  EmailDigestOption,
  NotificationCategory,
  NotificationDeliveryMethod,
} from '../models/enums';
import {
  NotificationDto,
  NotificationPreferencesDto,
  UnreadCountResponse,
  UpdateNotificationPreferenceCommand,
} from '../models/system.models';

describe('NotificationsService', () => {
  let service: NotificationsService;
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
    service = TestBed.inject(NotificationsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockNotification: NotificationDto = {
    id: 'notif-1',
    photographerId: 'photo-1',
    eventType: 'PhotoDownloaded',
    category: NotificationCategory.ClientGallery,
    title: 'Photo Downloaded',
    message: 'A client downloaded a photo',
    isRead: false,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockPagedList: PagedList<NotificationDto> = {
    items: [mockNotification],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  describe('list', () => {
    it('should GET /api/notifications without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedList);
    });

    it('should GET /api/notifications with all params', () => {
      service.list({
        category: NotificationCategory.Store,
        isRead: true,
        page: 2,
        pageSize: 10,
      }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('category')).toBe('Store');
      expect(req.request.params.get('isRead')).toBe('true');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedList);
    });

    it('should GET /api/notifications with partial params', () => {
      service.list({ page: 3 }).subscribe((result) => {
        expect(result).toEqual(mockPagedList);
      });

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.has('category')).toBe(false);
      expect(req.request.params.has('isRead')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedList);
    });
  });

  describe('getUnreadCount', () => {
    it('should GET /api/notifications/unread-count', () => {
      const mockResponse: UnreadCountResponse = { count: 5 };

      service.getUnreadCount().subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/unread-count`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should PUT to /api/notifications/{id}/read', () => {
      service.markAsRead('notif-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/notif-1/read`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });
  });

  describe('markAllAsRead', () => {
    it('should PUT to /api/notifications/read-all', () => {
      service.markAllAsRead().subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/read-all`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });
  });

  describe('getPreferences', () => {
    it('should GET /api/notifications/preferences', () => {
      const mockPreferences: NotificationPreferencesDto = {
        preferences: [
          {
            eventType: 'PhotoDownloaded',
            deliveryMethods: [NotificationDeliveryMethod.InApp, NotificationDeliveryMethod.Email],
            emailDigest: EmailDigestOption.RealTime,
          },
        ],
      };

      service.getPreferences().subscribe((result) => {
        expect(result).toEqual(mockPreferences);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/preferences`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should PUT to /api/notifications/preferences', () => {
      const command: UpdateNotificationPreferenceCommand = {
        eventType: 'PhotoDownloaded',
        deliveryMethods: [NotificationDeliveryMethod.InApp],
        emailDigest: EmailDigestOption.DailySummary,
      };

      service.updatePreferences(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/preferences`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });
});
