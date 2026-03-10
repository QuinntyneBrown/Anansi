import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar.component';

@Component({
  imports: [TopBarComponent],
  template: `
    <lib-top-bar>
      <span topbar-left class="custom-logo">Logo</span>
      <button topbar-right class="custom-action">Action</button>
    </lib-top-bar>
  `,
})
class ProjectedHostComponent {}

describe('TopBarComponent', () => {
  describe('default rendering', () => {
    let fixture: ComponentFixture<TopBarComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TopBarComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TopBarComponent);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render default "Anansi" title when no content is projected', () => {
      const title = fixture.nativeElement.querySelector('.top-bar__title');
      expect(title).toBeTruthy();
      expect(title.textContent.trim()).toBe('Anansi');
    });

    it('should have correct height of 64px', () => {
      const nav = fixture.nativeElement.querySelector('.top-bar');
      expect(nav).toBeTruthy();
      const styles = getComputedStyle(nav);
      expect(styles.height).toBe('64px');
    });

    it('should have a bottom border', () => {
      const nav = fixture.nativeElement.querySelector('.top-bar');
      const styles = getComputedStyle(nav);
      expect(styles.borderBottomStyle).toBe('solid');
    });
  });

  describe('with projected content', () => {
    let fixture: ComponentFixture<ProjectedHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ProjectedHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ProjectedHostComponent);
      fixture.detectChanges();
    });

    it('should project left content', () => {
      const logo = fixture.nativeElement.querySelector('.custom-logo');
      expect(logo).toBeTruthy();
      expect(logo.textContent.trim()).toBe('Logo');
    });

    it('should project right content', () => {
      const action = fixture.nativeElement.querySelector('.custom-action');
      expect(action).toBeTruthy();
      expect(action.textContent.trim()).toBe('Action');
    });
  });
});
