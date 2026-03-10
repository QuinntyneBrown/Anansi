import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { ApiKeysService } from './api-keys.service';
import {
  ApiKeyResponse,
  CreateApiKeyCommand,
} from '../models/system.models';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
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
    service = TestBed.inject(ApiKeysService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('create', () => {
    it('should POST to /api/api-keys and return ApiKeyResponse', () => {
      const command: CreateApiKeyCommand = {
        name: 'My Integration Key',
        expiresAt: '2027-01-01T00:00:00Z',
      };
      const mockResponse: ApiKeyResponse = {
        id: 'key-1',
        name: 'My Integration Key',
        apiKey: 'ak_live_abc123xyz',
        keyPrefix: 'ak_live_abc',
        expiresAt: '2027-01-01T00:00:00Z',
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/api-keys`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });

    it('should POST to /api/api-keys without optional expiresAt', () => {
      const command: CreateApiKeyCommand = {
        name: 'Permanent Key',
      };
      const mockResponse: ApiKeyResponse = {
        id: 'key-2',
        name: 'Permanent Key',
        apiKey: 'ak_live_def456',
        keyPrefix: 'ak_live_def',
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/api-keys`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('revoke', () => {
    it('should DELETE /api/api-keys/{id}', () => {
      const keyId = 'key-1';

      service.revoke(keyId).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/api-keys/${keyId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
