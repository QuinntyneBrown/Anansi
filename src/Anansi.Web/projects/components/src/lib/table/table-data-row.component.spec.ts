import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TableDataRowComponent } from './table-data-row.component';

@Component({
  selector: 'test-host',
  imports: [TableDataRowComponent],
  template: `<lib-table-data-row><span>John</span><span>Active</span></lib-table-data-row>`,
})
class TestHostComponent {}

describe('TableDataRowComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('lib-table-data-row');
    expect(el).toBeTruthy();
  });

  it('should render projected content', () => {
    const row = fixture.nativeElement.querySelector('.data-row');
    expect(row.textContent).toContain('John');
    expect(row.textContent).toContain('Active');
  });

  it('should have the data-row class', () => {
    const row = fixture.nativeElement.querySelector('.data-row');
    expect(row).toBeTruthy();
  });
});
