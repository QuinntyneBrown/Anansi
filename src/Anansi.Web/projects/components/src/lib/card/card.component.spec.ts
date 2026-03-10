import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CardComponent } from './card.component';

@Component({
  selector: 'test-host-full',
  imports: [CardComponent],
  template: `
    <lib-card>
      <div card-header>Header Content</div>
      <div>Body Content</div>
      <div card-actions>Action Content</div>
    </lib-card>
  `,
})
class TestHostFullComponent {}

@Component({
  selector: 'test-host-empty',
  imports: [CardComponent],
  template: `<lib-card></lib-card>`,
})
class TestHostEmptyComponent {}

@Component({
  selector: 'test-host-header-only',
  imports: [CardComponent],
  template: `
    <lib-card>
      <div card-header>Only Header</div>
    </lib-card>
  `,
})
class TestHostHeaderOnlyComponent {}

describe('CardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostEmptyComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHostEmptyComponent);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('lib-card');
    expect(card).toBeTruthy();
  });

  it('should render with header, content, and actions slots', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostFullComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHostFullComponent);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.card__header');
    expect(header.textContent).toContain('Header Content');

    const content = fixture.nativeElement.querySelector('.card__content');
    expect(content.textContent).toContain('Body Content');

    const actions = fixture.nativeElement.querySelector('.card__actions');
    expect(actions.textContent).toContain('Action Content');
  });

  it('should render with no slots without errors', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostEmptyComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHostEmptyComponent);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.card');
    expect(card).toBeTruthy();
  });

  it('should render with header slot only', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostHeaderOnlyComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHostHeaderOnlyComponent);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.card__header');
    expect(header.textContent).toContain('Only Header');
  });
});
