import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { AccountService } from './account.service';
import {
  AccountSettings,
  StorageUsageDto,
  UpdateAccountSettingsCommand,
} from '../models/auth.models';

describe('AccountService', () => {
  let service: AccountService;
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
    service = TestBed.inject(AccountService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getSettings', () => {
    it('should GET /api/account/settings and return AccountSettings', () => {
      const mockSettings: AccountSettings = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'John Doe Photography',
        timezone: 'America/Toronto',
      };

      service.getSettings().subscribe((result) => {
        expect(result).toEqual(mockSettings);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('should PUT to /api/account/settings with command body', () => {
      const command: UpdateAccountSettingsCommand = {
        firstName: 'Jane',
        lastName: 'Doe',
        businessName: 'Jane Doe Photography',
        timezone: 'America/New_York',
      };

      service.updateSettings(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('deleteAccount', () => {
    it('should DELETE /api/account without query params when exportFirst is undefined', () => {
      service.deleteAccount().subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/account`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.has('exportFirst')).toBe(false);
      req.flush(null);
    });

    it('should DELETE /api/account with exportFirst=true query param', () => {
      service.deleteAccount(true).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/account` && r.params.get('exportFirst') === 'true',
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.get('exportFirst')).toBe('true');
      req.flush(null);
    });

    it('should DELETE /api/account with exportFirst=false query param', () => {
      service.deleteAccount(false).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/account` && r.params.get('exportFirst') === 'false',
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.get('exportFirst')).toBe('false');
      req.flush(null);
    });
  });

  describe('getStorageUsage', () => {
    it('should GET /api/account/storage and return StorageUsageDto', () => {
      const mockUsage: StorageUsageDto = {
        usedBytes: 1073741824,
        totalBytes: 10737418240,
        warningLevel: 'none',
      };

      service.getStorageUsage().subscribe((result) => {
        expect(result).toEqual(mockUsage);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/account/storage`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsage);
    });
  });
});
