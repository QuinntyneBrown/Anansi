import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  EmailService,
  EmailConversationDto,
  SendEmailCommand,
} from 'api';
import {
  ButtonComponent,
  SpinnerComponent,
  EmptyStateComponent,
  AvatarComponent,
  TextareaGroupComponent,
} from 'components';

@Component({
  selector: 'lib-inbox-page',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    ButtonComponent,
    SpinnerComponent,
    EmptyStateComponent,
    AvatarComponent,
    TextareaGroupComponent,
  ],
  template: `
    <div class="inbox">
      <div class="inbox__sidebar">
        <div class="inbox__sidebar-header">
          <h2 class="inbox__title">Inbox</h2>
        </div>

        @if (loading()) {
          <div class="inbox__loading">
            <lib-spinner />
          </div>
        } @else if (conversations().length === 0) {
          <lib-empty-state
            heading="No conversations"
            description="Your inbox is empty."
          />
        } @else {
          <div class="inbox__conversation-list">
            @for (conv of conversations(); track conv.id) {
              <button
                class="inbox__conversation-item"
                [class.inbox__conversation-item--active]="selectedConversation()?.id === conv.id"
                (click)="selectConversation(conv)"
              >
                <div class="inbox__conversation-row">
                  @if (!conv.isRead) {
                    <span class="inbox__unread-dot"></span>
                  }
                  @if (conv.isRead) {
                    <span class="inbox__unread-dot-placeholder"></span>
                  }
                  <lib-avatar
                    [initials]="getInitials(conv.clientName, conv.clientEmail)"
                    [size]="36"
                  />
                  <div class="inbox__conversation-info">
                    <div class="inbox__conversation-top">
                      <span
                        class="inbox__conversation-name"
                        [class.inbox__conversation-name--unread]="!conv.isRead"
                      >
                        {{ conv.clientName || conv.clientEmail || 'Unknown' }}
                      </span>
                      @if (conv.lastMessageAt) {
                        <span class="inbox__conversation-time">
                          {{ conv.lastMessageAt | date:'shortDate' }}
                        </span>
                      }
                    </div>
                    <span class="inbox__conversation-subject">{{ conv.subject }}</span>
                  </div>
                </div>
              </button>
            }
          </div>
        }
      </div>

      <div class="inbox__main">
        @if (selectedConversation(); as conv) {
          <div class="inbox__thread-header">
            <h3 class="inbox__thread-subject">{{ conv.subject }}</h3>
            <span class="inbox__thread-client">{{ conv.clientName || conv.clientEmail }}</span>
          </div>

          <div class="inbox__messages">
            @for (msg of conv.messages; track msg.id) {
              <div
                class="inbox__message"
                [class.inbox__message--photographer]="msg.isFromPhotographer"
                [class.inbox__message--client]="!msg.isFromPhotographer"
              >
                <div class="inbox__message-header">
                  <span class="inbox__message-sender">
                    {{ msg.senderName || msg.senderEmail }}
                  </span>
                  <span class="inbox__message-time">
                    {{ msg.sentAt | date:'short' }}
                  </span>
                </div>
                <div class="inbox__message-body">{{ msg.body }}</div>
                @if (msg.attachments.length > 0) {
                  <div class="inbox__message-attachments">
                    <span class="inbox__attachments-label">
                      {{ msg.attachments.length }} attachment{{ msg.attachments.length > 1 ? 's' : '' }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>

          <div class="inbox__compose">
            <lib-textarea-group
              placeholder="Type your reply..."
              [(ngModel)]="replyBody"
            />
            <div class="inbox__compose-actions">
              <lib-button
                variant="primary"
                (clicked)="sendReply()"
                [disabled]="sending() || !replyBody.trim()"
              >
                {{ sending() ? 'Sending...' : 'Send' }}
              </lib-button>
            </div>
          </div>
        } @else {
          <div class="inbox__no-selection">
            <lib-empty-state
              heading="Select a conversation"
              description="Choose a conversation from the list to view messages."
            />
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .inbox {
      display: flex;
      height: 100%;
      background: #1A1A1C;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #3A3A3C;
    }

    .inbox__sidebar {
      width: 360px;
      min-width: 360px;
      border-right: 1px solid #3A3A3C;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .inbox__sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #3A3A3C;
    }

    .inbox__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .inbox__loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .inbox__conversation-list {
      flex: 1;
      overflow-y: auto;
    }

    .inbox__conversation-item {
      display: block;
      width: 100%;
      padding: 14px 20px;
      background: none;
      border: none;
      border-bottom: 1px solid #2A2A2C;
      cursor: pointer;
      text-align: left;
    }

    .inbox__conversation-item:hover {
      background: #2A2A2C;
    }

    .inbox__conversation-item--active {
      background: #2A2A2C;
    }

    .inbox__conversation-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .inbox__unread-dot {
      width: 8px;
      height: 8px;
      min-width: 8px;
      border-radius: 50%;
      background: #C9A962;
      margin-top: 14px;
    }

    .inbox__unread-dot-placeholder {
      width: 8px;
      min-width: 8px;
    }

    .inbox__conversation-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .inbox__conversation-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .inbox__conversation-name {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #F5F5F0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .inbox__conversation-name--unread {
      font-weight: 600;
    }

    .inbox__conversation-time {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      white-space: nowrap;
    }

    .inbox__conversation-subject {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .inbox__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .inbox__thread-header {
      padding: 20px;
      border-bottom: 1px solid #3A3A3C;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .inbox__thread-subject {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .inbox__thread-client {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .inbox__messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .inbox__message {
      padding: 16px;
      border-radius: 12px;
      max-width: 80%;
    }

    .inbox__message--photographer {
      background: #242426;
      align-self: flex-end;
      border: 1px solid #3A3A3C;
    }

    .inbox__message--client {
      background: #2A2A2C;
      align-self: flex-start;
    }

    .inbox__message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .inbox__message-sender {
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .inbox__message-time {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      white-space: nowrap;
    }

    .inbox__message-body {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .inbox__message-attachments {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #3A3A3C;
    }

    .inbox__attachments-label {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #C9A962;
    }

    .inbox__compose {
      padding: 16px 20px;
      border-top: 1px solid #3A3A3C;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .inbox__compose-actions {
      display: flex;
      justify-content: flex-end;
    }

    .inbox__no-selection {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class InboxPageComponent implements OnInit {
  private readonly emailService = inject(EmailService);

  readonly conversations = signal<EmailConversationDto[]>([]);
  readonly selectedConversation = signal<EmailConversationDto | null>(null);
  readonly loading = signal(true);
  readonly sending = signal(false);
  replyBody = '';

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading.set(true);
    this.emailService.listConversations().subscribe({
      next: (result) => {
        this.conversations.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectConversation(conversation: EmailConversationDto): void {
    this.selectedConversation.set(conversation);
    this.replyBody = '';
  }

  sendReply(): void {
    const conv = this.selectedConversation();
    if (!conv || !this.replyBody.trim()) {
      return;
    }

    const command: SendEmailCommand = {
      contactId: conv.contactId,
      recipientEmail: conv.clientEmail ?? '',
      subject: conv.subject,
      body: this.replyBody.trim(),
    };

    this.sending.set(true);
    this.emailService.send(command).subscribe({
      next: (updated) => {
        this.selectedConversation.set(updated);
        this.conversations.update((convs) =>
          convs.map((c) => (c.id === updated.id ? updated : c)),
        );
        this.replyBody = '';
        this.sending.set(false);
      },
      error: () => this.sending.set(false),
    });
  }

  getInitials(name?: string, email?: string): string {
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return (parts[0]?.[0] ?? '?').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  }
}
