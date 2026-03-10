import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG, NotificationDto, NotificationCategory, PagedList } from 'api';
import { NotificationPanelComponent } from './notification-panel.component';

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return [['path', { d: 'M0 0' }]] as const; }
}

describe('NotificationPanelComponent', () => {
  let component: NotificationPanelComponent;
  let fixture: ComponentFixture<NotificationPanelComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationPanelComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationPanelComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockNotification = (overrides?: Partial<NotificationDto>): NotificationDto => ({
    id: 'notif-1',
    photographerId: 'photo-1',
    eventType: 'PhotoDownloaded',
    category: NotificationCategory.ClientGallery,
    title: 'Photo Downloaded',
    message: 'A client downloaded a photo',
    isRead: false,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  });

  const mockPagedList = (
    items: NotificationDto[] = [mockNotification()],
  ): PagedList<NotificationDto> => ({
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  function flushInit(
    items?: NotificationDto[],
    unreadCount = 3,
  ): void {
    const listReq = httpTesting.expectOne(
      (r) => r.url === `${baseUrl}/api/notifications`,
    );
    listReq.flush(mockPagedList(items));

    const countReq = httpTesting.expectOne(
      `${baseUrl}/api/notifications/unread-count`,
    );
    countReq.flush({ count: unreadCount });
  }

  describe('init', () => {
    it('should load notifications and unread count on init', () => {
      const items = [mockNotification(), mockNotification({ id: 'notif-2', title: 'Order Placed' })];
      fixture.detectChanges();

      expect(component.loading()).toBe(true);

      flushInit(items, 5);

      expect(component.notifications()).toEqual(items);
      expect(component.unreadCount()).toBe(5);
      expect(component.loading()).toBe(false);
    });

    it('should default activeTab to all', () => {
      fixture.detectChanges();
      flushInit();

      expect(component.activeTab()).toBe('all');
    });

    it('should not send category param when activeTab is all', () => {
      fixture.detectChanges();

      const listReq = httpTesting.expectOne(`${baseUrl}/api/notifications`);
      expect(listReq.request.params.has('category')).toBe(false);
      listReq.flush(mockPagedList());
      httpTesting.expectOne(`${baseUrl}/api/notifications/unread-count`).flush({ count: 0 });
    });

    it('should set loading to false on error', () => {
      fixture.detectChanges();

      const listReq = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      listReq.error(new ProgressEvent('error'));

      // forkJoin cancels the unread-count request when list errors;
      // match it so verify() does not flag it as open
      httpTesting.match(
        (r) => r.url === `${baseUrl}/api/notifications/unread-count`,
      );

      expect(component.loading()).toBe(false);
    });
  });

  describe('onTabChange', () => {
    it('should filter by ClientGallery when gallery tab selected', () => {
      fixture.detectChanges();
      flushInit();

      component.onTabChange('gallery');

      expect(component.activeTab()).toBe('gallery');
      expect(component.loading()).toBe(true);

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      expect(req.request.params.get('category')).toBe('ClientGallery');
      req.flush(mockPagedList());

      expect(component.loading()).toBe(false);
    });

    it('should filter by Store when store tab selected', () => {
      fixture.detectChanges();
      flushInit();

      component.onTabChange('store');

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      expect(req.request.params.get('category')).toBe('Store');
      req.flush(mockPagedList());
    });

    it('should filter by StudioManager when studio tab selected', () => {
      fixture.detectChanges();
      flushInit();

      component.onTabChange('studio');

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      expect(req.request.params.get('category')).toBe('StudioManager');
      req.flush(mockPagedList());
    });

    it('should not send category when all tab selected', () => {
      fixture.detectChanges();
      flushInit();

      component.onTabChange('all');

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications`);
      expect(req.request.params.has('category')).toBe(false);
      req.flush(mockPagedList());
    });

    it('should set loading to false on tab change error', () => {
      fixture.detectChanges();
      flushInit();

      component.onTabChange('gallery');

      const req = httpTesting.expectOne(
        (r) => r.url === `${baseUrl}/api/notifications`,
      );
      req.error(new ProgressEvent('error'));

      expect(component.loading()).toBe(false);
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read and set count to 0', () => {
      const items = [
        mockNotification({ id: 'n1', isRead: false }),
        mockNotification({ id: 'n2', isRead: false }),
      ];
      fixture.detectChanges();
      flushInit(items, 2);

      component.markAllRead();

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/read-all`);
      expect(req.request.method).toBe('PUT');
      req.flush(null);

      expect(component.notifications().every((n) => n.isRead)).toBe(true);
      expect(component.unreadCount()).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a single notification as read and decrement count', () => {
      const items = [
        mockNotification({ id: 'n1', isRead: false }),
        mockNotification({ id: 'n2', isRead: false }),
      ];
      fixture.detectChanges();
      flushInit(items, 2);

      component.markAsRead('n1');

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/n1/read`);
      expect(req.request.method).toBe('PUT');
      req.flush(null);

      const updated = component.notifications();
      expect(updated.find((n) => n.id === 'n1')!.isRead).toBe(true);
      expect(updated.find((n) => n.id === 'n2')!.isRead).toBe(false);
      expect(component.unreadCount()).toBe(1);
    });

    it('should not fire request for already-read notification', () => {
      const items = [mockNotification({ id: 'n1', isRead: true })];
      fixture.detectChanges();
      flushInit(items, 0);

      component.markAsRead('n1');
      // No request expected — httpTesting.verify() in afterEach confirms
    });

    it('should not fire request for non-existent notification', () => {
      fixture.detectChanges();
      flushInit([mockNotification()], 1);

      component.markAsRead('does-not-exist');
      // No request expected
    });

    it('should not decrement unreadCount below zero', () => {
      const items = [mockNotification({ id: 'n1', isRead: false })];
      fixture.detectChanges();
      flushInit(items, 0);

      component.markAsRead('n1');

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/n1/read`);
      req.flush(null);

      expect(component.unreadCount()).toBe(0);
    });
  });

  describe('relativeTime', () => {
    it('should return "just now" for times less than 60 seconds ago', () => {
      const now = new Date().toISOString();
      expect(component.relativeTime(now)).toBe('just now');
    });

    it('should return minutes for times less than 60 minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toBe('5m ago');
    });

    it('should return hours for times less than 24 hours ago', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toBe('3h ago');
    });

    it('should return days for times less than 30 days ago', () => {
      const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toBe('7d ago');
    });

    it('should return months for times 30+ days ago', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toBe('2mo ago');
    });

    it('should return "just now" for future dates', () => {
      const future = new Date(Date.now() + 60000).toISOString();
      expect(component.relativeTime(future)).toBe('just now');
    });
  });

  describe('template rendering', () => {
    it('should show loading indicator while loading', () => {
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.panel__loading-text')!.textContent).toContain('Loading');
      expect(el.querySelector('.panel__list')).toBeNull();

      flushInit();
    });

    it('should render unread notification with gold dot and bold title', () => {
      const items = [mockNotification({ id: 'n1', isRead: false })];
      fixture.detectChanges();
      flushInit(items, 1);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const dot = el.querySelector('.panel__dot');
      const title = el.querySelector('.panel__item-title');
      expect(dot).toBeTruthy();
      expect(title!.classList.contains('panel__item-title--unread')).toBe(true);
    });

    it('should render read notification with placeholder and normal title', () => {
      const items = [mockNotification({ id: 'n1', isRead: true })];
      fixture.detectChanges();
      flushInit(items, 0);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const placeholder = el.querySelector('.panel__dot-placeholder');
      const dot = el.querySelector('.panel__dot');
      const title = el.querySelector('.panel__item-title');
      expect(placeholder).toBeTruthy();
      expect(dot).toBeNull();
      expect(title!.classList.contains('panel__item-title--unread')).toBe(false);
    });

    it('should call markAsRead when notification item is clicked', () => {
      const items = [mockNotification({ id: 'n1', isRead: false })];
      fixture.detectChanges();
      flushInit(items, 1);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const item = el.querySelector('.panel__item') as HTMLButtonElement;
      item.click();

      const req = httpTesting.expectOne(`${baseUrl}/api/notifications/n1/read`);
      req.flush(null);

      expect(component.notifications()[0].isRead).toBe(true);
    });

    it('should render notification message and relative time', () => {
      const items = [mockNotification({ id: 'n1', message: 'Test message' })];
      fixture.detectChanges();
      flushInit(items, 1);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.panel__item-message')!.textContent).toContain('Test message');
      expect(el.querySelector('.panel__item-time')!.textContent!.trim().length).toBeGreaterThan(0);
    });

    it('should disable mark all read button when unreadCount is 0', () => {
      fixture.detectChanges();
      flushInit([], 0);
      fixture.detectChanges();

      const btn = (fixture.nativeElement as HTMLElement).querySelector(
        '.panel__mark-all',
      ) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('viewAll', () => {
    it('should emit viewAll event', () => {
      fixture.detectChanges();
      flushInit();

      let emitted = false;
      component.viewAll.subscribe(() => (emitted = true));

      fixture.detectChanges();
      const viewAllBtn = (fixture.nativeElement as HTMLElement).querySelector(
        '.panel__view-all',
      ) as HTMLButtonElement;
      viewAllBtn.click();

      expect(emitted).toBe(true);
    });
  });
});
