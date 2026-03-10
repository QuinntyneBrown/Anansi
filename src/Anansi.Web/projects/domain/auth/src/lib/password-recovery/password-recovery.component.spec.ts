import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from 'api';
import { PasswordRecoveryComponent } from './password-recovery.component';

describe('PasswordRecoveryComponent', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasswordRecoveryComponent);
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

  it('should initialize with request step', () => {
    expect(component.step()).toBe('request');
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.email).toBe('');
    expect(component.token).toBe('');
    expect(component.newPassword).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  describe('onSendResetLink', () => {
    it('should call forgotPassword and advance to check-email on success', () => {
      component.email = 'john@example.com';

      component.onSendResetLink();
      expect(component.loading()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com' });
      req.flush(null);

      expect(component.loading()).toBe(false);
      expect(component.step()).toBe('check-email');
    });

    it('should set errorMessage on API error with message', () => {
      component.email = 'bad@example.com';

      component.onSendResetLink();
      expect(component.loading()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      req.flush(
        { message: 'User not found' },
        { status: 404, statusText: 'Not Found' },
      );

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('User not found');
      expect(component.step()).toBe('request');
    });

    it('should set default errorMessage on API error without message', () => {
      component.email = 'bad@example.com';

      component.onSendResetLink();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Failed to send reset link. Please try again.');
    });

    it('should not submit while already loading', () => {
      component.email = 'john@example.com';

      component.onSendResetLink();
      component.onSendResetLink(); // second call should be ignored

      httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
    });

    it('should clear previous error on new submission', () => {
      component.email = 'john@example.com';

      // First attempt fails
      component.onSendResetLink();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      req1.flush(
        { message: 'Error' },
        { status: 400, statusText: 'Bad Request' },
      );
      expect(component.errorMessage()).toBe('Error');

      // Second attempt should clear error
      component.onSendResetLink();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      req2.flush(null);
    });
  });

  describe('onResetPassword', () => {
    beforeEach(() => {
      component.step.set('new-password');
      fixture.detectChanges();
    });

    it('should call resetPassword and emit recoveryComplete on success', () => {
      const spy = vi.fn();
      component.recoveryComplete.subscribe(spy);

      component.token = 'reset-token-abc';
      component.newPassword = 'NewPassword456!';
      component.confirmPassword = 'NewPassword456!';

      component.onResetPassword();
      expect(component.loading()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        token: 'reset-token-abc',
        newPassword: 'NewPassword456!',
      });
      req.flush(null);

      expect(component.loading()).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it('should set error when passwords do not match', () => {
      component.token = 'reset-token';
      component.newPassword = 'Password1!';
      component.confirmPassword = 'Password2!';

      component.onResetPassword();

      expect(component.errorMessage()).toBe('Passwords do not match.');
      expect(component.loading()).toBe(false);
      // No HTTP request should be made
    });

    it('should set errorMessage on API error with message', () => {
      component.token = 'expired-token';
      component.newPassword = 'NewPassword456!';
      component.confirmPassword = 'NewPassword456!';

      component.onResetPassword();
      expect(component.loading()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
      req.flush(
        { message: 'Token expired' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Token expired');
    });

    it('should set default errorMessage on API error without message', () => {
      component.token = 'bad-token';
      component.newPassword = 'NewPassword456!';
      component.confirmPassword = 'NewPassword456!';

      component.onResetPassword();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Failed to reset password. Please try again.');
    });

    it('should not submit while already loading', () => {
      component.token = 'token';
      component.newPassword = 'NewPassword456!';
      component.confirmPassword = 'NewPassword456!';

      component.onResetPassword();
      component.onResetPassword(); // second call should be ignored

      httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
    });

    it('should clear previous error on new submission', () => {
      component.token = 'token';
      component.newPassword = 'NewPassword456!';
      component.confirmPassword = 'NewPassword456!';

      // First attempt fails
      component.onResetPassword();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
      req1.flush(
        { message: 'Error' },
        { status: 400, statusText: 'Bad Request' },
      );
      expect(component.errorMessage()).toBe('Error');

      // Second attempt should clear error
      component.onResetPassword();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/auth/reset-password`);
      req2.flush(null);
    });
  });

  describe('step transitions', () => {
    it('should render request step by default', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.recovery__title')?.textContent).toContain('Anansi');
      expect(el.querySelector('.recovery__subtitle')?.textContent).toContain('Reset your password');
    });

    it('should render check-email step after successful request', () => {
      component.email = 'john@example.com';
      component.onSendResetLink();

      const req = httpTesting.expectOne(`${baseUrl}/api/auth/forgot-password`);
      req.flush(null);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.recovery__check-title')?.textContent).toContain('Check your email');
      expect(el.textContent).toContain('john@example.com');
    });

    it('should render new-password step when set', () => {
      component.step.set('new-password');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.recovery__subtitle')?.textContent).toContain('Set new password');
    });
  });

  describe('navigateToSignIn', () => {
    it('should emit navigateToSignIn from request step', () => {
      const spy = vi.fn();
      component.navigateToSignIn.subscribe(spy);

      const link = fixture.nativeElement.querySelector('.recovery__link');
      link.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should emit navigateToSignIn from check-email step', () => {
      component.step.set('check-email');
      fixture.detectChanges();

      const spy = vi.fn();
      component.navigateToSignIn.subscribe(spy);

      const link = fixture.nativeElement.querySelector('.recovery__link');
      link.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should emit navigateToSignIn from new-password step', () => {
      component.step.set('new-password');
      fixture.detectChanges();

      const spy = vi.fn();
      component.navigateToSignIn.subscribe(spy);

      const link = fixture.nativeElement.querySelector('.recovery__link');
      link.click();

      expect(spy).toHaveBeenCalled();
    });
  });
});
