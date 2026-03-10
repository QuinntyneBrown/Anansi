import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabBarComponent, TabItem } from './tab-bar.component';

@Component({
  imports: [TabBarComponent],
  template: `
    <lib-tab-bar
      [tabs]="tabs()"
      [activeTab]="activeTab()"
      (tabChange)="onTabChange($event)"
    ></lib-tab-bar>
  `,
})
class TestHostComponent {
  tabs = signal<TabItem[]>([
    { label: 'Overview', value: 'overview' },
    { label: 'Details', value: 'details' },
    { label: 'History', value: 'history' },
  ]);
  activeTab = signal('overview');
  changedTab: string | null = null;
  onTabChange(value: string): void {
    this.changedTab = value;
  }
}

describe('TabBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('lib-tab-bar');
    expect(el).toBeTruthy();
  });

  it('should render all tabs', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0].textContent.trim()).toBe('Overview');
    expect(tabs[1].textContent.trim()).toBe('Details');
    expect(tabs[2].textContent.trim()).toBe('History');
  });

  it('should mark the active tab', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab');
    expect(tabs[0].classList.contains('tab-bar__tab--active')).toBe(true);
    expect(tabs[1].classList.contains('tab-bar__tab--active')).toBe(false);
    expect(tabs[2].classList.contains('tab-bar__tab--active')).toBe(false);
  });

  it('should update active tab when input changes', () => {
    host.activeTab.set('details');
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab');
    expect(tabs[0].classList.contains('tab-bar__tab--active')).toBe(false);
    expect(tabs[1].classList.contains('tab-bar__tab--active')).toBe(true);
  });

  it('should emit tabChange when a tab is clicked', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab');
    tabs[1].click();
    expect(host.changedTab).toBe('details');
  });

  it('should emit tabChange for the third tab', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab');
    tabs[2].click();
    expect(host.changedTab).toBe('history');
  });

  it('should set aria-selected on active tab', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should have role tablist on container', () => {
    const tabBar = fixture.nativeElement.querySelector('.tab-bar');
    expect(tabBar.getAttribute('role')).toBe('tablist');
  });
});
