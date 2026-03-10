import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { API_CONFIG } from 'api';
import { App } from './app';

const DUMMY_ICON = [['path', { d: 'M0 0' }]] as const;

class AllIconsProvider {
  hasIcon(): boolean { return true; }
  getIcon() { return DUMMY_ICON; }
}

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the shell layout', () => {
    fixture.detectChanges();
    const shell = fixture.nativeElement.querySelector('.shell');
    expect(shell).toBeTruthy();
  });

  it('should render the sidebar component', () => {
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('sm-sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should render the top-nav component', () => {
    fixture.detectChanges();
    const topNav = fixture.nativeElement.querySelector('sm-top-nav');
    expect(topNav).toBeTruthy();
  });

  it('should render the mobile-tab-bar component', () => {
    fixture.detectChanges();
    const mobileTabBar = fixture.nativeElement.querySelector('sm-mobile-tab-bar');
    expect(mobileTabBar).toBeTruthy();
  });

  it('should render the router outlet', () => {
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should have a main content area', () => {
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('.shell__content');
    expect(main).toBeTruthy();
  });

  it('should have the shell__main wrapper', () => {
    fixture.detectChanges();
    const mainWrapper = fixture.nativeElement.querySelector('.shell__main');
    expect(mainWrapper).toBeTruthy();
  });
});
