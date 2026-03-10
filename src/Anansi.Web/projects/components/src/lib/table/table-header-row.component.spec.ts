import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TableHeaderRowComponent } from './table-header-row.component';

@Component({
  selector: 'test-host',
  imports: [TableHeaderRowComponent],
  template: `<lib-table-header-row><span>Name</span><span>Status</span></lib-table-header-row>`,
})
class TestHostComponent {}

describe('TableHeaderRowComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('lib-table-header-row');
    expect(el).toBeTruthy();
  });

  it('should render projected content', () => {
    const row = fixture.nativeElement.querySelector('.header-row');
    expect(row.textContent).toContain('Name');
    expect(row.textContent).toContain('Status');
  });

  it('should have the header-row class', () => {
    const row = fixture.nativeElement.querySelector('.header-row');
    expect(row).toBeTruthy();
  });
});
