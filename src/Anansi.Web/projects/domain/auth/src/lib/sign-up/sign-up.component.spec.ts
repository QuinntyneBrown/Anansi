import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, AuthResponse } from 'api';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SignUpComponent);
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
    expect(component.businessName).toBe('');
    expect(component.fullName).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  describe('onSubmit', () => {
    it('should call register and emit authSuccess on success', () => {
      const mockResponse: AuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresAt: '2026-12-31T00:00:00Z',
        photographerId: 'photo-1',
      };

      const authSuccessSpy = vi.fn();
      component.authSuccess.subscribe(authSuccessSpy);

      component.businessName = 'Doe Photography';
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.password = 'Password123!';

      component.onSubmit();
      expect(component.loading()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        businessName: 'Doe Photography',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });
      req.flush(mockResponse);

      expect(component.loading()).toBe(false);
      expect(authSuccessSpy).toHaveBeenCalledWith(mockResponse);
    });

    it('should parse single-word full name correctly', () => {
      component.businessName = 'Studio';
      component.fullName = 'Madonna';
      component.email = 'madonna@example.com';
      component.password = 'Password123!';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      expect(req.request.body.firstName).toBe('Madonna');
      expect(req.request.body.lastName).toBe('');
      req.flush({
        token: 't',
        refreshToken: 'r',
        expiresAt: '2026-12-31T00:00:00Z',
      });
    });

    it('should parse multi-word full name correctly', () => {
      component.businessName = 'Studio';
      component.fullName = 'Mary Jane Watson Parker';
      component.email = 'mary@example.com';
      component.password = 'Password123!';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      expect(req.request.body.firstName).toBe('Mary');
      expect(req.request.body.lastName).toBe('Jane Watson Parker');
      req.flush({
        token: 't',
        refreshToken: 'r',
        expiresAt: '2026-12-31T00:00:00Z',
      });
    });

    it('should set errorMessage on API error with message', () => {
      component.businessName = 'Studio';
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.password = 'short';

      component.onSubmit();
      expect(component.loading()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      req.flush(
        { message: 'Email already in use' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Email already in use');
    });

    it('should set default errorMessage on API error without message', () => {
      component.businessName = 'Studio';
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.password = 'short';

      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Registration failed. Please try again.');
    });

    it('should not submit while already loading', () => {
      component.businessName = 'Studio';
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.password = 'Password123!';

      component.onSubmit();
      component.onSubmit(); // second call should be ignored

      httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      // Only one request should have been made
    });

    it('should clear previous error on new submission', () => {
      component.businessName = 'Studio';
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.password = 'Password123!';

      // First attempt fails
      component.onSubmit();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      req1.flush(
        { message: 'Error' },
        { status: 400, statusText: 'Bad Request' },
      );
      expect(component.errorMessage()).toBe('Error');

      // Second attempt should clear error
      component.onSubmit();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/auth/register`);
      req2.flush({
        token: 't',
        refreshToken: 'r',
        expiresAt: '2026-12-31T00:00:00Z',
      });
    });
  });

  describe('navigateToSignIn', () => {
    it('should emit navigateToSignIn output', () => {
      const spy = vi.fn();
      component.navigateToSignIn.subscribe(spy);

      const link = fixture.nativeElement.querySelector('.sign-up__link');
      link.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onGoogleSignUp', () => {
    it('should be callable', () => {
      expect(() => component.onGoogleSignUp()).not.toThrow();
    });
  });
});
