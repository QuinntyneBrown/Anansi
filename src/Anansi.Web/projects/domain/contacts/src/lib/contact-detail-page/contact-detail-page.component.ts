import { Component, inject, signal, input, OnInit } from '@angular/core';
import { ContactsService, ContactDto, ContactType } from 'api';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  AvatarComponent,
  BadgeComponent,
  CardComponent,
  TabBarComponent,
  TabItem,
  SpinnerComponent,
} from 'components';

@Component({
  selector: 'lib-contact-detail-page',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    AvatarComponent,
    BadgeComponent,
    CardComponent,
    TabBarComponent,
    SpinnerComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="32" />
      </div>
    } @else if (error()) {
      <div class="error-container">
        <p class="error-text">Failed to load contact. Please try again.</p>
      </div>
    } @else if (contact(); as c) {
      <div class="page">
        <div class="breadcrumb-bar">
          <lib-breadcrumb [items]="getBreadcrumbs(c)" />
        </div>

        <div class="profile-section">
          <lib-avatar [initials]="getInitials(c)" [size]="64" />
          <div class="profile-info">
            <h1 class="contact-name">{{ c.firstName }} {{ c.lastName }}</h1>
            <div class="contact-meta">
              <span class="meta-item">{{ c.email }}</span>
              @if (c.phone) {
                <span class="meta-separator">|</span>
                <span class="meta-item">{{ c.phone }}</span>
              }
            </div>
          </div>
        </div>

        <div class="content-layout">
          <div class="main-content">
            <div class="tab-section">
              <lib-tab-bar [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)" />
            </div>
            <div class="tab-content">
              @switch (activeTab()) {
                @case ('documents') {
                  <div class="placeholder">No documents linked to this contact yet.</div>
                }
                @case ('emails') {
                  <div class="placeholder">No emails sent to this contact yet.</div>
                }
                @case ('sessions') {
                  <div class="placeholder">No sessions booked with this contact yet.</div>
                }
                @case ('galleries') {
                  <div class="placeholder">No galleries shared with this contact yet.</div>
                }
                @case ('payments') {
                  <div class="placeholder">No payments received from this contact yet.</div>
                }
              }
            </div>
          </div>

          <div class="sidebar">
            <lib-card>
              <div card-header class="card-title">Quick Info</div>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">Type</span>
                  <lib-badge [variant]="getBadgeVariant(c.contactType)">{{ c.contactType }}</lib-badge>
                </div>
                <div class="info-row">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ formatDate(c.createdAt) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Last Activity</span>
                  <span class="info-value">{{ formatDate(c.updatedAt) }}</span>
                </div>
              </div>
            </lib-card>

            <lib-card>
              <div card-header class="card-title">Linked Projects</div>
              <div class="placeholder">No linked projects.</div>
            </lib-card>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 24px;
    }

    .loading-container,
    .error-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .error-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #C94A4A;
    }

    .breadcrumb-bar {
      margin-bottom: 24px;
    }

    .profile-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .contact-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .contact-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .meta-separator {
      color: #3A3A3C;
    }

    .content-layout {
      display: flex;
      gap: 24px;
    }

    .main-content {
      flex: 2;
    }

    .sidebar {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tab-section {
      border-bottom: 1px solid #2A2A2C;
      margin-bottom: 24px;
    }

    .tab-content {
      min-height: 200px;
    }

    .card-title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .info-value {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
    }

    .placeholder {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      text-align: center;
      padding: 32px 0;
    }
  `,
})
export class ContactDetailPageComponent implements OnInit {
  private readonly contactsService = inject(ContactsService);

  readonly contactId = input.required<string>();
  readonly contact = signal<ContactDto | null>(null);
  readonly activeTab = signal('documents');
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly tabs: TabItem[] = [
    { label: 'Documents', value: 'documents' },
    { label: 'Emails', value: 'emails' },
    { label: 'Sessions', value: 'sessions' },
    { label: 'Galleries', value: 'galleries' },
    { label: 'Payments', value: 'payments' },
  ];

  ngOnInit(): void {
    this.loadContact();
  }

  loadContact(): void {
    this.loading.set(true);
    this.error.set(false);
    this.contactsService.get(this.contactId()).subscribe({
      next: (contact: ContactDto) => {
        this.contact.set(contact);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  getBreadcrumbs(contact: ContactDto): BreadcrumbItem[] {
    return [
      { label: 'Contacts', href: '/contacts' },
      { label: `${contact.firstName} ${contact.lastName}` },
    ];
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
