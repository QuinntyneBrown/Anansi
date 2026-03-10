import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { AuthService } from './auth.service';
import {
  AuthResponse,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  LoginCommand,
  RegisterCommand,
  ResetPasswordCommand,
} from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
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
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('register', () => {
    it('should POST to /api/auth/register and return AuthResponse', () => {
      const command: RegisterCommand = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'John Doe Photography',
      };
      const mockResponse: AuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresAt: '2026-12-31T00:00:00Z',
        photographerId: 'photo-1',
      };

      service.register(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should POST to /api/auth/login and return AuthResponse', () => {
      const command: LoginCommand = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockResponse: AuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresAt: '2026-12-31T00:00:00Z',
      };

      service.login(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should POST to /api/auth/forgot-password', () => {
      const command: ForgotPasswordCommand = {
        email: 'test@example.com',
      };

      service.forgotPassword(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('resetPassword', () => {
    it('should POST to /api/auth/reset-password', () => {
      const command: ResetPasswordCommand = {
        token: 'reset-token-abc',
        newPassword: 'NewPassword456!',
      };

      service.resetPassword(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('changePassword', () => {
    it('should POST to /api/auth/change-password', () => {
      const command: ChangePasswordCommand = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
      };

      service.changePassword(command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('logout', () => {
    it('should POST to /api/auth/logout with empty body', () => {
      service.logout().subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });
});
