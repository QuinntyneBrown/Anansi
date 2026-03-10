import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricCardComponent } from './metric-card.component';

describe('MetricCardComponent', () => {
  let fixture: ComponentFixture<MetricCardComponent>;
  let component: MetricCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', '1,234');
    fixture.componentRef.setInput('label', 'Total Users');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render value text', () => {
    const valueEl = fixture.nativeElement.querySelector('.metric-card__value');
    expect(valueEl.textContent.trim()).toBe('1,234');
  });

  it('should render label text', () => {
    const labelEl = fixture.nativeElement.querySelector('.metric-card__label');
    expect(labelEl.textContent.trim()).toBe('Total Users');
  });

  it('should have the metric-card container', () => {
    const card = fixture.nativeElement.querySelector('.metric-card');
    expect(card).toBeTruthy();
  });
});
