import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import {
  TaxService,
  ExpenseDto,
  ExpenseSummaryDto,
  ExpenseCategory,
} from 'api';
import {
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
} from 'components';

function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

const ALL_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.Equipment,
  ExpenseCategory.Travel,
  ExpenseCategory.Software,
  ExpenseCategory.Marketing,
  ExpenseCategory.Insurance,
  ExpenseCategory.Office,
  ExpenseCategory.Education,
  ExpenseCategory.Other,
];

@Component({
  selector: 'lib-expense-tracking-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="page-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar__nav">
          @for (item of navItems; track item.route) {
            <button
              class="sidebar__item"
              [class.sidebar__item--active]="item.active"
              (click)="navigateTo(item.route)"
            >
              <lucide-icon [name]="item.icon" [size]="20"></lucide-icon>
              <span>{{ item.label }}</span>
            </button>
          }
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main">
        <!-- Header -->
        <header class="header">
          <h1 class="header__title">Business Expenses & ITC</h1>
          <div class="header__actions">
            <lib-button variant="outline" icon="download" (clicked)="onExport()">Export</lib-button>
            <lib-button variant="primary" icon="plus" (clicked)="onAddExpense()">Add Expense</lib-button>
          </div>
        </header>

        <!-- Body -->
        <div class="body">
          @if (loading()) {
            <div class="loading-container">
              <lib-spinner [size]="48" />
            </div>
          } @else {
            <!-- Summary Cards -->
            <div class="summary-row">
              <div class="summary-card">
                <span class="summary-card__label">Total Expenses</span>
                <span class="summary-card__value">{{ formatCurrency(summary()?.totalExpensesCents ?? 0) }}</span>
              </div>
              <div class="summary-card">
                <span class="summary-card__label">HST Paid (ITCs)</span>
                <span class="summary-card__value summary-card__value--green">{{ formatCurrency(summary()?.totalHstPaidCents ?? 0) }}</span>
              </div>
              <div class="summary-card">
                <span class="summary-card__label">Net HST Owing</span>
                <span class="summary-card__value summary-card__value--gold">{{ formatCurrency(summary()?.netHstOwingCents ?? 0) }}</span>
              </div>
            </div>

            <!-- Filter Row -->
            <div class="filter-row">
              <div class="category-chips">
                <button
                  class="chip"
                  [class.chip--active]="activeCategory() === null"
                  (click)="onCategoryFilter(null)"
                >All</button>
                @for (cat of categories; track cat) {
                  <button
                    class="chip"
                    [class.chip--active]="activeCategory() === cat"
                    (click)="onCategoryFilter(cat)"
                  >{{ cat }}</button>
                }
              </div>
            </div>

            <!-- Expense Table -->
            <div class="table-card">
              <table class="table">
                <thead>
                  <tr class="table__header-row">
                    <th class="table__th">Date</th>
                    <th class="table__th">Description</th>
                    <th class="table__th">Category</th>
                    <th class="table__th table__th--right">Amount</th>
                    <th class="table__th table__th--right">HST Paid</th>
                    <th class="table__th table__th--right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (expense of filteredExpenses(); track expense.id) {
                    <tr class="table__row">
                      <td class="table__td table__td--muted">{{ formatDate(expense.date) }}</td>
                      <td class="table__td">{{ expense.description }}</td>
                      <td class="table__td">
                        <lib-badge [variant]="categoryVariant(expense.category)">{{ expense.category }}</lib-badge>
                      </td>
                      <td class="table__td table__td--right">{{ formatCurrency(expense.amountCents) }}</td>
                      <td class="table__td table__td--right table__td--green">{{ formatCurrency(expense.hstPaidCents) }}</td>
                      <td class="table__td table__td--right">
                        <button class="action-btn" (click)="onViewExpense(expense)">
                          <lucide-icon name="eye" [size]="16"></lucide-icon>
                        </button>
                        <button class="action-btn action-btn--danger" (click)="onDeleteExpense(expense)">
                          <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                        </button>
                      </td>
                    </tr>
                  }
                  @if (filteredExpenses().length === 0) {
                    <tr>
                      <td class="table__td table__td--empty" colspan="6">No expenses found</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      font-family: Inter, sans-serif;
    }

    .page-layout {
      display: flex;
      height: 100%;
    }

    /* Sidebar */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: #1A1A1C;
      border-right: 1px solid #3A3A3C;
      padding: 24px 0;
    }

    .sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0 12px;
    }

    .sidebar__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border: none;
      background: none;
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      width: 100%;
      text-align: left;
    }

    .sidebar__item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: #F5F5F0;
    }

    .sidebar__item--active {
      background: rgba(201, 169, 98, 0.12);
      color: #C9A962;
    }

    .sidebar__item--active:hover {
      background: rgba(201, 169, 98, 0.16);
      color: #C9A962;
    }

    /* Main */
    .main {
      flex: 1;
      overflow-y: auto;
      min-width: 0;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid #3A3A3C;
    }

    .header__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 400;
      color: #F5F5F0;
      margin: 0;
    }

    .header__actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    /* Body */
    .body {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    /* Summary Cards */
    .summary-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .summary-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .summary-card__label {
      font-size: 12px;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-card__value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 300;
      color: #F5F5F0;
      line-height: 1;
    }

    .summary-card__value--green {
      color: #6E9E6E;
    }

    .summary-card__value--gold {
      color: #C9A962;
    }

    /* Filter Row */
    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #3A3A3C;
      background: none;
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .chip:hover {
      color: #F5F5F0;
      border-color: #6E6E70;
    }

    .chip--active {
      background: rgba(201, 169, 98, 0.12);
      color: #C9A962;
      border-color: rgba(201, 169, 98, 0.4);
    }

    .chip--active:hover {
      background: rgba(201, 169, 98, 0.16);
      color: #C9A962;
    }

    /* Table Card */
    .table-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      overflow: hidden;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table__header-row {
      border-bottom: 1px solid #3A3A3C;
    }

    .table__th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6E6E70;
      text-align: left;
    }

    .table__th--right {
      text-align: right;
    }

    .table__row {
      border-bottom: 1px solid #2A2A2C;
      transition: background 0.1s;
    }

    .table__row:last-child {
      border-bottom: none;
    }

    .table__row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .table__td {
      padding: 14px 16px;
      font-size: 14px;
      color: #F5F5F0;
      vertical-align: middle;
    }

    .table__td--right {
      text-align: right;
    }

    .table__td--muted {
      color: #6E6E70;
      font-size: 13px;
    }

    .table__td--green {
      color: #6E9E6E;
    }

    .table__td--empty {
      text-align: center;
      color: #6E6E70;
      padding: 48px 16px;
      font-size: 14px;
    }

    .action-btn {
      background: none;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      color: #6E6E70;
      padding: 6px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }

    .action-btn:hover {
      color: #F5F5F0;
      border-color: #6E6E70;
    }

    .action-btn--danger:hover {
      color: #C94A4A;
      border-color: #C94A4A;
    }
  `,
})
export class ExpenseTrackingPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly taxService = inject(TaxService);

  readonly expenses = signal<ExpenseDto[]>([]);
  readonly summary = signal<ExpenseSummaryDto | null>(null);
  readonly loading = signal(true);
  readonly activeCategory = signal<ExpenseCategory | null>(null);

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly categories = ALL_CATEGORIES;

  readonly navItems: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard', active: false },
    { label: 'Tax & HST', icon: 'receipt', route: '/tax', active: false },
    { label: 'Expenses', icon: 'wallet', route: '/tax/expenses', active: true },
    { label: 'Settings', icon: 'settings', route: '/settings', active: false },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const emptySummary: ExpenseSummaryDto = {
      totalExpensesCents: 0,
      totalHstPaidCents: 0,
      netHstOwingCents: 0,
    };

    const emptyPage = { items: [], totalCount: 0, page: 1, pageSize: 25, totalPages: 0, hasPrevious: false, hasNext: false };

    forkJoin({
      expenses: this.taxService.listExpenses({ pageSize: 25 }).pipe(catchError(() => of(emptyPage))),
      summary: this.taxService.getExpenseSummary().pipe(catchError(() => of(emptySummary))),
    }).subscribe({
      next: (result) => {
        this.expenses.set(result.expenses.items);
        this.summary.set(result.summary);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  filteredExpenses(): ExpenseDto[] {
    const cat = this.activeCategory();
    if (cat === null) {
      return this.expenses();
    }
    return this.expenses().filter((e) => e.category === cat);
  }

  onCategoryFilter(category: ExpenseCategory | null): void {
    this.activeCategory.set(category);
  }

  categoryVariant(category: ExpenseCategory | string): 'success' | 'warning' | 'error' | 'neutral' {
    switch (category) {
      case 'Equipment':
      case 'Software':
        return 'neutral';
      case 'Travel':
      case 'Marketing':
        return 'warning';
      case 'Insurance':
        return 'success';
      default:
        return 'neutral';
    }
  }

  onAddExpense(): void {
    // Will open expense creation dialog
  }

  onViewExpense(expense: ExpenseDto): void {
    // Will open expense detail dialog
  }

  onDeleteExpense(expense: ExpenseDto): void {
    this.taxService.deleteExpense(expense.id).subscribe(() => {
      this.load();
    });
  }

  onExport(): void {
    this.taxService.exportExpenses().subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
