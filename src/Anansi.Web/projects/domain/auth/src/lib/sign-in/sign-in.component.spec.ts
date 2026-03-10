import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, AuthResponse } from 'api';
import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default state', () => {
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  describe('onSubmit', () => {
    it('should call login and emit authSuccess on success', () => {
      const mockResponse: AuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresAt: '2026-12-31T00:00:00Z',
        photographerId: 'photo-1',
      };

      const authSuccessSpy = vi.fn();
      component.authSuccess.subscribe(authSuccessSpy);

      component.email = 'john@example.com';
      component.password = 'Password123!';

      component.onSubmit();
      expect(component.loading()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'john@example.com',
        password: 'Password123!',
      });
      req.flush(mockResponse);

      expect(component.loading()).toBe(false);
      expect(authSuccessSpy).toHaveBeenCalledWith(mockResponse);
    });

    it('should set errorMessage on API error with message', () => {
      component.email = 'john@example.com';
      component.password = 'wrong';

      component.onSubmit();
      expect(component.loading()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Invalid credentials');
    });

    it('should set default errorMessage on API error without message', () => {
      component.email = 'john@example.com';
      component.password = 'wrong';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Sign in failed. Please try again.');
    });

    it('should not submit while already loading', () => {
      component.email = 'john@example.com';
      component.password = 'Password123!';

      component.onSubmit();
      component.onSubmit(); // second call should be ignored

      httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      // Only one request should have been made
    });

    it('should clear previous error on new submission', () => {
      component.email = 'john@example.com';
      component.password = 'Password123!';

      // First attempt fails
      component.onSubmit();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      req1.flush(
        { message: 'Error' },
        { status: 400, statusText: 'Bad Request' },
      );
      expect(component.errorMessage()).toBe('Error');

      // Second attempt should clear error
      component.onSubmit();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/auth/login`);
      req2.flush({
        token: 't',
        refreshToken: 'r',
        expiresAt: '2026-12-31T00:00:00Z',
      });
    });
  });

  describe('navigateToSignUp', () => {
    it('should emit navigateToSignUp output', () => {
      const spy = vi.fn();
      component.navigateToSignUp.subscribe(spy);

      const link = fixture.nativeElement.querySelector('.sign-in__link');
      link.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('navigateToForgotPassword', () => {
    it('should emit navigateToForgotPassword output', () => {
      const spy = vi.fn();
      component.navigateToForgotPassword.subscribe(spy);

      const link = fixture.nativeElement.querySelector('.sign-in__forgot-link');
      link.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onGoogleSignIn', () => {
    it('should be callable', () => {
      expect(() => component.onGoogleSignIn()).not.toThrow();
    });
  });
});
