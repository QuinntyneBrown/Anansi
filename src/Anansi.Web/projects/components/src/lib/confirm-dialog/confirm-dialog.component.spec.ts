import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
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

  it('should show default title and message', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.title');
    expect(title.textContent).toBe('Are you sure?');

    const message = fixture.nativeElement.querySelector('.message');
    expect(message.textContent).toBe('This action cannot be undone. Do you want to continue?');
  });

  it('should show custom title and message', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Delete Account?');
    fixture.componentRef.setInput('message', 'All your data will be lost.');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.title');
    expect(title.textContent).toBe('Delete Account?');

    const message = fixture.nativeElement.querySelector('.message');
    expect(message.textContent).toBe('All your data will be lost.');
  });

  it('should show custom button labels', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('confirmLabel', 'Remove');
    fixture.componentRef.setInput('cancelLabel', 'Keep');
    fixture.detectChanges();

    const cancelBtn = fixture.nativeElement.querySelector('.btn-cancel');
    const confirmBtn = fixture.nativeElement.querySelector('.btn-confirm');
    expect(cancelBtn.textContent).toBe('Keep');
    expect(confirmBtn.textContent).toBe('Remove');
  });

  it('should emit confirmed when confirm button is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.confirmed, 'emit');
    const confirmBtn = fixture.nativeElement.querySelector('.btn-confirm');
    confirmBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit cancelled when cancel button is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.cancelled, 'emit');
    const cancelBtn = fixture.nativeElement.querySelector('.btn-cancel');
    cancelBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit cancelled when backdrop is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.cancelled, 'emit');
    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    backdrop.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit cancelled when panel is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.cancelled, 'emit');
    const panel = fixture.nativeElement.querySelector('.panel');
    panel.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit cancelled on Escape key', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.cancelled, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit cancelled on Escape key when not open', () => {
    fixture.detectChanges();

    const spy = vi.spyOn(component.cancelled, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('should render warning icon', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const warningIcon = fixture.nativeElement.querySelector('.warning-icon svg');
    expect(warningIcon).toBeTruthy();
    expect(warningIcon.getAttribute('width')).toBe('48');
    expect(warningIcon.getAttribute('height')).toBe('48');
  });
});
