import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { API_CONFIG, AccountSettings, StorageUsageDto } from 'api';
import { AccountSettingsPageComponent } from './account-settings-page.component';

describe('AccountSettingsPageComponent', () => {
  let component: AccountSettingsPageComponent;
  let fixture: ComponentFixture<AccountSettingsPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AccountSettingsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockSettings: AccountSettings = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    businessName: 'Doe Photography',
    timezone: 'America/New_York',
  };

  const mockStorage: StorageUsageDto = {
    usedBytes: 5368709120,
    totalBytes: 10737418240,
    warningLevel: 'None',
  };

  function flushInit(
    settings: AccountSettings = mockSettings,
    storage: StorageUsageDto = mockStorage,
  ): void {
    const settingsReq = httpTesting.expectOne(
      `${baseUrl}/api/account/settings`,
    );
    settingsReq.flush(settings);

    const storageReq = httpTesting.expectOne(`${baseUrl}/api/account/storage`);
    storageReq.flush(storage);
  }

  describe('init', () => {
    it('should load settings and storage on init', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(true);

      flushInit();

      expect(component.loading()).toBe(false);
      expect(component.email).toBe('test@example.com');
      expect(component.firstName).toBe('John');
      expect(component.lastName).toBe('Doe');
      expect(component.businessName).toBe('Doe Photography');
      expect(component.timezone).toBe('America/New_York');
      expect(component.storage()).toEqual(mockStorage);
    });

    it('should handle missing timezone', () => {
      const settingsNoTimezone: AccountSettings = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        businessName: 'Smith Studio',
      };
      fixture.detectChanges();
      flushInit(settingsNoTimezone);

      expect(component.timezone).toBe('');
    });

    it('should show error on load failure', () => {
      fixture.detectChanges();

      const settingsReq = httpTesting.expectOne(
        `${baseUrl}/api/account/settings`,
      );
      settingsReq.error(new ProgressEvent('error'));

      httpTesting.match(`${baseUrl}/api/account/storage`);

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Failed to load account settings.');
    });
  });

  describe('onSave', () => {
    it('should save settings and show success message', () => {
      fixture.detectChanges();
      flushInit();

      component.firstName = 'Jane';
      component.lastName = 'Smith';
      component.businessName = 'Smith Studio';
      component.timezone = 'US/Pacific';

      component.onSave();
      expect(component.saving()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
        businessName: 'Smith Studio',
        timezone: 'US/Pacific',
      });
      req.flush(null);

      expect(component.saving()).toBe(false);
      expect(component.successMessage()).toBe('Settings saved successfully.');
    });

    it('should send timezone as undefined when empty', () => {
      fixture.detectChanges();
      flushInit();

      component.timezone = '';
      component.onSave();

      const req = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      expect(req.request.body.timezone).toBeUndefined();
      req.flush(null);
    });

    it('should show error on save failure', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();

      const req = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      req.error(new ProgressEvent('error'));

      expect(component.saving()).toBe(false);
      expect(component.errorMessage()).toBe(
        'Failed to save settings. Please try again.',
      );
    });

    it('should not submit while already saving', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();
      component.onSave();

      httpTesting.expectOne(`${baseUrl}/api/account/settings`);
    });

    it('should clear previous messages on new save', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();
      const req1 = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      req1.flush(null);
      expect(component.successMessage()).toBe('Settings saved successfully.');

      component.onSave();
      expect(component.successMessage()).toBeNull();
      expect(component.errorMessage()).toBeNull();

      const req2 = httpTesting.expectOne(`${baseUrl}/api/account/settings`);
      req2.flush(null);
    });
  });

  describe('onDeleteAccount', () => {
    it('should delete account and show success message', () => {
      fixture.detectChanges();
      flushInit();

      component.showDeleteConfirm.set(true);
      component.onDeleteAccount();

      expect(component.showDeleteConfirm()).toBe(false);

      const req = httpTesting.expectOne(`${baseUrl}/api/account`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(component.successMessage()).toBe('Account deleted.');
    });

    it('should show error on delete failure', () => {
      fixture.detectChanges();
      flushInit();

      component.onDeleteAccount();

      const req = httpTesting.expectOne(`${baseUrl}/api/account`);
      req.error(new ProgressEvent('error'));

      expect(component.errorMessage()).toBe(
        'Failed to delete account. Please try again.',
      );
    });
  });

  describe('storagePercentage', () => {
    it('should calculate storage percentage', () => {
      fixture.detectChanges();
      flushInit();

      expect(component.storagePercentage()).toBe(50);
    });

    it('should return 0 when no storage data', () => {
      fixture.detectChanges();
      flushInit(mockSettings, {
        usedBytes: 0,
        totalBytes: 0,
        warningLevel: 'None',
      });

      expect(component.storagePercentage()).toBe(0);
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(component.formatBytes(0)).toBe('0 B');
    });

    it('should format bytes in KB', () => {
      expect(component.formatBytes(1024)).toBe('1.0 KB');
    });

    it('should format bytes in MB', () => {
      expect(component.formatBytes(1048576)).toBe('1.0 MB');
    });

    it('should format bytes in GB', () => {
      expect(component.formatBytes(5368709120)).toBe('5.0 GB');
    });

    it('should format bytes in TB', () => {
      expect(component.formatBytes(1099511627776)).toBe('1.0 TB');
    });

    it('should show one decimal for values under 10', () => {
      expect(component.formatBytes(5368709120)).toBe('5.0 GB');
    });

    it('should show no decimals for values 10 or above', () => {
      expect(component.formatBytes(10737418240)).toBe('10 GB');
    });
  });

  describe('template rendering', () => {
    it('should show loading spinner while loading', () => {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.page__loading')).toBeTruthy();
      expect(el.querySelector('.page')).toBeNull();
      flushInit();
    });

    it('should show page content after loading', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.page__loading')).toBeNull();
      expect(el.querySelector('.page')).toBeTruthy();
      expect(el.querySelector('.page__title')!.textContent).toContain(
        'Account Settings',
      );
    });

    it('should show storage bar with correct percentage', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const fill = el.querySelector(
        '.storage__bar-fill',
      ) as HTMLElement;
      expect(fill.style.width).toBe('50%');
    });

    it('should apply warning class for Warning80 level', () => {
      fixture.detectChanges();
      flushInit(mockSettings, {
        usedBytes: 8589934592,
        totalBytes: 10737418240,
        warningLevel: 'Warning80',
      });
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const fill = el.querySelector('.storage__bar-fill') as HTMLElement;
      expect(fill.classList.contains('storage__bar-fill--warning')).toBe(true);
    });

    it('should apply critical class for Critical95 level', () => {
      fixture.detectChanges();
      flushInit(mockSettings, {
        usedBytes: 10200547328,
        totalBytes: 10737418240,
        warningLevel: 'Critical95',
      });
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const fill = el.querySelector('.storage__bar-fill') as HTMLElement;
      expect(fill.classList.contains('storage__bar-fill--critical')).toBe(true);
    });

    it('should show success message when set', () => {
      fixture.detectChanges();
      flushInit();

      component.successMessage.set('Test success');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.page__success')!.textContent).toContain(
        'Test success',
      );
    });

    it('should show error message when set', () => {
      fixture.detectChanges();
      flushInit();

      component.errorMessage.set('Test error');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.page__error')!.textContent).toContain(
        'Test error',
      );
    });

    it('should show storage text with formatted sizes', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const text = el.querySelector('.storage__text')!.textContent!;
      expect(text).toContain('5.0 GB');
      expect(text).toContain('10 GB');
      expect(text).toContain('50%');
    });

    it('should open delete confirm dialog on button click', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      expect(component.showDeleteConfirm()).toBe(false);

      const el = fixture.nativeElement as HTMLElement;
      const deleteBtn = el.querySelector(
        'lib-button[variant="destructive"]',
      ) as HTMLElement;
      deleteBtn.querySelector('button')?.click();

      expect(component.showDeleteConfirm()).toBe(true);
    });
  });
});
