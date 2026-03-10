# Domain Library Conventions

## Structure
All domain libraries live under projects/domain/{feature}/src/lib/
Each component gets its own subdirectory: {feature}/src/lib/{component-name}/

## Design System
- Background: #1A1A1C | Card: #242426 | Border: #3A3A3C, #2A2A2C
- Text: #F5F5F0 | Muted: #6E6E70 | Gold: #C9A962 | Success: #6E9E6E | Error: #C94A4A | Warning: #C9A962
- Display font: 'Cormorant Garamond', serif | Body: Inter, sans-serif
- Border radius: 20px cards, 12px inputs, 8px buttons

## Components Library (import from 'components')
ButtonComponent (variant: 'primary'|'secondary'|'outline'|'ghost'|'destructive', output: clicked)
BadgeComponent (variant: 'success'|'warning'|'error'|'neutral', label: string)
AvatarComponent (src?: string, initials?: string, size?: number)
MetricCardComponent (value: string, label: string)
CardComponent (slots: [card-header], default, [card-actions])
SpinnerComponent
TableHeaderRowComponent, TableDataRowComponent
InputGroupComponent (label, type, placeholder, errorMessage — ControlValueAccessor)
TextareaGroupComponent (label, placeholder, errorMessage — ControlValueAccessor)
CheckboxComponent (label — ControlValueAccessor)
ToggleComponent (ControlValueAccessor)
ToastComponent (variant: 'success'|'error'|'warning', message)
EmptyStateComponent (heading, description)
ModalContainerComponent (title, isOpen, output: closed)
ConfirmDialogComponent (title, message, confirmLabel, isOpen, outputs: confirmed, cancelled)
TopBarComponent (slots: [top-bar-left], [top-bar-right])
SidebarItemComponent (label, icon, active, output: clicked)
BreadcrumbComponent (items: {label,url?}[], output: navigate)
TabBarComponent (tabs: TabItem[], activeTab, output: tabChange) — TabItem = {label,value}
PillTabBarComponent (tabs: {label,value}[], activeTab, output: tabChange)

## Component Pattern
```typescript
import { Component, inject, signal, computed, input, output, OnInit } from '@angular/core';
import { SomeService, SomeDto, PagedList } from 'api';
import { CardComponent, ButtonComponent } from 'components';

@Component({
  selector: 'lib-my-component',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  template: `...`,
  styles: `...`,
})
export class MyComponent implements OnInit {
  private readonly service = inject(SomeService);
  readonly items = signal<SomeDto[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (r) => { this.items.set(r.items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
```

## Test Pattern
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from 'api';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpTesting.verify(); });
});
```
