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

interface LinkedDocument {
  name: string;
  type: 'Contract' | 'Invoice' | 'Questionnaire';
  status: string;
  date: string;
}

interface SentEmail {
  subject: string;
  date: string;
  status: 'Sent' | 'Opened';
}

interface BookedSession {
  sessionType: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

interface SharedGallery {
  name: string;
  photosCount: number;
  sharedDate: string;
  status: 'Active' | 'Expired' | 'Draft';
}

interface PaymentRecord {
  invoiceNumber: string;
  amountCents: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

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
                  @if (documents().length === 0) {
                    <div class="placeholder">No documents linked to this contact yet.</div>
                  } @else {
                    <div class="data-table">
                      <div class="table-header">
                        <span class="col-name">Document Name</span>
                        <span class="col-type">Type</span>
                        <span class="col-status">Status</span>
                        <span class="col-date">Date</span>
                      </div>
                      @for (doc of documents(); track doc.name) {
                        <div class="table-row">
                          <span class="col-name cell-text">{{ doc.name }}</span>
                          <span class="col-type">
                            <lib-badge variant="neutral">{{ doc.type }}</lib-badge>
                          </span>
                          <span class="col-status">
                            <lib-badge [variant]="getDocStatusVariant(doc.status)">{{ doc.status }}</lib-badge>
                          </span>
                          <span class="col-date cell-muted">{{ doc.date }}</span>
                        </div>
                      }
                    </div>
                  }
                }
                @case ('emails') {
                  @if (emails().length === 0) {
                    <div class="placeholder">No emails sent to this contact yet.</div>
                  } @else {
                    <div class="data-table">
                      <div class="table-header">
                        <span class="col-subject">Subject</span>
                        <span class="col-date">Date</span>
                        <span class="col-status">Status</span>
                      </div>
                      @for (email of emails(); track email.subject) {
                        <div class="table-row">
                          <span class="col-subject cell-text">{{ email.subject }}</span>
                          <span class="col-date cell-muted">{{ email.date }}</span>
                          <span class="col-status">
                            <lib-badge [variant]="email.status === 'Opened' ? 'success' : 'neutral'">{{ email.status }}</lib-badge>
                          </span>
                        </div>
                      }
                    </div>
                  }
                }
                @case ('sessions') {
                  @if (sessions().length === 0) {
                    <div class="placeholder">No sessions booked with this contact yet.</div>
                  } @else {
                    <div class="data-table">
                      <div class="table-header">
                        <span class="col-session-type">Session Type</span>
                        <span class="col-date">Date</span>
                        <span class="col-time">Time</span>
                        <span class="col-status">Status</span>
                      </div>
                      @for (session of sessions(); track session.sessionType + session.date) {
                        <div class="table-row">
                          <span class="col-session-type cell-text">{{ session.sessionType }}</span>
                          <span class="col-date cell-muted">{{ session.date }}</span>
                          <span class="col-time cell-muted">{{ session.time }}</span>
                          <span class="col-status">
                            <lib-badge [variant]="getSessionStatusVariant(session.status)">{{ session.status }}</lib-badge>
                          </span>
                        </div>
                      }
                    </div>
                  }
                }
                @case ('galleries') {
                  @if (galleries().length === 0) {
                    <div class="placeholder">No galleries shared with this contact yet.</div>
                  } @else {
                    <div class="data-table">
                      <div class="table-header">
                        <span class="col-name">Gallery Name</span>
                        <span class="col-count">Photos</span>
                        <span class="col-date">Shared Date</span>
                        <span class="col-status">Status</span>
                      </div>
                      @for (gallery of galleries(); track gallery.name) {
                        <div class="table-row">
                          <span class="col-name cell-text">{{ gallery.name }}</span>
                          <span class="col-count cell-muted">{{ gallery.photosCount }}</span>
                          <span class="col-date cell-muted">{{ gallery.sharedDate }}</span>
                          <span class="col-status">
                            <lib-badge [variant]="getGalleryStatusVariant(gallery.status)">{{ gallery.status }}</lib-badge>
                          </span>
                        </div>
                      }
                    </div>
                  }
                }
                @case ('payments') {
                  @if (payments().length === 0) {
                    <div class="placeholder">No payments received from this contact yet.</div>
                  } @else {
                    <div class="data-table">
                      <div class="table-header">
                        <span class="col-invoice">Invoice #</span>
                        <span class="col-amount">Amount</span>
                        <span class="col-date">Date</span>
                        <span class="col-status">Status</span>
                      </div>
                      @for (payment of payments(); track payment.invoiceNumber) {
                        <div class="table-row">
                          <span class="col-invoice cell-text">{{ payment.invoiceNumber }}</span>
                          <span class="col-amount cell-text">{{ formatCurrency(payment.amountCents) }}</span>
                          <span class="col-date cell-muted">{{ payment.date }}</span>
                          <span class="col-status">
                            <lib-badge [variant]="getPaymentStatusVariant(payment.status)">{{ payment.status }}</lib-badge>
                          </span>
                        </div>
                      }
                      <div class="table-footer">
                        <span class="footer-label">Total</span>
                        <span class="footer-value">{{ formatCurrency(paymentsTotal()) }}</span>
                      </div>
                    </div>
                  }
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

    .data-table {
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      overflow: hidden;
    }

    .table-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #242426;
      border-bottom: 1px solid #3A3A3C;
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-row {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #2A2A2C;
      transition: background 0.15s ease;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background: #242426;
    }

    .cell-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }

    .cell-muted {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .col-name { flex: 3; }
    .col-type { flex: 2; }
    .col-status { flex: 2; }
    .col-date { flex: 2; }
    .col-subject { flex: 4; }
    .col-session-type { flex: 3; }
    .col-time { flex: 2; }
    .col-count { flex: 1; text-align: center; }
    .col-invoice { flex: 2; }
    .col-amount { flex: 2; text-align: right; }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: #242426;
      border-top: 1px solid #3A3A3C;
    }

    .footer-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .footer-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #C9A962;
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

  readonly documents = signal<LinkedDocument[]>([
    { name: 'Wedding Photography Contract', type: 'Contract', status: 'Signed', date: 'Mar 15, 2026' },
    { name: 'INV-2026-0042', type: 'Invoice', status: 'Paid', date: 'Mar 10, 2026' },
    { name: 'Pre-Session Questionnaire', type: 'Questionnaire', status: 'Completed', date: 'Mar 8, 2026' },
  ]);

  readonly emails = signal<SentEmail[]>([
    { subject: 'Your gallery is ready!', date: 'Mar 22, 2026', status: 'Opened' },
    { subject: 'Session confirmation - Mar 20', date: 'Mar 15, 2026', status: 'Opened' },
    { subject: 'Welcome to the studio', date: 'Mar 8, 2026', status: 'Sent' },
  ]);

  readonly sessions = signal<BookedSession[]>([
    { sessionType: 'Engagement Session', date: 'Apr 12, 2026', time: '10:00 AM - 11:30 AM', status: 'Upcoming' },
    { sessionType: 'Wedding Photography', date: 'Mar 20, 2026', time: '2:00 PM - 6:00 PM', status: 'Completed' },
    { sessionType: 'Consultation Call', date: 'Mar 5, 2026', time: '9:00 AM - 9:30 AM', status: 'Completed' },
  ]);

  readonly galleries = signal<SharedGallery[]>([
    { name: 'Wedding Day Highlights', photosCount: 245, sharedDate: 'Mar 22, 2026', status: 'Active' },
    { name: 'Engagement Photos', photosCount: 82, sharedDate: 'Mar 1, 2026', status: 'Active' },
  ]);

  readonly payments = signal<PaymentRecord[]>([
    { invoiceNumber: 'INV-2026-0042', amountCents: 250000, date: 'Mar 10, 2026', status: 'Paid' },
    { invoiceNumber: 'INV-2026-0041', amountCents: 75000, date: 'Mar 5, 2026', status: 'Paid' },
    { invoiceNumber: 'INV-2026-0050', amountCents: 125000, date: 'Apr 1, 2026', status: 'Pending' },
  ]);

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

  getDocStatusVariant(status: string): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case 'Signed':
      case 'Completed':
      case 'Paid':
        return 'success';
      case 'Pending':
      case 'Sent':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getSessionStatusVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case 'Completed': return 'success';
      case 'Upcoming': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'neutral';
    }
  }

  getGalleryStatusVariant(status: string): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'warning';
      default: return 'neutral';
    }
  }

  getPaymentStatusVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      default: return 'neutral';
    }
  }

  paymentsTotal(): number {
    return this.payments().reduce((sum, p) => sum + p.amountCents, 0);
  }

  formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return '$' + dollars.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
