import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  API_CONFIG,
  EmailConversationDto,
  EmailMessageDto,
  PagedList,
} from 'api';
import { InboxPageComponent } from './inbox-page.component';

describe('InboxPageComponent', () => {
  let component: InboxPageComponent;
  let fixture: ComponentFixture<InboxPageComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboxPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(InboxPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockMessage = (overrides?: Partial<EmailMessageDto>): EmailMessageDto => ({
    id: 'msg-1',
    isFromPhotographer: false,
    senderEmail: 'client@example.com',
    senderName: 'Jane Doe',
    body: 'Hello, I need my photos.',
    isRead: true,
    sentAt: '2026-01-15T10:00:00Z',
    attachments: [],
    ...overrides,
  });

  const mockConversation = (overrides?: Partial<EmailConversationDto>): EmailConversationDto => ({
    id: 'conv-1',
    subject: 'Wedding Photos',
    clientEmail: 'client@example.com',
    clientName: 'Jane Doe',
    isRead: false,
    lastMessageAt: '2026-01-15T10:00:00Z',
    messages: [mockMessage()],
    createdAt: '2026-01-10T08:00:00Z',
    ...overrides,
  });

  const mockPagedList = (
    items: EmailConversationDto[] = [mockConversation()],
  ): PagedList<EmailConversationDto> => ({
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  function flushConversations(items?: EmailConversationDto[]): void {
    const req = httpTesting.expectOne(`${baseUrl}/api/email/conversations`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedList(items));
  }

  describe('initialization', () => {
    it('should show loading state on init', () => {
      fixture.detectChanges();

      expect(component.loading()).toBe(true);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('lib-spinner')).toBeTruthy();

      flushConversations();
    });

    it('should load conversations on init', () => {
      const items = [
        mockConversation(),
        mockConversation({ id: 'conv-2', subject: 'Engagement Shoot' }),
      ];
      fixture.detectChanges();

      expect(component.loading()).toBe(true);

      flushConversations(items);

      expect(component.conversations()).toEqual(items);
      expect(component.loading()).toBe(false);
    });

    it('should set loading to false on error', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne(`${baseUrl}/api/email/conversations`);
      req.error(new ProgressEvent('error'));

      expect(component.loading()).toBe(false);
    });
  });

  describe('empty state', () => {
    it('should show empty state when no conversations', () => {
      fixture.detectChanges();
      flushConversations([]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const sidebar = el.querySelector('.inbox__sidebar')!;
      expect(sidebar.querySelector('lib-empty-state')).toBeTruthy();
      expect(el.querySelector('.inbox__conversation-item')).toBeNull();
    });
  });

  describe('conversation list', () => {
    it('should render conversation items', () => {
      const items = [
        mockConversation({ id: 'conv-1', clientName: 'Jane Doe', isRead: false }),
        mockConversation({ id: 'conv-2', clientName: 'Bob Smith', isRead: true }),
      ];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const convItems = el.querySelectorAll('.inbox__conversation-item');
      expect(convItems.length).toBe(2);
    });

    it('should show unread dot for unread conversations', () => {
      const items = [mockConversation({ id: 'conv-1', isRead: false })];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const dot = el.querySelector('.inbox__unread-dot');
      expect(dot).toBeTruthy();
      expect(el.querySelector('.inbox__unread-dot-placeholder')).toBeNull();
    });

    it('should show placeholder for read conversations', () => {
      const items = [mockConversation({ id: 'conv-1', isRead: true })];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.inbox__unread-dot')).toBeNull();
      expect(el.querySelector('.inbox__unread-dot-placeholder')).toBeTruthy();
    });

    it('should bold unread conversation names', () => {
      const items = [mockConversation({ id: 'conv-1', isRead: false })];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const name = el.querySelector('.inbox__conversation-name');
      expect(name!.classList.contains('inbox__conversation-name--unread')).toBe(true);
    });

    it('should not bold read conversation names', () => {
      const items = [mockConversation({ id: 'conv-1', isRead: true })];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const name = el.querySelector('.inbox__conversation-name');
      expect(name!.classList.contains('inbox__conversation-name--unread')).toBe(false);
    });

    it('should display subject in conversation list', () => {
      const items = [mockConversation({ subject: 'Family Session' })];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const subject = el.querySelector('.inbox__conversation-subject');
      expect(subject!.textContent).toContain('Family Session');
    });

    it('should show clientEmail when clientName is absent', () => {
      const items = [
        mockConversation({ clientName: undefined, clientEmail: 'test@example.com' }),
      ];
      fixture.detectChanges();
      flushConversations(items);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const name = el.querySelector('.inbox__conversation-name');
      expect(name!.textContent).toContain('test@example.com');
    });
  });

  describe('selecting a conversation', () => {
    it('should set selectedConversation on click', () => {
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const item = el.querySelector('.inbox__conversation-item') as HTMLButtonElement;
      item.click();
      fixture.detectChanges();

      expect(component.selectedConversation()).toEqual(conv);
    });

    it('should apply active class to selected conversation', () => {
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);
      fixture.detectChanges();

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const item = el.querySelector('.inbox__conversation-item');
      expect(item!.classList.contains('inbox__conversation-item--active')).toBe(true);
    });

    it('should clear reply body when selecting a conversation', () => {
      component.replyBody = 'some text';
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);

      expect(component.replyBody).toBe('');
    });

    it('should show "Select a conversation" when none selected', () => {
      fixture.detectChanges();
      flushConversations();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const emptyState = el.querySelector('.inbox__no-selection lib-empty-state');
      expect(emptyState).toBeTruthy();
    });
  });

  describe('message display', () => {
    it('should show messages in the thread', () => {
      const msgs = [
        mockMessage({ id: 'msg-1', isFromPhotographer: false, body: 'Client message' }),
        mockMessage({ id: 'msg-2', isFromPhotographer: true, body: 'Photographer reply' }),
      ];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const messageEls = el.querySelectorAll('.inbox__message');
      expect(messageEls.length).toBe(2);
    });

    it('should apply photographer class for photographer messages', () => {
      const msgs = [mockMessage({ isFromPhotographer: true })];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const msgEl = el.querySelector('.inbox__message');
      expect(msgEl!.classList.contains('inbox__message--photographer')).toBe(true);
      expect(msgEl!.classList.contains('inbox__message--client')).toBe(false);
    });

    it('should apply client class for client messages', () => {
      const msgs = [mockMessage({ isFromPhotographer: false })];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const msgEl = el.querySelector('.inbox__message');
      expect(msgEl!.classList.contains('inbox__message--client')).toBe(true);
      expect(msgEl!.classList.contains('inbox__message--photographer')).toBe(false);
    });

    it('should display sender name and body', () => {
      const msgs = [mockMessage({ senderName: 'Alice', body: 'Hello there!' })];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.inbox__message-sender')!.textContent).toContain('Alice');
      expect(el.querySelector('.inbox__message-body')!.textContent).toContain('Hello there!');
    });

    it('should fall back to senderEmail when senderName is absent', () => {
      const msgs = [mockMessage({ senderName: undefined, senderEmail: 'alice@test.com' })];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.inbox__message-sender')!.textContent).toContain('alice@test.com');
    });

    it('should show attachment count when attachments exist', () => {
      const msgs = [
        mockMessage({
          attachments: [
            { id: 'att-1', fileName: 'photo.jpg', contentType: 'image/jpeg', fileSizeBytes: 1024, storageUrl: '/photos/1' },
            { id: 'att-2', fileName: 'photo2.jpg', contentType: 'image/jpeg', fileSizeBytes: 2048, storageUrl: '/photos/2' },
          ],
        }),
      ];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const attachLabel = el.querySelector('.inbox__attachments-label');
      expect(attachLabel).toBeTruthy();
      expect(attachLabel!.textContent).toContain('2 attachments');
    });

    it('should show singular attachment label for single attachment', () => {
      const msgs = [
        mockMessage({
          attachments: [
            { id: 'att-1', fileName: 'photo.jpg', contentType: 'image/jpeg', fileSizeBytes: 1024, storageUrl: '/photos/1' },
          ],
        }),
      ];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const attachLabel = el.querySelector('.inbox__attachments-label');
      expect(attachLabel!.textContent).toContain('1 attachment');
      expect(attachLabel!.textContent).not.toContain('attachments');
    });

    it('should not show attachments section when no attachments', () => {
      const msgs = [mockMessage({ attachments: [] })];
      const conv = mockConversation({ messages: msgs });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.inbox__message-attachments')).toBeNull();
    });

    it('should show thread header with subject and client info', () => {
      const conv = mockConversation({ subject: 'Portrait Session', clientName: 'Bob Smith' });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.inbox__thread-subject')!.textContent).toContain('Portrait Session');
      expect(el.querySelector('.inbox__thread-client')!.textContent).toContain('Bob Smith');
    });
  });

  describe('send reply', () => {
    it('should send reply and update conversation', () => {
      const conv = mockConversation({ clientEmail: 'client@test.com', contactId: 'contact-1' });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      component.replyBody = 'Here are your photos!';
      component.sendReply();

      expect(component.sending()).toBe(true);

      const req = httpTesting.expectOne(`${baseUrl}/api/email/send`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        contactId: 'contact-1',
        recipientEmail: 'client@test.com',
        subject: 'Wedding Photos',
        body: 'Here are your photos!',
      });

      const updatedConv = mockConversation({
        messages: [
          mockMessage(),
          mockMessage({ id: 'msg-2', isFromPhotographer: true, body: 'Here are your photos!' }),
        ],
      });
      req.flush(updatedConv);

      expect(component.sending()).toBe(false);
      expect(component.replyBody).toBe('');
      expect(component.selectedConversation()!.messages.length).toBe(2);
    });

    it('should update conversation in the list after send', () => {
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      component.replyBody = 'Reply text';
      component.sendReply();

      const updatedConv = mockConversation({ subject: 'Wedding Photos (updated)' });
      const req = httpTesting.expectOne(`${baseUrl}/api/email/send`);
      req.flush(updatedConv);

      expect(component.conversations()[0].subject).toBe('Wedding Photos (updated)');
    });

    it('should set sending to false on error', () => {
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      component.replyBody = 'Reply text';
      component.sendReply();

      const req = httpTesting.expectOne(`${baseUrl}/api/email/send`);
      req.error(new ProgressEvent('error'));

      expect(component.sending()).toBe(false);
    });

    it('should not send when reply body is empty', () => {
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      component.replyBody = '';
      component.sendReply();

      // No request should be made — httpTesting.verify() in afterEach confirms
    });

    it('should not send when reply body is whitespace only', () => {
      const conv = mockConversation();
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      component.replyBody = '   ';
      component.sendReply();

      // No request should be made
    });

    it('should not send when no conversation is selected', () => {
      fixture.detectChanges();
      flushConversations();

      component.replyBody = 'Some reply';
      component.sendReply();

      // No request should be made
    });

    it('should use empty string for recipientEmail when clientEmail is undefined', () => {
      const conv = mockConversation({ clientEmail: undefined });
      fixture.detectChanges();
      flushConversations([conv]);

      component.selectConversation(conv);
      component.replyBody = 'Hello';
      component.sendReply();

      const req = httpTesting.expectOne(`${baseUrl}/api/email/send`);
      expect(req.request.body.recipientEmail).toBe('');
      req.flush(conv);
    });
  });

  describe('getInitials', () => {
    it('should return two initials for full name', () => {
      expect(component.getInitials('Jane Doe', undefined)).toBe('JD');
    });

    it('should return one initial for single name', () => {
      expect(component.getInitials('Jane', undefined)).toBe('J');
    });

    it('should return first letter of email when no name', () => {
      expect(component.getInitials(undefined, 'alice@test.com')).toBe('A');
    });

    it('should return ? when both name and email are undefined', () => {
      expect(component.getInitials(undefined, undefined)).toBe('?');
    });

    it('should handle empty string name and fall back to email', () => {
      expect(component.getInitials('', 'bob@test.com')).toBe('B');
    });
  });
});
