import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { CollectionsService } from './collections.service';
import {
  CollectionDto,
  CollectionSummaryDto,
  CreateCollectionCommand,
  UpdateCollectionCommand,
  BulkCreateCollectionsCommand,
  SetPasswordRequest,
  VerifyPasswordRequest,
  RegisterEmailRequest,
  GalleryEmailRegistrationDto,
  SetExpiryRequest,
  RequestDownloadRequest,
  DownloadRequestDto,
  ResetDownloadLimitRequest,
  SendEmailInvitationCommand,
  CreateQuickShareRequest,
  QuickShareLinkDto,
  GalleryActivityDto,
  SetGoogleAnalyticsRequest,
  CollectionActivityParams,
} from '../models/gallery.models';
import { PagedList } from '../models/common';
import {
  CollectionStatus,
  CoverStyle,
  ThemeMode,
  GridLayout,
  GalleryLanguage,
  DownloadResolution,
  SlideshowSpeed,
  ActivityType,
} from '../models/enums';

describe('CollectionsService', () => {
  let service: CollectionsService;
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
    service = TestBed.inject(CollectionsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('create', () => {
    it('should POST to /api/collections', () => {
      const command: CreateCollectionCommand = {
        title: 'Wedding',
        coverStyle: CoverStyle.Reef,
        theme: ThemeMode.Light,
        fontFamily: 'Serif',
        colorPalette: 'default',
        layout: GridLayout.Vertical,
        language: GalleryLanguage.English,
      };
      const expected = { id: '1', title: 'Wedding' } as CollectionDto;

      service.create(command).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(expected);
    });
  });

  describe('list', () => {
    it('should GET /api/collections without params', () => {
      const expected = { items: [], totalCount: 0 } as unknown as PagedList<CollectionSummaryDto>;

      service.list().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(expected);
    });

    it('should GET /api/collections with all query params', () => {
      const params = {
        page: 2,
        pageSize: 10,
        starredOnly: true,
        status: CollectionStatus.Published,
        search: 'wedding',
      };

      service.list(params).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.get('starredOnly')).toBe('true');
      expect(req.request.params.get('status')).toBe(CollectionStatus.Published);
      expect(req.request.params.get('search')).toBe('wedding');
      req.flush({ items: [] });
    });

    it('should GET /api/collections with partial params', () => {
      service.list({ page: 1 }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections`);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.has('pageSize')).toBe(false);
      expect(req.request.params.has('starredOnly')).toBe(false);
      expect(req.request.params.has('status')).toBe(false);
      expect(req.request.params.has('search')).toBe(false);
      req.flush({ items: [] });
    });
  });

  describe('get', () => {
    it('should GET /api/collections/{id}', () => {
      const expected = { id: 'abc', title: 'Test' } as CollectionDto;

      service.get('abc').subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('update', () => {
    it('should PUT to /api/collections/{id}', () => {
      const command: UpdateCollectionCommand = {
        id: 'abc',
        title: 'Updated',
        status: CollectionStatus.Published,
        coverStyle: CoverStyle.Reef,
        theme: ThemeMode.Dark,
        fontFamily: 'Sans',
        colorPalette: 'warm',
        layout: GridLayout.Horizontal,
        downloadsEnabled: true,
        downloadPinEnabled: false,
        allowedResolutions: 'Original',
        slideshowSpeed: SlideshowSpeed.Medium,
        slideshowAutoLoop: true,
        language: GalleryLanguage.English,
        embeddingEnabled: false,
        requireEmailRegistration: false,
      };
      const expected = { id: 'abc', title: 'Updated' } as CollectionDto;

      service.update('abc', command).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(expected);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/collections/{id}', () => {
      service.delete('abc').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('bulkCreate', () => {
    it('should POST to /api/collections/bulk', () => {
      const command: BulkCreateCollectionsCommand = {
        collections: [{ title: 'Set 1' }, { title: 'Set 2' }],
      };
      const expected = [{ id: '1' }, { id: '2' }] as CollectionDto[];

      service.bulkCreate(command).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/bulk`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(expected);
    });
  });

  describe('toggleStar', () => {
    it('should POST to /api/collections/{id}/star', () => {
      service.toggleStar('abc').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/star`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('setPassword', () => {
    it('should PUT to /api/collections/{id}/password', () => {
      const request: SetPasswordRequest = { password: 'secret' };

      service.setPassword('abc', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/password`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('verifyPassword', () => {
    it('should POST to /api/collections/{id}/verify-password', () => {
      const request: VerifyPasswordRequest = { password: 'secret' };

      service.verifyPassword('abc', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/verify-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('registerEmail', () => {
    it('should POST to /api/collections/{id}/register-email', () => {
      const request: RegisterEmailRequest = { name: 'John', email: 'john@example.com' };
      const expected = { id: 'reg1', name: 'John', email: 'john@example.com' } as GalleryEmailRegistrationDto;

      service.registerEmail('abc', request).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/register-email`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(expected);
    });
  });

  describe('getEmailRegistrations', () => {
    it('should GET /api/collections/{id}/email-registrations without params', () => {
      service.getEmailRegistrations('abc').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/email-registrations`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ items: [] });
    });

    it('should GET /api/collections/{id}/email-registrations with params', () => {
      service.getEmailRegistrations('abc', { page: 1, pageSize: 20 }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections/abc/email-registrations`);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush({ items: [] });
    });
  });

  describe('setExpiry', () => {
    it('should PUT to /api/collections/{id}/expiry', () => {
      const request: SetExpiryRequest = { expiresAt: '2026-12-31T00:00:00Z' };

      service.setExpiry('abc', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/expiry`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('requestDownload', () => {
    it('should POST to /api/collections/{id}/download', () => {
      const request: RequestDownloadRequest = {
        resolution: DownloadResolution.Original,
        isFullGallery: true,
      };
      const expected = { id: 'dl1', isReady: false } as DownloadRequestDto;

      service.requestDownload('abc', request).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/download`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(expected);
    });
  });

  describe('getDownloadStatus', () => {
    it('should GET /api/collections/{id}/download/{downloadId}/status', () => {
      const expected = { id: 'dl1', isReady: true } as DownloadRequestDto;

      service.getDownloadStatus('abc', 'dl1').subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/download/dl1/status`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('getDownloadActivity', () => {
    it('should GET /api/collections/{id}/download-activity without params', () => {
      service.getDownloadActivity('abc').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/download-activity`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ items: [] });
    });

    it('should GET /api/collections/{id}/download-activity with params', () => {
      service.getDownloadActivity('abc', { from: '2026-01-01', to: '2026-12-31', page: 1, pageSize: 25 }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections/abc/download-activity`);
      expect(req.request.params.get('from')).toBe('2026-01-01');
      expect(req.request.params.get('to')).toBe('2026-12-31');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('25');
      req.flush({ items: [] });
    });
  });

  describe('resetDownloadLimit', () => {
    it('should PUT to /api/collections/{id}/download-limit', () => {
      const request: ResetDownloadLimitRequest = { newLimit: 100 };

      service.resetDownloadLimit('abc', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/download-limit`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('sendInvitation', () => {
    it('should POST to /api/collections/{id}/invite', () => {
      const command: SendEmailInvitationCommand = {
        collectionId: 'abc',
        recipientEmail: 'client@example.com',
        subject: 'Your Gallery',
        body: 'View your photos',
        includePassword: false,
      };

      service.sendInvitation('abc', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/invite`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('createQuickShare', () => {
    it('should POST to /api/collections/{id}/quick-share', () => {
      const request: CreateQuickShareRequest = { mediaIds: ['m1', 'm2'] };
      const expected = { id: 'qs1', token: 'abc123' } as QuickShareLinkDto;

      service.createQuickShare('abc', request).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/quick-share`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(expected);
    });
  });

  describe('revokeQuickShare', () => {
    it('should DELETE /api/collections/quick-share/{linkId}', () => {
      service.revokeQuickShare('qs1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/quick-share/qs1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getActivities', () => {
    it('should GET /api/collections/{id}/activities without params', () => {
      service.getActivities('abc').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/activities`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ items: [] });
    });

    it('should GET /api/collections/{id}/activities with all params', () => {
      const params: CollectionActivityParams = {
        type: ActivityType.Download,
        from: '2026-01-01',
        to: '2026-12-31',
        page: 1,
        pageSize: 50,
      };

      service.getActivities('abc', params).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections/abc/activities`);
      expect(req.request.params.get('type')).toBe(ActivityType.Download);
      expect(req.request.params.get('from')).toBe('2026-01-01');
      expect(req.request.params.get('to')).toBe('2026-12-31');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('50');
      req.flush({ items: [] });
    });

    it('should GET /api/collections/{id}/activities with partial params', () => {
      service.getActivities('abc', { type: ActivityType.Favorite }).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${baseUrl}/api/collections/abc/activities`);
      expect(req.request.params.get('type')).toBe(ActivityType.Favorite);
      expect(req.request.params.has('from')).toBe(false);
      expect(req.request.params.has('to')).toBe(false);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush({ items: [] });
    });
  });

  describe('setGoogleAnalytics', () => {
    it('should PUT to /api/collections/{id}/analytics', () => {
      const request: SetGoogleAnalyticsRequest = { googleAnalyticsPropertyId: 'G-12345' };

      service.setGoogleAnalytics('abc', request).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/abc/analytics`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });
});
