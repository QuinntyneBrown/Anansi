import { Component, inject, signal } from '@angular/core';
import {
  CommunityEventsService,
  EventCategory,
  EventRecurrence,
} from 'api';
import {
  ButtonComponent,
  InputGroupComponent,
  TextareaGroupComponent,
  SidebarItemComponent,
  BadgeComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-event-submission-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputGroupComponent,
    TextareaGroupComponent,
    SidebarItemComponent,
    BadgeComponent,
  ],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <lib-sidebar-item label="Dashboard" icon="layout-dashboard" [active]="false" />
          <lib-sidebar-item label="Events Calendar" icon="calendar" [active]="false" />
          <lib-sidebar-item label="Submit Event" icon="calendar-plus" [active]="true" />
          <lib-sidebar-item label="My Bookings" icon="camera" [active]="false" />
        </nav>
      </aside>

      <main class="main">
        <header class="page-header">
          <h1 class="page-title">Submit Community Event</h1>
          <div class="header-actions">
            <lib-button variant="outline" (clicked)="onSaveDraft()">Save Draft</lib-button>
            <lib-button variant="primary" (clicked)="onSubmit()">Submit</lib-button>
          </div>
        </header>

        <div class="body">
          <div class="form-column">
            <lib-input-group
              label="Event Name"
              type="text"
              placeholder="Enter event name"
              [(ngModel)]="form.name"
              name="eventName"
            />

            <lib-textarea-group
              label="Description"
              placeholder="Describe the event..."
              [(ngModel)]="form.description"
              name="eventDescription"
            />

            <div class="datetime-row">
              <lib-input-group
                label="Start Date"
                type="date"
                placeholder="YYYY-MM-DD"
                [(ngModel)]="form.startDate"
                name="startDate"
              />
              <lib-input-group
                label="Start Time"
                type="time"
                placeholder="HH:MM"
                [(ngModel)]="form.startTime"
                name="startTime"
              />
              <lib-input-group
                label="End Date"
                type="date"
                placeholder="YYYY-MM-DD"
                [(ngModel)]="form.endDate"
                name="endDate"
              />
              <lib-input-group
                label="End Time"
                type="time"
                placeholder="HH:MM"
                [(ngModel)]="form.endTime"
                name="endTime"
              />
            </div>

            <lib-input-group
              label="Location"
              type="text"
              placeholder="Enter venue or address"
              [(ngModel)]="form.location"
              name="location"
            />

            <div class="field-group">
              <label class="field-label">Neighborhood</label>
              <select class="select-input" [(ngModel)]="form.neighborhood" name="neighborhood">
                <option value="">Select neighborhood...</option>
                @for (n of neighborhoods; track n) {
                  <option [value]="n">{{ n }}</option>
                }
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Category</label>
              <select class="select-input" [(ngModel)]="form.category" name="category">
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Recurrence</label>
              <select class="select-input" [(ngModel)]="form.recurrence" name="recurrence">
                @for (r of recurrences; track r.value) {
                  <option [value]="r.value">{{ r.label }}</option>
                }
              </select>
            </div>
          </div>

          <div class="widget-column">
            <div class="preview-section">
              <h3 class="widget-heading">Preview Card</h3>
              <div class="preview-card">
                <h4 class="preview-name">{{ form.name || 'Event Name' }}</h4>
                <p class="preview-date">
                  {{ form.startDate || 'Start Date' }} {{ form.startTime || '' }}
                </p>
                <p class="preview-location">{{ form.location || 'Location' }}</p>
                @if (form.category) {
                  <lib-badge variant="neutral">{{ form.category }}</lib-badge>
                }
              </div>
            </div>

            <div class="preview-section">
              <h3 class="widget-heading">Dashboard Widget</h3>
              <div class="widget-preview">
                <div class="widget-header">
                  <span class="widget-title">Upcoming Events</span>
                </div>
                <div class="widget-item">
                  <div class="widget-dot"></div>
                  <div class="widget-info">
                    <span class="widget-event-name">{{ form.name || 'Event Name' }}</span>
                    <span class="widget-event-date">{{ form.startDate || 'Date' }}</span>
                  </div>
                </div>
                <div class="widget-item widget-item--muted">
                  <div class="widget-dot widget-dot--muted"></div>
                  <div class="widget-info">
                    <span class="widget-event-name">Another Event</span>
                    <span class="widget-event-date">TBD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    :host { display: block; }

    .layout {
      display: flex;
      min-height: 100vh;
      background: #1A1A1C;
    }

    .sidebar {
      width: 240px;
      background: #242426;
      border-right: 1px solid #3A3A3C;
      padding: 24px 0;
      flex-shrink: 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .main {
      flex: 1;
      min-width: 0;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid #3A3A3C;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .body {
      padding: 32px;
      display: flex;
      gap: 32px;
    }

    .form-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .datetime-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .select-input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid #3A3A3C;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .select-input:focus {
      border-color: #C9A962;
    }

    /* Widget Column */

    .widget-column {
      width: 360px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .preview-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .widget-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .preview-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .preview-date {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #C9A962;
      margin: 0;
    }

    .preview-location {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    /* Widget Preview */

    .widget-preview {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      overflow: hidden;
    }

    .widget-header {
      padding: 14px 16px;
      border-bottom: 1px solid #3A3A3C;
    }

    .widget-title {
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .widget-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #2A2A2C;
    }

    .widget-item:last-child {
      border-bottom: none;
    }

    .widget-item--muted {
      opacity: 0.4;
    }

    .widget-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #C9A962;
      flex-shrink: 0;
    }

    .widget-dot--muted {
      background: #6E6E70;
    }

    .widget-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .widget-event-name {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
    }

    .widget-event-date {
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #6E6E70;
    }
  `,
})
export class EventSubmissionPageComponent {
  private readonly eventsService = inject(CommunityEventsService);

  readonly saving = signal(false);

  form = {
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    neighborhood: '',
    category: EventCategory.Community as EventCategory,
    recurrence: EventRecurrence.OneTime as EventRecurrence,
  };

  readonly neighborhoods = [
    'Scarborough',
    'North York',
    'Etobicoke',
    'Downtown Toronto',
    'Brampton',
    'Mississauga',
    'Markham',
    'Ajax',
    'Pickering',
    'Oshawa',
  ];

  readonly categories = [
    { label: 'Festival', value: EventCategory.Festival },
    { label: 'Cultural', value: EventCategory.Cultural },
    { label: 'Community', value: EventCategory.Community },
    { label: 'Religious', value: EventCategory.Religious },
    { label: 'Market', value: EventCategory.Market },
  ];

  readonly recurrences = [
    { label: 'One-time', value: EventRecurrence.OneTime },
    { label: 'Weekly', value: EventRecurrence.Weekly },
    { label: 'Monthly', value: EventRecurrence.Monthly },
    { label: 'Annual', value: EventRecurrence.Annual },
  ];

  onSubmit(): void {
    this.saving.set(true);
    this.eventsService.create({
      name: this.form.name,
      description: this.form.description || undefined,
      startDate: this.form.startDate,
      startTime: this.form.startTime,
      endDate: this.form.endDate,
      endTime: this.form.endTime,
      location: this.form.location,
      neighborhood: this.form.neighborhood,
      category: this.form.category,
      recurrence: this.form.recurrence,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        // Navigate to calendar or show success
      },
      error: () => this.saving.set(false),
    });
  }

  onSaveDraft(): void {
    // Save as draft locally or via API
  }
}
