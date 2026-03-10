import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareDialogComponent } from './share-dialog.component';

describe('ShareDialogComponent', () => {
  let component: ShareDialogComponent;
  let fixture: ComponentFixture<ShareDialogComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ShareDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ShareDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show share URL in read-only input', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('shareUrl', 'https://example.com/gallery/abc');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.url-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('https://example.com/gallery/abc');
    expect(input.readOnly).toBe(true);
  });

  it('should display the title', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('title', 'Share Gallery');
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('lib-modal');
    expect(modal).toBeTruthy();
  });

  it('should render all platform buttons', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.platform-button');
    expect(buttons.length).toBe(5);

    const names = Array.from(buttons).map(
      (b: any) => b.querySelector('.platform-name').textContent,
    );
    expect(names).toEqual(['Facebook', 'Instagram', 'Pinterest', 'WhatsApp', 'Email']);
  });

  it('should render platform icons', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('.platform-icon');
    expect(icons.length).toBe(5);
    // Each icon span should contain an SVG element
    for (const icon of Array.from(icons) as HTMLElement[]) {
      const svg = icon.querySelector('svg');
      expect(svg).toBeTruthy();
    }
  });

  it('should have aria-labels on platform buttons', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.platform-button');
    expect(buttons[0].getAttribute('aria-label')).toBe('Share on Facebook');
    expect(buttons[4].getAttribute('aria-label')).toBe('Share on Email');
  });

  it('should copy URL to clipboard and show Copied! text', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('shareUrl', 'https://example.com/share');
    fixture.detectChanges();

    component.copyToClipboard();
    fixture.detectChanges();

    expect(writeTextMock).toHaveBeenCalledWith('https://example.com/share');
    expect(component.copied()).toBe(true);

    const button = fixture.nativeElement.querySelector('lib-button');
    expect(button.textContent).toContain('Copied!');
  });

  it('should reset copied state after 2 seconds', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('shareUrl', 'https://example.com');
    fixture.detectChanges();

    component.copyToClipboard();
    expect(component.copied()).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(component.copied()).toBe(false);
  });

  it('should clear previous timer on repeated copy clicks', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('shareUrl', 'https://example.com');
    fixture.detectChanges();

    component.copyToClipboard();
    vi.advanceTimersByTime(1000);
    expect(component.copied()).toBe(true);

    component.copyToClipboard();
    vi.advanceTimersByTime(1500);
    expect(component.copied()).toBe(true);

    vi.advanceTimersByTime(500);
    expect(component.copied()).toBe(false);
  });

  it('should emit platformSelected when a platform button is clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.platformSelected.subscribe(spy);

    const buttons = fixture.nativeElement.querySelectorAll('.platform-button');
    buttons[0].click();

    expect(spy).toHaveBeenCalledWith('facebook');
  });

  it('should emit platformSelected for each platform', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.platformSelected.subscribe(spy);

    const buttons = fixture.nativeElement.querySelectorAll('.platform-button');
    buttons[1].click();
    expect(spy).toHaveBeenCalledWith('instagram');

    buttons[2].click();
    expect(spy).toHaveBeenCalledWith('pinterest');

    buttons[3].click();
    expect(spy).toHaveBeenCalledWith('whatsapp');

    buttons[4].click();
    expect(spy).toHaveBeenCalledWith('email');
  });

  it('should emit closed when modal is closed', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.closed.subscribe(spy);

    component.closed.emit();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should show Copy text when not copied', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('lib-button');
    expect(button.textContent).toContain('Copy');
    expect(button.textContent).not.toContain('Copied!');
  });

  it('should show share-label text', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.share-label');
    expect(label.textContent).toBe('Share on');
  });

  it('should show divider between URL and platforms', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const divider = fixture.nativeElement.querySelector('.divider');
    expect(divider).toBeTruthy();
  });

  it('should render URL input with aria-label', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.url-input');
    expect(input.getAttribute('aria-label')).toBe('Share URL');
  });

  it('should not render content when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const urlInput = fixture.nativeElement.querySelector('.url-input');
    expect(urlInput).toBeNull();
  });

  it('should use default title when none provided', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.title()).toBe('Share');
  });
});
