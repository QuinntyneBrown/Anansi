import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { BrandingService } from './branding.service';
import { DocumentType, DomainPurpose, SslStatus, WatermarkPosition, WatermarkType } from '../models/enums';
import {
  BrandingProfileDto,
  CreateCustomDomainCommand,
  CreateWatermarkCommand,
  CustomDomainDto,
  DocumentBrandingDto,
  UpdateBrandingProfileCommand,
  UpdateWatermarkCommand,
  UpsertDocumentBrandingCommand,
  WatermarkDto,
} from '../models/system.models';

describe('BrandingService', () => {
  let service: BrandingService;
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
    service = TestBed.inject(BrandingService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockProfile: BrandingProfileDto = {
    photographerId: 'photo-1',
    logoUrl: 'https://example.com/logo.png',
    brandColorHex: '#C9A962',
    platformBrandingRemoved: false,
  };

  const mockWatermark: WatermarkDto = {
    id: 'wm-1',
    name: 'Default Watermark',
    type: WatermarkType.Text,
    text: 'My Studio',
    opacity: 0.5,
    scale: 1.0,
    position: WatermarkPosition.BottomRight,
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockDomain: CustomDomainDto = {
    id: 'dom-1',
    domainName: 'photos.example.com',
    purpose: DomainPurpose.Gallery,
    isVerified: true,
    sslStatus: SslStatus.Active,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockDocBranding: DocumentBrandingDto = {
    id: 'doc-1',
    documentType: DocumentType.Invoice,
    brandColorHex: '#C9A962',
    fontTheme: 'Elegant',
  };

  describe('getProfile', () => {
    it('should GET /api/branding/profile', () => {
      service.getProfile().subscribe((result) => {
        expect(result).toEqual(mockProfile);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should PUT to /api/branding/profile', () => {
      const command: UpdateBrandingProfileCommand = {
        logoUrl: 'https://example.com/new-logo.png',
        brandColorHex: '#1A1A1C',
        platformBrandingRemoved: true,
      };

      service.updateProfile(command).subscribe((result) => {
        expect(result).toEqual(mockProfile);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockProfile);
    });
  });

  describe('listWatermarks', () => {
    it('should GET /api/branding/watermarks', () => {
      service.listWatermarks().subscribe((result) => {
        expect(result).toEqual([mockWatermark]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/watermarks`);
      expect(req.request.method).toBe('GET');
      req.flush([mockWatermark]);
    });
  });

  describe('createWatermark', () => {
    it('should POST to /api/branding/watermarks', () => {
      const command: CreateWatermarkCommand = {
        name: 'New Watermark',
        type: WatermarkType.Image,
        imageUrl: 'https://example.com/watermark.png',
        opacity: 0.3,
        scale: 0.8,
        position: WatermarkPosition.Center,
        isDefault: false,
      };

      service.createWatermark(command).subscribe((result) => {
        expect(result).toEqual(mockWatermark);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/watermarks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockWatermark);
    });
  });

  describe('updateWatermark', () => {
    it('should PUT to /api/branding/watermarks/{id}', () => {
      const command: UpdateWatermarkCommand = {
        id: 'wm-1',
        name: 'Updated Watermark',
        type: WatermarkType.Text,
        text: 'Updated Studio',
        opacity: 0.7,
        scale: 1.2,
        position: WatermarkPosition.TopLeft,
        isDefault: true,
      };

      service.updateWatermark('wm-1', command).subscribe((result) => {
        expect(result).toEqual(mockWatermark);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/watermarks/wm-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockWatermark);
    });
  });

  describe('deleteWatermark', () => {
    it('should DELETE /api/branding/watermarks/{id}', () => {
      service.deleteWatermark('wm-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/watermarks/wm-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('listDomains', () => {
    it('should GET /api/branding/domains', () => {
      service.listDomains().subscribe((result) => {
        expect(result).toEqual([mockDomain]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/domains`);
      expect(req.request.method).toBe('GET');
      req.flush([mockDomain]);
    });
  });

  describe('createDomain', () => {
    it('should POST to /api/branding/domains', () => {
      const command: CreateCustomDomainCommand = {
        domainName: 'gallery.example.com',
        purpose: DomainPurpose.Gallery,
      };

      service.createDomain(command).subscribe((result) => {
        expect(result).toEqual(mockDomain);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/domains`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockDomain);
    });
  });

  describe('verifyDomain', () => {
    it('should POST to /api/branding/domains/{id}/verify', () => {
      service.verifyDomain('dom-1').subscribe((result) => {
        expect(result).toEqual(mockDomain);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/domains/dom-1/verify`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(mockDomain);
    });
  });

  describe('deleteDomain', () => {
    it('should DELETE /api/branding/domains/{id}', () => {
      service.deleteDomain('dom-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/domains/dom-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('listDocumentBrandings', () => {
    it('should GET /api/branding/documents', () => {
      service.listDocumentBrandings().subscribe((result) => {
        expect(result).toEqual([mockDocBranding]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/documents`);
      expect(req.request.method).toBe('GET');
      req.flush([mockDocBranding]);
    });
  });

  describe('getDocumentBranding', () => {
    it('should GET /api/branding/documents/{documentType}', () => {
      service.getDocumentBranding('Invoice').subscribe((result) => {
        expect(result).toEqual(mockDocBranding);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/documents/Invoice`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDocBranding);
    });
  });

  describe('upsertDocumentBranding', () => {
    it('should PUT to /api/branding/documents', () => {
      const command: UpsertDocumentBrandingCommand = {
        documentType: DocumentType.Contract,
        brandColorHex: '#1A1A1C',
        fontTheme: 'Modern',
      };

      service.upsertDocumentBranding(command).subscribe((result) => {
        expect(result).toEqual(mockDocBranding);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/branding/documents`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockDocBranding);
    });
  });
});
