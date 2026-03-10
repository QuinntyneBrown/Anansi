import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { API_CONFIG } from 'api';
import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render gallery-shell container', () => {
    fixture.detectChanges();
    const shell = fixture.nativeElement.querySelector('.gallery-shell');
    expect(shell).toBeTruthy();
  });

  it('should render gallery top bar', () => {
    fixture.detectChanges();
    const topBar = fixture.nativeElement.querySelector('cg-gallery-top-bar');
    expect(topBar).toBeTruthy();
  });

  it('should render main content area', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.gallery-shell__content');
    expect(content).toBeTruthy();
  });

  it('should render router outlet', () => {
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
