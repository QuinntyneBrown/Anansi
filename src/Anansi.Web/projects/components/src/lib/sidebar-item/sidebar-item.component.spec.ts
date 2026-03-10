import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LUCIDE_ICONS } from 'lucide-angular';
import { SidebarItemComponent } from './sidebar-item.component';

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
  imports: [SidebarItemComponent],
  template: `
    <lib-sidebar-item
      [icon]="icon()"
      [label]="label()"
      [active]="active()"
      [href]="href()"
      (itemClick)="onItemClick()"
    ></lib-sidebar-item>
  `,
})
class TestHostComponent {
  icon = signal('home');
  label = signal('Dashboard');
  active = signal(false);
  href = signal<string | null>(null);
  clicked = false;
  onItemClick(): void {
    this.clicked = true;
  }
}

describe('SidebarItemComponent', () => {
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
    const el = fixture.nativeElement.querySelector('lib-sidebar-item');
    expect(el).toBeTruthy();
  });

  it('should render the label text', () => {
    const label = fixture.nativeElement.querySelector('.sidebar-item__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Dashboard');
  });

  it('should render a lucide-icon element', () => {
    const icon = fixture.nativeElement.querySelector('lucide-icon');
    expect(icon).toBeTruthy();
  });

  it('should render inactive state by default', () => {
    const item = fixture.nativeElement.querySelector('.sidebar-item');
    expect(item.classList.contains('sidebar-item--active')).toBe(false);
  });

  it('should render active state with correct class', () => {
    host.active.set(true);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('.sidebar-item');
    expect(item.classList.contains('sidebar-item--active')).toBe(true);
  });

  it('should emit itemClick when clicked', () => {
    const item = fixture.nativeElement.querySelector('.sidebar-item');
    item.click();
    expect(host.clicked).toBe(true);
  });

  it('should emit itemClick on Enter keydown', () => {
    const item = fixture.nativeElement.querySelector('.sidebar-item');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    item.dispatchEvent(event);
    expect(host.clicked).toBe(true);
  });

  it('should update label when input changes', () => {
    host.label.set('Settings');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.sidebar-item__label');
    expect(label.textContent.trim()).toBe('Settings');
  });
});
