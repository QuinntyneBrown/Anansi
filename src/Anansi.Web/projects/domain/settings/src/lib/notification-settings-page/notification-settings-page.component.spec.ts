import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  NotificationPreferencesDto,
  NotificationPreferenceItemDto,
  NotificationDeliveryMethod,
  EmailDigestOption,
} from 'api';
import { NotificationSettingsPageComponent } from './notification-settings-page.component';

describe('NotificationSettingsPageComponent', () => {
  let component: NotificationSettingsPageComponent;
  let fixture: ComponentFixture<NotificationSettingsPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationSettingsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationSettingsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockPreference = (
    overrides?: Partial<NotificationPreferenceItemDto>,
  ): NotificationPreferenceItemDto => ({
    eventType: 'PhotoDownloaded',
    deliveryMethods: [
      NotificationDeliveryMethod.InApp,
      NotificationDeliveryMethod.Email,
    ],
    emailDigest: EmailDigestOption.RealTime,
    ...overrides,
  });

  const mockPreferences: NotificationPreferencesDto = {
    preferences: [
      mockPreference(),
      mockPreference({
        eventType: 'StoreOrderPlaced',
        deliveryMethods: [NotificationDeliveryMethod.InApp],
        emailDigest: EmailDigestOption.DailySummary,
      }),
    ],
  };

  function flushInit(
    data: NotificationPreferencesDto = mockPreferences,
  ): void {
    const req = httpTesting.expectOne(
      `${baseUrl}/api/notifications/preferences`,
    );
    req.flush(data);
  }

  describe('init', () => {
    it('should load preferences on init', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(true);

      flushInit();

      expect(component.loading()).toBe(false);
      expect(component.preferences().length).toBe(2);
      expect(component.preferences()[0].eventType).toBe('PhotoDownloaded');
    });

    it('should show error on load failure', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(
        `${baseUrl}/api/notifications/preferences`,
      );
      req.error(new ProgressEvent('error'));

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe(
        'Failed to load notification preferences.',
      );
    });
  });

  describe('hasMethod', () => {
    it('should return true when method is present', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      expect(component.hasMethod(pref, 'InApp')).toBe(true);
      expect(component.hasMethod(pref, 'Email')).toBe(true);
    });

    it('should return false when method is not present', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      expect(component.hasMethod(pref, 'Push')).toBe(false);
    });
  });

  describe('onToggleMethod', () => {
    it('should add delivery method when toggled on', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      component.onToggleMethod(pref, 'Push', true);

      const updated = component.preferences()[0];
      expect(updated.deliveryMethods).toContain(
        NotificationDeliveryMethod.Push,
      );
    });

    it('should remove delivery method when toggled off', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      component.onToggleMethod(pref, 'Email', false);

      const updated = component.preferences()[0];
      expect(updated.deliveryMethods).not.toContain(
        NotificationDeliveryMethod.Email,
      );
      expect(updated.deliveryMethods).toContain(
        NotificationDeliveryMethod.InApp,
      );
    });

    it('should not affect other preferences', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      component.onToggleMethod(pref, 'Push', true);

      const other = component.preferences()[1];
      expect(other.deliveryMethods).toEqual([
        NotificationDeliveryMethod.InApp,
      ]);
    });
  });

  describe('onDigestChange', () => {
    it('should update email digest option', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      component.onDigestChange(pref, EmailDigestOption.DailySummary);

      const updated = component.preferences()[0];
      expect(updated.emailDigest).toBe(EmailDigestOption.DailySummary);
    });

    it('should not affect other preferences', () => {
      fixture.detectChanges();
      flushInit();

      const pref = component.preferences()[0];
      component.onDigestChange(pref, EmailDigestOption.DailySummary);

      const other = component.preferences()[1];
      expect(other.emailDigest).toBe(EmailDigestOption.DailySummary);
    });
  });

  describe('onSave', () => {
    it('should send update requests for all preferences', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();
      expect(component.saving()).toBe(true);

      const reqs = httpTesting.match(
        `${baseUrl}/api/notifications/preferences`,
      );
      expect(reqs.length).toBe(2);

      expect(reqs[0].request.method).toBe('PUT');
      expect(reqs[0].request.body).toEqual({
        eventType: 'PhotoDownloaded',
        deliveryMethods: [
          NotificationDeliveryMethod.InApp,
          NotificationDeliveryMethod.Email,
        ],
        emailDigest: EmailDigestOption.RealTime,
      });
      expect(reqs[1].request.body.eventType).toBe('StoreOrderPlaced');

      reqs[0].flush(null);
      reqs[1].flush(null);

      expect(component.saving()).toBe(false);
      expect(component.successMessage()).toBe(
        'Preferences saved successfully.',
      );
    });

    it('should show error on save failure', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();

      const reqs = httpTesting.match(
        `${baseUrl}/api/notifications/preferences`,
      );
      reqs[0].error(new ProgressEvent('error'));
      reqs[1].flush(null);

      expect(component.saving()).toBe(false);
      expect(component.errorMessage()).toBe(
        'Failed to save preferences. Please try again.',
      );
    });

    it('should not submit while already saving', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();
      component.onSave();

      const reqs = httpTesting.match(
        `${baseUrl}/api/notifications/preferences`,
      );
      expect(reqs.length).toBe(2);
      reqs.forEach((r) => r.flush(null));
    });

    it('should clear previous messages on new save', () => {
      fixture.detectChanges();
      flushInit();

      component.onSave();
      const reqs1 = httpTesting.match(
        `${baseUrl}/api/notifications/preferences`,
      );
      reqs1.forEach((r) => r.flush(null));
      expect(component.successMessage()).toBe(
        'Preferences saved successfully.',
      );

      component.onSave();
      expect(component.successMessage()).toBeNull();
      expect(component.errorMessage()).toBeNull();

      const reqs2 = httpTesting.match(
        `${baseUrl}/api/notifications/preferences`,
      );
      reqs2.forEach((r) => r.flush(null));
    });

    it('should handle empty preferences', () => {
      fixture.detectChanges();
      flushInit({ preferences: [] });

      component.onSave();

      expect(component.saving()).toBe(false);
      expect(component.successMessage()).toBe(
        'Preferences saved successfully.',
      );
    });
  });

  describe('formatEventType', () => {
    it('should convert camelCase to spaced words', () => {
      expect(component.formatEventType('PhotoDownloaded')).toBe(
        'Photo Downloaded',
      );
    });

    it('should handle multi-word event types', () => {
      expect(component.formatEventType('StoreOrderPlaced')).toBe(
        'Store Order Placed',
      );
    });

    it('should handle single word event types', () => {
      expect(component.formatEventType('Test')).toBe('Test');
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
        'Notification Preferences',
      );
    });

    it('should render preference rows', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const rows = el.querySelectorAll('.prefs__row');
      expect(rows.length).toBe(2);
    });

    it('should show event names formatted', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const eventNames = el.querySelectorAll('.prefs__event-name');
      expect(eventNames[0].textContent).toContain('Photo Downloaded');
      expect(eventNames[1].textContent).toContain('Store Order Placed');
    });

    it('should show success message when set', () => {
      fixture.detectChanges();
      flushInit();

      component.successMessage.set('Saved!');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.page__success')!.textContent).toContain(
        'Saved!',
      );
    });

    it('should show error message when set', () => {
      fixture.detectChanges();
      flushInit();

      component.errorMessage.set('Error occurred');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.page__error')!.textContent).toContain(
        'Error occurred',
      );
    });

    it('should render column headers', () => {
      fixture.detectChanges();
      flushInit();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const headers = el.querySelectorAll('.prefs__header-label');
      expect(headers.length).toBe(5);
      expect(headers[0].textContent).toContain('Event');
      expect(headers[1].textContent).toContain('In-App');
      expect(headers[2].textContent).toContain('Email');
      expect(headers[3].textContent).toContain('Push');
      expect(headers[4].textContent).toContain('Email Digest');
    });
  });
});
