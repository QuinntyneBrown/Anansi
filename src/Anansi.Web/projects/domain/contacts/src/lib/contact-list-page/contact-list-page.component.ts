import { Component, inject, signal, computed, output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ContactsService, ContactDto, ContactType, PagedList } from 'api';
import {
  TopBarComponent,
  ButtonComponent,
  TabBarComponent,
  TabItem,
  BadgeComponent,
  AvatarComponent,
  SpinnerComponent,
  TableHeaderRowComponent,
  TableDataRowComponent,
} from 'components';

@Component({
  selector: 'lib-contact-list-page',
  standalone: true,
  imports: [
    TopBarComponent,
    ButtonComponent,
    TabBarComponent,
    BadgeComponent,
    AvatarComponent,
    SpinnerComponent,
    TableHeaderRowComponent,
    TableDataRowComponent,
  ],
  template: `
    <div class="page">
      <lib-top-bar>
        <div topbar-left class="header-left">
          <h1 class="page-title">Contacts</h1>
          <input
            class="search-input"
            type="text"
            placeholder="Search contacts..."
            [value]="searchQuery()"
            (input)="onSearch($event)"
          />
        </div>
        <div topbar-right>
          <lib-button variant="primary" (clicked)="onAddContact()">+ Add Contact</lib-button>
        </div>
      </lib-top-bar>

      <div class="tab-section">
        <lib-tab-bar [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)" />
      </div>

      @if (loading()) {
        <div class="loading-container">
          <lib-spinner [size]="32" />
        </div>
      } @else {
        <div class="table-container">
          <lib-table-header-row>
            <span class="col-name">Name</span>
            <span class="col-email">Email</span>
            <span class="col-phone">Phone</span>
            <span class="col-type">Type</span>
            <span class="col-activity">Last Activity</span>
          </lib-table-header-row>

          @for (contact of contacts(); track contact.id) {
            <lib-table-data-row
              class="clickable-row"
              (click)="onContactClick(contact)"
              (keydown.enter)="onContactClick(contact)"
              tabindex="0"
            >
              <span class="col-name name-cell">
                <lib-avatar [initials]="getInitials(contact)" [size]="32" />
                <span>{{ contact.firstName }} {{ contact.lastName }}</span>
              </span>
              <span class="col-email">{{ contact.email }}</span>
              <span class="col-phone">{{ contact.phone || '—' }}</span>
              <span class="col-type">
                <lib-badge [variant]="getBadgeVariant(contact.contactType)">{{ contact.contactType }}</lib-badge>
              </span>
              <span class="col-activity">{{ formatDate(contact.updatedAt) }}</span>
            </lib-table-data-row>
          }

          @if (contacts().length === 0) {
            <div class="empty-state">No contacts found.</div>
          }
        </div>

        <div class="pagination">
          <span class="pagination-info">Showing {{ contacts().length }} of {{ totalCount() }}</span>
          <div class="pagination-buttons">
            <button class="page-btn" [disabled]="currentPage() <= 1" (click)="onPreviousPage()">Previous</button>
            <button class="page-btn" [disabled]="currentPage() >= totalPages()" (click)="onNextPage()">Next</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .search-input {
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      width: 240px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .search-input::placeholder {
      color: #6E6E70;
    }

    .search-input:focus {
      border-color: #C9A962;
    }

    .tab-section {
      padding: 0 24px;
      border-bottom: 1px solid #2A2A2C;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .table-container {
      margin: 0 24px;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
      margin-top: 24px;
    }

    .col-name { flex: 2; }
    .col-email { flex: 2; }
    .col-phone { flex: 1.5; }
    .col-type { flex: 1; }
    .col-activity { flex: 1.5; }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .clickable-row {
      cursor: pointer;
    }

    .clickable-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #6E6E70;
      font-family: Inter, sans-serif;
      font-size: 14px;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }

    .pagination-info {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .pagination-buttons {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: #2A2A2C;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class ContactListPageComponent implements OnInit, OnDestroy {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription: { unsubscribe(): void } | null = null;

  readonly contacts = signal<ContactDto[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal('All');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);

  readonly contactSelected = output<ContactDto>();
  readonly addContact = output<void>();

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'All' },
    { label: 'Clients', value: ContactType.Client },
    { label: 'Leads', value: ContactType.Lead },
    { label: 'Other', value: ContactType.Other },
  ];

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage.set(1);
        this.load();
      });
    this.load();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  load(): void {
    this.loading.set(true);
    const tab = this.activeTab();
    const type = tab === 'All' ? undefined : (tab as ContactType);
    const search = this.searchQuery() || undefined;
    this.contactsService.list({ type, search, page: this.currentPage(), pageSize: 10 }).subscribe({
      next: (result: PagedList<ContactDto>) => {
        this.contacts.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.load();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.load();
    }
  }

  onNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.load();
    }
  }

  onContactClick(contact: ContactDto): void {
    this.contactSelected.emit(contact);
    this.router.navigate(['/contacts', contact.id]);
  }

  onAddContact(): void {
    this.addContact.emit();
    this.router.navigate(['/contacts/new']);
  }

  getInitials(contact: ContactDto): string {
    return (
      (contact.firstName?.[0] ?? '') + (contact.lastName?.[0] ?? '')
    ).toUpperCase();
  }

  getBadgeVariant(type: ContactType): 'success' | 'warning' | 'neutral' {
    switch (type) {
      case ContactType.Client: return 'success';
      case ContactType.Lead: return 'warning';
      default: return 'neutral';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
