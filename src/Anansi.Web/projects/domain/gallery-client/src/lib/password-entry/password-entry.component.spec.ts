import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from 'api';
import { PasswordEntryComponent } from './password-entry.component';

describe('PasswordEntryComponent', () => {
  let component: PasswordEntryComponent;
  let fixture: ComponentFixture<PasswordEntryComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';
  const collectionId = 'col-1';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasswordEntryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('collectionId', collectionId);
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
    expect(component.password).toBe('');
  });

  it('should display the title', () => {
    const title = fixture.nativeElement.querySelector('.password-entry__title');
    expect(title.textContent).toContain('Protected Gallery');
  });

  it('should display the subtitle', () => {
    const subtitle = fixture.nativeElement.querySelector('.password-entry__subtitle');
    expect(subtitle.textContent).toContain('Enter the password');
  });

  describe('onSubmit', () => {
    it('should call verifyPassword and emit verified on success', () => {
      const verifiedSpy = vi.fn();
      component.verified.subscribe(verifiedSpy);

      component.password = 'secret123';
      component.onSubmit();

      expect(component.loading()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ password: 'secret123' });
      req.flush(null);

      expect(component.loading()).toBe(false);
      expect(verifiedSpy).toHaveBeenCalled();
    });

    it('should set errorMessage on API error with message', () => {
      component.password = 'wrong';
      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
      req.flush(
        { message: 'Invalid password' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Invalid password');
    });

    it('should set default errorMessage on API error without message', () => {
      component.password = 'wrong';
      component.onSubmit();

      const req = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Incorrect password. Please try again.');
    });

    it('should not submit while already loading', () => {
      component.password = 'secret123';

      component.onSubmit();
      component.onSubmit();

      httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
    });

    it('should not submit when password is empty', () => {
      component.password = '';
      component.onSubmit();
      httpTesting.expectNone(`${baseUrl}/api/collections/${collectionId}/verify-password`);
    });

    it('should not submit when password is whitespace only', () => {
      component.password = '   ';
      component.onSubmit();
      httpTesting.expectNone(`${baseUrl}/api/collections/${collectionId}/verify-password`);
    });

    it('should clear previous error on new submission', () => {
      component.password = 'wrong';

      component.onSubmit();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
      req1.flush(
        { message: 'Error' },
        { status: 401, statusText: 'Unauthorized' },
      );
      expect(component.errorMessage()).toBe('Error');

      component.password = 'correct';
      component.onSubmit();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
      req2.flush(null);
    });
  });

  it('should show error message in the DOM', () => {
    component.password = 'wrong';
    component.onSubmit();

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
    req.flush(
      { message: 'Bad password' },
      { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.password-entry__error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Bad password');
  });

  it('should not show error message when there is no error', () => {
    const errorEl = fixture.nativeElement.querySelector('.password-entry__error');
    expect(errorEl).toBeFalsy();
  });

  it('should render the password input', () => {
    const input = fixture.nativeElement.querySelector('lib-input-group');
    expect(input).toBeTruthy();
  });

  it('should render the submit button', () => {
    const btn = fixture.nativeElement.querySelector('lib-button');
    expect(btn).toBeTruthy();
  });

  it('should show spinner inside button while loading', () => {
    component.password = 'test123';
    component.onSubmit();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.password-entry__form lib-button');
    const spinner = btn.querySelector('lib-spinner');
    expect(spinner).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/${collectionId}/verify-password`);
    req.flush(null);
    fixture.detectChanges();

    const spinnerAfter = fixture.nativeElement.querySelector('.password-entry__form lib-button lib-spinner');
    expect(spinnerAfter).toBeFalsy();
  });
});
