import { Component, input, output, signal, OnDestroy } from '@angular/core';
import { ModalContainerComponent, ButtonComponent } from 'components';

export interface SharePlatform {
  name: string;
  label: string;
}

@Component({
  selector: 'lib-share-dialog',
  standalone: true,
  imports: [ModalContainerComponent, ButtonComponent],
  template: `
    <lib-modal [title]="title()" [open]="isOpen()" (closed)="closed.emit()">
      <div class="share-content">
        <div class="url-row">
          <input
            class="url-input"
            type="text"
            [value]="shareUrl()"
            readonly
            aria-label="Share URL"
          />
          <lib-button variant="primary" (clicked)="copyToClipboard()">
            {{ copied() ? 'Copied!' : 'Copy' }}
          </lib-button>
        </div>

        <div class="divider"></div>

        <p class="share-label">Share on</p>

        <div class="platform-grid">
          @for (platform of platforms; track platform.name) {
            <button
              class="platform-button"
              (click)="onPlatformClick(platform.name)"
              [attr.aria-label]="'Share on ' + platform.label"
              [attr.data-platform]="platform.name"
            >
              <span class="platform-icon">
                @switch (platform.name) {
                  @case ('facebook') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                  }
                  @case ('instagram') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg>
                  }
                  @case ('pinterest') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 5 3.1 9.3 7.4 11-.1-1-.2-2.4 0-3.4.2-1 1.5-6.4 1.5-6.4s-.4-.8-.4-1.9c0-1.8 1-3.1 2.3-3.1 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1 4.2-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.7-2.2 3.7-5.5 0-2.9-2.1-4.9-5-4.9-3.4 0-5.5 2.6-5.5 5.2 0 1 .4 2.1.9 2.7.1.1.1.2.1.3-.1.4-.3 1.2-.3 1.4-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.7 0-3.8 2.8-7.3 8-7.3 4.2 0 7.5 3 7.5 7 0 4.2-2.6 7.5-6.3 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 3c-.3 1.1-.1 2.4-.5 3.4 1.5.5 3.1.7 4.7.7 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
                  }
                  @case ('whatsapp') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2-1c-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.3-.6.1-1.5-.7-2.5-1.6-3.4-2.8-.2-.3 0-.5.2-.6l.5-.6c.2-.2.1-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.7 5.1.8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9s2.9 4.3 2.9 6.9c0 5.5-4.5 9.9-9.8 9.9zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3z"/></svg>
                  }
                  @case ('email') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
                  }
                }
              </span>
              <span class="platform-name">{{ platform.label }}</span>
            </button>
          }
        </div>
      </div>
    </lib-modal>
  `,
  styles: `
    .share-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .url-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .url-input {
      flex: 1;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      padding: 10px 14px;
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
      outline: none;
    }

    .url-input:focus {
      border-color: #C9A962;
    }

    .divider {
      height: 1px;
      background: #3A3A3C;
    }

    .share-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
    }

    .platform-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .platform-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 12px;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .platform-button:hover {
      border-color: #C9A962;
    }

    .platform-button:focus-visible {
      outline: 2px solid #C9A962;
      outline-offset: 2px;
    }

    .platform-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: #F5F5F0;
    }

    .platform-name {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #F5F5F0;
    }
  `,
})
export class ShareDialogComponent implements OnDestroy {
  readonly isOpen = input<boolean>(false);
  readonly shareUrl = input<string>('');
  readonly title = input<string>('Share');
  readonly closed = output<void>();
  readonly platformSelected = output<string>();

  readonly copied = signal(false);

  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly platforms: SharePlatform[] = [
    { name: 'facebook', label: 'Facebook' },
    { name: 'instagram', label: 'Instagram' },
    { name: 'pinterest', label: 'Pinterest' },
    { name: 'whatsapp', label: 'WhatsApp' },
    { name: 'email', label: 'Email' },
  ];

  ngOnDestroy(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.shareUrl());
    this.copied.set(true);

    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.resetTimer = setTimeout(() => {
      this.copied.set(false);
      this.resetTimer = null;
    }, 2000);
  }

  onPlatformClick(name: string): void {
    this.platformSelected.emit(name);
  }
}
