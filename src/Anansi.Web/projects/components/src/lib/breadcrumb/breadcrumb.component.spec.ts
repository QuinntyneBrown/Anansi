import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';

@Component({
  imports: [BreadcrumbComponent],
  template: `
    <lib-breadcrumb
      [items]="items()"
      (navigate)="onNavigate($event)"
    ></lib-breadcrumb>
  `,
})
class TestHostComponent {
  items = signal<BreadcrumbItem[]>([
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Current Project' },
  ]);
  navigatedHref: string | null = null;
  onNavigate(href: string): void {
    this.navigatedHref = href;
  }
}

describe('BreadcrumbComponent', () => {
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
    const el = fixture.nativeElement.querySelector('lib-breadcrumb');
    expect(el).toBeTruthy();
  });

  it('should render all items', () => {
    const items = fixture.nativeElement.querySelectorAll('.breadcrumb__item');
    expect(items.length).toBe(3);
  });

  it('should render separators between items', () => {
    const separators = fixture.nativeElement.querySelectorAll('.breadcrumb__separator');
    expect(separators.length).toBe(2);
    expect(separators[0].textContent.trim()).toBe('/');
  });

  it('should mark the last item as active', () => {
    const items = fixture.nativeElement.querySelectorAll('.breadcrumb__item');
    const lastItem = items[items.length - 1];
    expect(lastItem.classList.contains('breadcrumb__item--active')).toBe(true);
    expect(lastItem.textContent.trim()).toBe('Current Project');
  });

  it('should not mark non-last items as active', () => {
    const items = fixture.nativeElement.querySelectorAll('.breadcrumb__item');
    expect(items[0].classList.contains('breadcrumb__item--active')).toBe(false);
    expect(items[1].classList.contains('breadcrumb__item--active')).toBe(false);
  });

  it('should style non-last items with href as links', () => {
    const links = fixture.nativeElement.querySelectorAll('.breadcrumb__item--link');
    expect(links.length).toBe(2);
  });

  it('should emit navigate with href when a link item is clicked', () => {
    const links = fixture.nativeElement.querySelectorAll('.breadcrumb__item--link');
    links[0].click();
    expect(host.navigatedHref).toBe('/');
  });

  it('should emit navigate for the second link item', () => {
    const links = fixture.nativeElement.querySelectorAll('.breadcrumb__item--link');
    links[1].click();
    expect(host.navigatedHref).toBe('/projects');
  });

  it('should handle a single item', () => {
    host.items.set([{ label: 'Only Page' }]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.breadcrumb__item');
    const separators = fixture.nativeElement.querySelectorAll('.breadcrumb__separator');
    expect(items.length).toBe(1);
    expect(separators.length).toBe(0);
    expect(items[0].classList.contains('breadcrumb__item--active')).toBe(true);
  });

  it('should set aria-current on the active item', () => {
    const activeItem = fixture.nativeElement.querySelector('.breadcrumb__item--active');
    expect(activeItem.getAttribute('aria-current')).toBe('page');
  });
});
