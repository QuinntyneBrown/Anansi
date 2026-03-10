import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalContainerComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [ModalContainerComponent],
  template: `
    <lib-modal [title]="'Test Modal'" [open]="isOpen" (closed)="onClosed()">
      <p class="modal-body-content">Body content</p>
      <div modal-footer>
        <button class="footer-btn">Save</button>
      </div>
    </lib-modal>
  `,
})
class TestHostComponent {
  isOpen = false;
  onClosed(): void {}
}

describe('ModalContainerComponent', () => {
  let component: ModalContainerComponent;
  let fixture: ComponentFixture<ModalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden when open is false', () => {
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    expect(backdrop).toBeNull();
  });

  it('should be visible when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    expect(backdrop).toBeTruthy();

    const panel = fixture.nativeElement.querySelector('.panel');
    expect(panel).toBeTruthy();
  });

  it('should render title', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'My Modal Title');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.title');
    expect(title.textContent).toBe('My Modal Title');
  });

  it('should emit closed when close button is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.closed, 'emit');
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit closed when backdrop is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.closed, 'emit');
    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    backdrop.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit closed when panel is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.closed, 'emit');
    const panel = fixture.nativeElement.querySelector('.panel');
    panel.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit closed on Escape key', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.closed, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit closed on Escape key when not open', () => {
    fixture.detectChanges();

    const spy = vi.spyOn(component.closed, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('should project content and footer', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    const hostComponent = hostFixture.componentInstance;
    hostComponent.isOpen = true;
    hostFixture.detectChanges();

    const bodyContent = hostFixture.nativeElement.querySelector('.modal-body-content');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent.textContent).toBe('Body content');

    const footerBtn = hostFixture.nativeElement.querySelector('.footer-btn');
    expect(footerBtn).toBeTruthy();
    expect(footerBtn.textContent).toBe('Save');
  });
});
