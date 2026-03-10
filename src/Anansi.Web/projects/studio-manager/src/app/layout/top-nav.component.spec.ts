import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from 'api';
import { TopNavComponent } from './top-nav.component';

@Component({
  selector: 'sm-test-host',
  standalone: true,
  imports: [TopNavComponent],
  template: `
    <sm-top-nav
      (menuToggle)="onMenuToggle()"
      (notificationsClicked)="onNotificationsClicked()"
    />
  `,
})
class TestHostComponent {
  menuToggled = false;
  notificationsClicked = false;
  onMenuToggle(): void { this.menuToggled = true; }
  onNotificationsClicked(): void { this.notificationsClicked = true; }
}

@Component({ selector: 'sm-test-dummy', standalone: true, template: '' })
class DummyComponent {}

describe('TopNavComponent', () => {
  let component: TopNavComponent;
  let fixture: ComponentFixture<TopNavComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent, data: { title: 'Dashboard' } },
          { path: 'contacts', component: DummyComponent, data: { title: 'Contacts' } },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopNavComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with Dashboard title', () => {
    expect(component.pageTitle()).toBe('Dashboard');
  });

  it('should initialize unreadCount to 0', () => {
    expect(component.unreadCount()).toBe(0);
  });

  it('should render header element', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.topnav');
    expect(header).toBeTruthy();
  });

  it('should render page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.topnav__title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Dashboard');
  });

  it('should render hamburger button', () => {
    fixture.detectChanges();
    const hamburger = fixture.nativeElement.querySelector('.topnav__hamburger');
    expect(hamburger).toBeTruthy();
  });

  it('should render notification button', () => {
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.topnav__notification-btn');
    expect(btn).toBeTruthy();
  });

  it('should render avatar', () => {
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('lib-avatar');
    expect(avatar).toBeTruthy();
  });

  it('should not show badge when unreadCount is 0', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.topnav__notification-badge');
    expect(badge).toBeNull();
  });

  it('should show badge when unreadCount is positive', () => {
    component.unreadCount.set(3);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.topnav__notification-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('3');
  });

  it('should show 99+ when unreadCount exceeds 99', () => {
    component.unreadCount.set(150);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.topnav__notification-badge');
    expect(badge.textContent).toContain('99+');
  });

  it('should fetch unread count on init', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/notifications/unread-count`);
    req.flush({ count: 7 });
    expect(component.unreadCount()).toBe(7);
  });

  it('should handle unread count API error gracefully', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/api/notifications/unread-count`);
    req.flush('error', { status: 500, statusText: 'Error' });
    expect(component.unreadCount()).toBe(0);
  });

  it('should unsubscribe from router events on destroy', () => {
    fixture.detectChanges();
    httpTesting.match(() => true);
    component.ngOnDestroy();
  });

  it('should show exact count when unreadCount is 99', () => {
    component.unreadCount.set(99);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.topnav__notification-badge');
    expect(badge.textContent).toContain('99');
    expect(badge.textContent).not.toContain('99+');
  });

  it('should show badge when unreadCount is 1', () => {
    component.unreadCount.set(1);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.topnav__notification-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('1');
  });
});

describe('TopNavComponent with host', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    host = hostFixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('should emit menuToggle when hamburger is clicked', () => {
    hostFixture.detectChanges();
    const hamburger = hostFixture.nativeElement.querySelector('.topnav__hamburger');
    hamburger.click();
    expect(host.menuToggled).toBe(true);
  });

  it('should emit notificationsClicked when notification button is clicked', () => {
    hostFixture.detectChanges();
    const btn = hostFixture.nativeElement.querySelector('.topnav__notification-btn');
    btn.click();
    expect(host.notificationsClicked).toBe(true);
  });
});
