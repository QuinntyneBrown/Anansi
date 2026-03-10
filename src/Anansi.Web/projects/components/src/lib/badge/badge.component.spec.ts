import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BadgeComponent } from './badge.component';

@Component({
  selector: 'test-host',
  imports: [BadgeComponent],
  template: `<lib-badge [variant]="variant">{{ text }}</lib-badge>`,
})
class TestHostComponent {
  variant: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
  text = 'Label';
}

describe('BadgeComponent', () => {
  describe('with direct component', () => {
    let fixture: ComponentFixture<BadgeComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BadgeComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(BadgeComponent);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render neutral variant by default', () => {
      const span = fixture.nativeElement.querySelector('.badge');
      expect(span.classList.contains('badge--neutral')).toBe(true);
    });

    it('should render success variant', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.badge');
      expect(span.classList.contains('badge--success')).toBe(true);
    });

    it('should render warning variant', () => {
      fixture.componentRef.setInput('variant', 'warning');
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.badge');
      expect(span.classList.contains('badge--warning')).toBe(true);
    });

    it('should render error variant', () => {
      fixture.componentRef.setInput('variant', 'error');
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.badge');
      expect(span.classList.contains('badge--error')).toBe(true);
    });
  });

  describe('with host component', () => {
    it('should project content text', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.badge');
      expect(span.textContent.trim()).toBe('Label');
    });
  });
});
