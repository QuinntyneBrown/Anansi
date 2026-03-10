import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <lib-empty-state heading="No items" description="Nothing to display here">
      <button empty-state-action>Add Item</button>
    </lib-empty-state>
  `,
})
class TestHostComponent {}

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default icon to inbox', () => {
    expect(component.icon).toBe('inbox');
  });

  it('should render the inbox icon by default', () => {
    fixture.detectChanges();

    const iconArea = fixture.nativeElement.querySelector('.icon-area');
    expect(iconArea).toBeTruthy();

    const svg = iconArea.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('64');
    expect(svg.getAttribute('height')).toBe('64');
  });

  it('should render heading', () => {
    fixture.componentRef.setInput('heading', 'No Results');
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('.heading');
    expect(heading.textContent).toBe('No Results');
  });

  it('should render description', () => {
    fixture.componentRef.setInput('description', 'Try adjusting your search criteria');
    fixture.detectChanges();

    const description = fixture.nativeElement.querySelector('.description');
    expect(description.textContent).toBe('Try adjusting your search criteria');
  });

  it('should project action button via ng-content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const actionButton = hostFixture.nativeElement.querySelector('[empty-state-action]');
    expect(actionButton).toBeTruthy();
    expect(actionButton.textContent).toBe('Add Item');
  });
});
