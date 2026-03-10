import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render gallery-mobile-shell container', () => {
    fixture.detectChanges();
    const shell = fixture.nativeElement.querySelector('.gallery-mobile-shell');
    expect(shell).toBeTruthy();
  });

  it('should render gallery mobile bar', () => {
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('mg-gallery-mobile-bar');
    expect(bar).toBeTruthy();
  });

  it('should render main content area', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.gallery-mobile-shell__content');
    expect(content).toBeTruthy();
  });

  it('should render router outlet', () => {
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
