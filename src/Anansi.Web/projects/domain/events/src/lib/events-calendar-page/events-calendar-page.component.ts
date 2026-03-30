import { Component, inject, signal, computed, OnInit } from '@angular/core';
import {
  CommunityEventsService,
  CommunityEventDto,
  PagedList,
} from 'api';
import {
  ButtonComponent,
  SidebarItemComponent,
  BadgeComponent,
} from 'components';

@Component({
  selector: 'lib-events-calendar-page',
  standalone: true,
  imports: [ButtonComponent, SidebarItemComponent, BadgeComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <lib-sidebar-item label="Dashboard" icon="layout-dashboard" [active]="false" />
          <lib-sidebar-item label="Events Calendar" icon="calendar" [active]="true" />
          <lib-sidebar-item label="Submit Event" icon="calendar-plus" [active]="false" />
          <lib-sidebar-item label="My Bookings" icon="camera" [active]="false" />
        </nav>
      </aside>

      <main class="main">
        <header class="page-header">
          <h1 class="page-title">Toronto Black Events</h1>
          <div class="header-actions">
            <div class="view-toggle">
              <button
                class="toggle-btn"
                [class.toggle-btn--active]="viewMode() === 'month'"
                (click)="viewMode.set('month')"
              >
                Month
              </button>
              <button
                class="toggle-btn"
                [class.toggle-btn--active]="viewMode() === 'list'"
                (click)="viewMode.set('list')"
              >
                List
              </button>
            </div>
            <lib-button variant="primary" (clicked)="onSubmitEvent()">Submit Event</lib-button>
          </div>
        </header>

        <div class="body">
          <div class="calendar-area">
            <div class="calendar-nav">
              <button class="nav-btn" (click)="onPrevMonth()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="#F5F5F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <h2 class="calendar-month">{{ monthLabel() }}</h2>
              <button class="nav-btn" (click)="onNextMonth()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="#F5F5F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>

            <div class="calendar-grid">
              <div class="cal-header">
                @for (day of weekDays; track day) {
                  <div class="cal-day-label">{{ day }}</div>
                }
              </div>
              <div class="cal-body">
                @for (cell of calendarCells(); track $index) {
                  <div
                    class="cal-cell"
                    [class.cal-cell--other]="!cell.isCurrentMonth"
                    [class.cal-cell--today]="cell.isToday"
                  >
                    <span class="cal-date">{{ cell.day }}</span>
                    @if (cell.eventCount > 0) {
                      <div class="event-dots">
                        @for (dot of getDots(cell.eventCount); track $index) {
                          <span class="event-dot"></span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="event-sidebar">
            <h3 class="sidebar-heading">Upcoming Events</h3>
            <div class="event-list">
              @for (event of upcomingEvents(); track event.id) {
                <div class="event-card">
                  <h4 class="event-name">{{ event.name }}</h4>
                  <p class="event-date">{{ formatEventDate(event.startDate) }}</p>
                  <p class="event-location">{{ event.location }}</p>
                  <lib-badge [variant]="getCategoryVariant(event.category)">{{ event.category }}</lib-badge>
                  <lib-button variant="outline" (clicked)="onSyncToCalendar(event)">Sync to Calendar</lib-button>
                </div>
              }
              @if (upcomingEvents().length === 0) {
                <p class="no-events">No upcoming events this month.</p>
              }
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
      align-items: center;
    }

    .view-toggle {
      display: flex;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #3A3A3C;
    }

    .toggle-btn {
      padding: 8px 16px;
      border: none;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .toggle-btn--active {
      background: #C9A962;
      color: #1A1A1C;
    }

    .body {
      padding: 32px;
      display: flex;
      gap: 24px;
    }

    .calendar-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .calendar-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-btn {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: border-color 0.15s ease;
    }

    .nav-btn:hover {
      border-color: #C9A962;
    }

    .calendar-month {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .calendar-grid {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
    }

    .cal-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-bottom: 1px solid #3A3A3C;
    }

    .cal-day-label {
      text-align: center;
      padding: 12px 0;
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cal-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .cal-cell {
      aspect-ratio: 1;
      padding: 8px;
      border: 1px solid #2A2A2C;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .cal-cell--other {
      opacity: 0.3;
    }

    .cal-cell--today .cal-date {
      background: #C9A962;
      color: #1A1A1C;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cal-date {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
    }

    .event-dots {
      display: flex;
      gap: 3px;
    }

    .event-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #C9A962;
    }

    .event-sidebar {
      width: 380px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .event-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-card {
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: border-color 0.15s ease;
    }

    .event-card:hover {
      border-color: #C9A962;
    }

    .event-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .event-date {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #C9A962;
      margin: 0;
    }

    .event-location {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    .no-events {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      text-align: center;
      padding: 32px 0;
    }
  `,
})
export class EventsCalendarPageComponent implements OnInit {
  private readonly eventsService = inject(CommunityEventsService);

  readonly upcomingEvents = signal<CommunityEventDto[]>([]);
  readonly viewMode = signal<'month' | 'list'>('month');
  readonly currentYear = signal(new Date().getFullYear());
  readonly currentMonth = signal(new Date().getMonth());

  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly monthLabel = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth(), 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  readonly calendarCells = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();

    const cells: { day: number; isCurrentMonth: boolean; isToday: boolean; eventCount: number }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        eventCount: 0,
      });
    }

    // Current month
    const eventDates = this.getEventDates();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      cells.push({
        day: d,
        isCurrentMonth: true,
        isToday,
        eventCount: eventDates.get(d) ?? 0,
      });
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        isToday: false,
        eventCount: 0,
      });
    }

    return cells;
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventsService.list({
      month: this.currentMonth() + 1,
      year: this.currentYear(),
      page: 1,
      pageSize: 50,
    }).subscribe({
      next: (result: PagedList<CommunityEventDto>) => {
        this.upcomingEvents.set(result.items);
      },
      error: () => this.upcomingEvents.set([]),
    });
  }

  onPrevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.loadEvents();
  }

  onNextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.loadEvents();
  }

  onSubmitEvent(): void {
    // Navigate to event submission
  }

  onSyncToCalendar(event: CommunityEventDto): void {
    // Download .ics file or integrate with calendar
  }

  formatEventDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  getCategoryVariant(_category: string): 'success' | 'warning' | 'error' | 'neutral' {
    return 'neutral';
  }

  getDots(count: number): boolean[] {
    return Array.from({ length: Math.min(count, 3) }, () => true);
  }

  private getEventDates(): Map<number, number> {
    const counts = new Map<number, number>();
    for (const event of this.upcomingEvents()) {
      const day = new Date(event.startDate).getDate();
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return counts;
  }
}
