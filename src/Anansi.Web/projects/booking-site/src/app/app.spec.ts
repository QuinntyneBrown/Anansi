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

  it('should render booking-shell container', () => {
    fixture.detectChanges();
    const shell = fixture.nativeElement.querySelector('.booking-shell');
    expect(shell).toBeTruthy();
  });

  it('should render booking top bar', () => {
    fixture.detectChanges();
    const topBar = fixture.nativeElement.querySelector('bs-booking-top-bar');
    expect(topBar).toBeTruthy();
  });

  it('should render main content area', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.booking-shell__content');
    expect(content).toBeTruthy();
  });

  it('should render router outlet', () => {
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
