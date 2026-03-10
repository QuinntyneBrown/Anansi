import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { PillTabBarComponent, PillTabItem } from './pill-tab-bar.component';

const DUMMY_ICON = [['path', { d: 'M0 0' }]] as const;

class AllIconsProvider {
  hasIcon(): boolean {
    return true;
  }
  getIcon() {
    return DUMMY_ICON;
  }
}

@Component({
  imports: [PillTabBarComponent],
  template: `
    <lib-pill-tab-bar
      [tabs]="tabs()"
      [activeTab]="activeTab()"
      (tabChange)="onTabChange($event)"
    ></lib-pill-tab-bar>
  `,
})
class TestHostComponent {
  tabs = signal<PillTabItem[]>([
    { label: 'Home', icon: 'home', value: 'home' },
    { label: 'Search', icon: 'search', value: 'search' },
    { label: 'Profile', icon: 'user', value: 'profile' },
  ]);
  activeTab = signal('home');
  changedTab: string | null = null;
  onTabChange(value: string): void {
    this.changedTab = value;
  }
}

describe('PillTabBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: LUCIDE_ICONS, multi: true, useValue: new AllIconsProvider() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('lib-pill-tab-bar');
    expect(el).toBeTruthy();
  });

  it('should render all tabs', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.pill-tab-bar__tab');
    expect(tabs.length).toBe(3);
  });

  it('should render labels for each tab', () => {
    const labels = fixture.nativeElement.querySelectorAll('.pill-tab-bar__label');
    expect(labels[0].textContent.trim()).toBe('Home');
    expect(labels[1].textContent.trim()).toBe('Search');
    expect(labels[2].textContent.trim()).toBe('Profile');
  });

  it('should render lucide-icon elements for each tab', () => {
    const icons = fixture.nativeElement.querySelectorAll('lucide-icon');
    expect(icons.length).toBe(3);
  });

  it('should mark the active tab with active class', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.pill-tab-bar__tab');
    expect(tabs[0].classList.contains('pill-tab-bar__tab--active')).toBe(true);
    expect(tabs[1].classList.contains('pill-tab-bar__tab--active')).toBe(false);
    expect(tabs[2].classList.contains('pill-tab-bar__tab--active')).toBe(false);
  });

  it('should update active tab when input changes', () => {
    host.activeTab.set('search');
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.pill-tab-bar__tab');
    expect(tabs[0].classList.contains('pill-tab-bar__tab--active')).toBe(false);
    expect(tabs[1].classList.contains('pill-tab-bar__tab--active')).toBe(true);
  });

  it('should emit tabChange when a tab is clicked', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.pill-tab-bar__tab');
    tabs[1].click();
    expect(host.changedTab).toBe('search');
  });

  it('should emit tabChange for the third tab', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.pill-tab-bar__tab');
    tabs[2].click();
    expect(host.changedTab).toBe('profile');
  });

  it('should render the pill container', () => {
    const pill = fixture.nativeElement.querySelector('.pill-tab-bar__pill');
    expect(pill).toBeTruthy();
  });

  it('should set aria-selected on active tab', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.pill-tab-bar__tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });
});
