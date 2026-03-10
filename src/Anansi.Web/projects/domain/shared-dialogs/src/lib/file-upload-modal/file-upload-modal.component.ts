import { Component, computed, input, output, signal } from '@angular/core';
import { inject } from '@angular/core';
import { GalleryMediaService, GalleryMediaDto } from 'api';
import { ModalContainerComponent, ButtonComponent } from 'components';

export interface UploadFileEntry {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

let nextEntryId = 0;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Component({
  selector: 'lib-file-upload-modal',
  standalone: true,
  imports: [ModalContainerComponent, ButtonComponent],
  template: `
    <lib-modal [title]="'Upload Photos'" [open]="isOpen()" (closed)="onClose()">
      @if (files().length === 0) {
        <div
          class="drop-zone"
          [class.drag-over]="dragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <svg class="cloud-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/>
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
          </svg>
          <p class="drop-text">Drop photos here or click to browse</p>
          <p class="file-info">JPG, PNG, WEBP, HEIC up to 50MB each</p>
          <lib-button variant="primary" (clicked)="fileInput.click()">Browse Files</lib-button>
        </div>
      }

      @if (files().length > 0) {
        <div class="file-list">
          @for (entry of files(); track entry.id) {
            <div class="file-item">
              <div class="file-header">
                <span class="file-name">{{ entry.file.name }}</span>
                <span class="file-percent">{{ entry.progress }}%</span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="entry.progress"
                  [class.error]="entry.status === 'error'"
                ></div>
              </div>
              @if (entry.status === 'error') {
                <span class="error-text">{{ entry.errorMessage ?? 'Upload failed' }}</span>
              }
            </div>
          }
        </div>
      }

      <input
        #fileInput
        type="file"
        multiple
        accept="image/*"
        class="hidden-input"
        (change)="onFileSelected($event)"
      />
    </lib-modal>
  `,
  styles: `
    .drop-zone {
      border: 2px dashed #3A3A3C;
      border-radius: 12px;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .drop-zone.drag-over {
      border-color: #C9A962;
      background-color: rgba(201, 169, 98, 0.05);
    }

    .cloud-icon {
      color: #6E6E70;
    }

    .drop-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      margin: 0;
    }

    .file-info {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      margin: 0;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 360px;
      overflow-y: auto;
    }

    .file-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .file-name {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 400px;
    }

    .file-percent {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      flex-shrink: 0;
    }

    .progress-track {
      height: 4px;
      background: #3A3A3C;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #C9A962;
      border-radius: 2px;
      transition: width 0.2s ease;
    }

    .progress-fill.error {
      background: #C94A4A;
    }

    .error-text {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #C94A4A;
    }

    .hidden-input {
      display: none;
    }
  `,
})
export class FileUploadModalComponent {
  private readonly mediaService = inject(GalleryMediaService);

  readonly isOpen = input<boolean>(false);
  readonly collectionId = input<string>('');
  readonly closed = output<void>();
  readonly uploadComplete = output<void>();

  readonly files = signal<UploadFileEntry[]>([]);
  readonly dragOver = signal(false);

  onClose(): void {
    this.files.set([]);
    this.closed.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      this.addFiles(Array.from(droppedFiles));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  addFiles(newFiles: File[]): void {
    const validEntries: UploadFileEntry[] = [];
    const rejectedEntries: UploadFileEntry[] = [];

    for (const file of newFiles) {
      const id = `upload-${nextEntryId++}`;
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejectedEntries.push({
          id,
          file,
          progress: 0,
          status: 'error',
          errorMessage: 'Unsupported file type',
        });
      } else if (file.size > MAX_FILE_SIZE) {
        rejectedEntries.push({
          id,
          file,
          progress: 0,
          status: 'error',
          errorMessage: 'File exceeds 50MB limit',
        });
      } else {
        validEntries.push({
          id,
          file,
          progress: 0,
          status: 'pending',
        });
      }
    }

    this.files.set([...this.files(), ...rejectedEntries, ...validEntries]);
    this.uploadSequentially(validEntries);
  }

  private uploadSequentially(entries: UploadFileEntry[]): void {
    if (entries.length === 0) {
      this.uploadComplete.emit();
      return;
    }

    const [current, ...remaining] = entries;
    this.updateEntry(current.id, { status: 'uploading', progress: 0 });

    this.mediaService.upload(this.collectionId(), current.file).subscribe({
      next: () => {
        this.updateEntry(current.id, { status: 'done', progress: 100 });
        this.uploadSequentially(remaining);
      },
      error: () => {
        this.updateEntry(current.id, { status: 'error', progress: 0 });
        this.uploadSequentially(remaining);
      },
    });
  }

  private updateEntry(entryId: string, update: Partial<UploadFileEntry>): void {
    this.files.update((entries) =>
      entries.map((e) =>
        e.id === entryId ? { ...e, ...update } : e,
      ),
    );
  }
}
