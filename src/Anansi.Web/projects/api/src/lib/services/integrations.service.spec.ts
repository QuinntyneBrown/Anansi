import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { IntegrationsService } from './integrations.service';
import { CodeInjectionLocation } from '../models/enums';
import {
  CodeInjectionDto,
  ConfigureFacebookPixelCommand,
  ConfigureGalleryAssistCommand,
  ConfigureGoogleAnalyticsCommand,
  ConfigureInstagramFeedCommand,
  ConfigurePayPalCommand,
  ConfigureStripeCommand,
  InstagramFeedDto,
  SaveCustomCodeInjectionCommand,
} from '../models/system.models';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
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
    service = TestBed.inject(IntegrationsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('configureGoogleAnalytics', () => {
    it('should PUT to /api/integrations/google-analytics', () => {
      const command: ConfigureGoogleAnalyticsCommand = { measurementId: 'G-12345' };

      service.configureGoogleAnalytics(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/google-analytics`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('configureFacebookPixel', () => {
    it('should PUT to /api/integrations/facebook-pixel', () => {
      const command: ConfigureFacebookPixelCommand = { pixelId: 'px-999' };

      service.configureFacebookPixel(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/facebook-pixel`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('configureInstagram', () => {
    it('should PUT to /api/integrations/instagram', () => {
      const command: ConfigureInstagramFeedCommand = { accessToken: 'ig-token-abc' };

      service.configureInstagram(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/instagram`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('getInstagramFeed', () => {
    it('should GET /api/integrations/instagram/feed/{photographerId}', () => {
      const mockFeed: InstagramFeedDto = {
        posts: [
          {
            id: 'post-1',
            imageUrl: 'https://example.com/img.jpg',
            permalink: 'https://instagram.com/p/abc',
            caption: 'A great photo',
          },
        ],
      };

      service.getInstagramFeed('photo-1').subscribe((result) => {
        expect(result).toEqual(mockFeed);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/instagram/feed/photo-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeed);
    });
  });

  describe('configureStripe', () => {
    it('should POST to /api/integrations/stripe', () => {
      const command: ConfigureStripeCommand = { apiKey: 'sk_test_123' };

      service.configureStripe(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/stripe`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('configurePayPal', () => {
    it('should PUT to /api/integrations/paypal', () => {
      const command: ConfigurePayPalCommand = { clientId: 'pp-client', clientSecret: 'pp-secret' };

      service.configurePayPal(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/paypal`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('saveCodeInjection', () => {
    it('should POST to /api/integrations/code-injection', () => {
      const command: SaveCustomCodeInjectionCommand = {
        location: CodeInjectionLocation.Header,
        code: '<script>console.log("hi")</script>',
      };

      service.saveCodeInjection(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/code-injection`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('getCodeInjections', () => {
    it('should GET /api/integrations/code-injection', () => {
      const mockInjections: CodeInjectionDto[] = [
        {
          id: 'ci-1',
          location: CodeInjectionLocation.Header,
          code: '<script>test</script>',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      service.getCodeInjections().subscribe((result) => {
        expect(result).toEqual(mockInjections);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/code-injection`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInjections);
    });
  });

  describe('configureGalleryAssist', () => {
    it('should PUT to /api/integrations/gallery-assist', () => {
      const command: ConfigureGalleryAssistCommand = {
        enabled: true,
        autoCategorizeSets: false,
      };

      service.configureGalleryAssist(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/integrations/gallery-assist`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });
});
