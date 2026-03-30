import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  CreateExpenseCommand,
  ExpenseDto,
  ExpenseListParams,
  ExpenseSummaryDto,
  TaxDashboardDto,
  TaxProfileDto,
  UpdateTaxProfileCommand,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getDashboard(): Observable<TaxDashboardDto> {
    return this.http.get<TaxDashboardDto>(
      `${this.config.baseUrl}/api/tax/dashboard`,
    );
  }

  getProfile(): Observable<TaxProfileDto> {
    return this.http.get<TaxProfileDto>(
      `${this.config.baseUrl}/api/tax/profile`,
    );
  }

  updateProfile(command: UpdateTaxProfileCommand): Observable<TaxProfileDto> {
    return this.http.put<TaxProfileDto>(
      `${this.config.baseUrl}/api/tax/profile`,
      command,
    );
  }

  listExpenses(params?: ExpenseListParams): Observable<PagedList<ExpenseDto>> {
    let httpParams = new HttpParams();
    if (params?.category != null) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.from != null) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params?.to != null) {
      httpParams = httpParams.set('to', params.to);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<ExpenseDto>>(
      `${this.config.baseUrl}/api/tax/expenses`,
      { params: httpParams },
    );
  }

  createExpense(command: CreateExpenseCommand): Observable<ExpenseDto> {
    return this.http.post<ExpenseDto>(
      `${this.config.baseUrl}/api/tax/expenses`,
      command,
    );
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/tax/expenses/${id}`,
    );
  }

  getExpenseSummary(params?: { from?: string; to?: string }): Observable<ExpenseSummaryDto> {
    let httpParams = new HttpParams();
    if (params?.from != null) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params?.to != null) {
      httpParams = httpParams.set('to', params.to);
    }
    return this.http.get<ExpenseSummaryDto>(
      `${this.config.baseUrl}/api/tax/expenses/summary`,
      { params: httpParams },
    );
  }

  exportExpenses(params?: { from?: string; to?: string }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.from != null) httpParams = httpParams.set('from', params.from);
    if (params?.to != null) httpParams = httpParams.set('to', params.to);
    return this.http.get(`${this.config.baseUrl}/api/tax/expenses/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}
