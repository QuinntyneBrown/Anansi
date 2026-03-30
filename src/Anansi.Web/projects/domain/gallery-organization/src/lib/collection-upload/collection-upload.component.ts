import { Component, inject, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { GalleryMediaService, GalleryMediaDto } from 'api';
import { ButtonComponent, SpinnerComponent } from 'components';

interface UploadFileEntry {
  file: File;
  name: string;
  size: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  errorMessage?: string;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/x-canon-cr2',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-adobe-dng',
  'video/mp4',
  'video/quicktime',
];

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.cr2,.nef,.arw,.dng,.mp4,.mov';

@Component({
  selector: 'lib-collection-upload',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, SpinnerComponent],
  template: `
    <div class="upload-page">
      <div class="page-header">
        <h1 class="page-title">Upload Photos</h1>
        <span class="collection-name">{{ collectionId() }}</span>
      </div>

      <div
        class="drop-zone"
        [class.drop-zone--active]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <lucide-icon class="upload-icon" name="upload-cloud" [size]="48"></lucide-icon>
        <p class="drop-text">Drag & drop photos here</p>
        <span class="or-text">or</span>
        <lib-button variant="secondary" (clicked)="fileInput.click()">Browse Files</lib-button>
        <input
          #fileInput
          type="file"
          class="file-input"
          multiple
          [accept]="acceptedExtensions"
          (change)="onFilesSelected($event)"
        />
      </div>

      @if (files().length > 0) {
        <div class="upload-summary">
          <span class="summary-text">
            {{ completedCount() }} of {{ files().length }} files uploaded
          </span>
        </div>

        <div class="file-list">
          @for (entry of files(); track entry.name) {
            <div class="file-row">
              <div class="file-info">
                <span class="file-name">{{ entry.name }}</span>
                <span class="file-size">{{ entry.size }}</span>
              </div>

              <div class="file-progress">
                @switch (entry.status) {
                  @case ('uploading') {
                    <div class="progress-bar-container">
                      <div class="progress-bar" [style.width.%]="entry.progress"></div>
                    </div>
                    <span class="progress-text">{{ entry.progress }}%</span>
                  }
                  @case ('complete') {
                    <lucide-icon name="check-circle" [size]="20" class="status-complete"></lucide-icon>
                  }
                  @case ('error') {
                    <div class="error-status">
                      <lucide-icon name="x-circle" [size]="20" class="status-error"></lucide-icon>
                      @if (entry.errorMessage) {
                        <span class="error-text">{{ entry.errorMessage }}</span>
                      }
                    </div>
                  }
                  @case ('pending') {
                    <lib-spinner [size]="16" />
                  }
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .upload-page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 32px 24px;
    }

    .page-header {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 32px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .collection-name {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .drop-zone {
      min-height: 300px;
      border: 2px dashed #3A3A3C;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 48px 24px;
      transition: border-color 0.15s ease, background 0.15s ease;
      cursor: pointer;
    }

    .drop-zone--active {
      border-color: #C9A962;
      background: rgba(201, 169, 98, 0.04);
    }

    .drop-zone:hover {
      border-color: #C9A962;
    }

    .upload-icon {
      color: #6E6E70;
    }

    .drop-text {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #F5F5F0;
      margin: 0;
    }

    .or-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .file-input {
      display: none;
    }

    .upload-summary {
      margin-top: 24px;
      margin-bottom: 16px;
    }

    .summary-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #F5F5F0;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 12px;
    }

    .file-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }

    .file-name {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
    }

    .file-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      min-width: 160px;
      justify-content: flex-end;
    }

    .progress-bar-container {
      width: 120px;
      height: 6px;
      background: #3A3A3C;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: #C9A962;
      border-radius: 3px;
      transition: width 0.2s ease;
    }

    .progress-text {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #F5F5F0;
      min-width: 36px;
      text-align: right;
    }

    .status-complete {
      color: #6E9E6E;
    }

    .status-error {
      color: #C94A4A;
    }

    .error-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-text {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #C94A4A;
    }
  `,
})
export class CollectionUploadComponent {
  private readonly galleryMediaService = inject(GalleryMediaService);

  readonly collectionId = input.required<string>();
  readonly uploadComplete = output<void>();

  readonly files = signal<UploadFileEntry[]>([]);
  readonly isDragOver = signal(false);
  readonly acceptedExtensions = ACCEPTED_EXTENSIONS;

  readonly completedCount = () =>
    this.files().filter((f) => f.status === 'complete').length;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.addFiles(Array.from(droppedFiles));
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private addFiles(newFiles: File[]): void {
    const validFiles = newFiles.filter(
      (f) =>
        ACCEPTED_TYPES.includes(f.type) ||
        ACCEPTED_EXTENSIONS.split(',').some((ext) =>
          f.name.toLowerCase().endsWith(ext),
        ),
    );

    const entries: UploadFileEntry[] = validFiles.map((file) => ({
      file,
      name: file.name,
      size: this.formatFileSize(file.size),
      progress: 0,
      status: 'pending' as const,
    }));

    this.files.update((current) => [...current, ...entries]);

    for (const entry of entries) {
      this.uploadFile(entry);
    }
  }

  private uploadFile(entry: UploadFileEntry): void {
    this.updateFileStatus(entry.name, { status: 'uploading', progress: 10 });

    this.galleryMediaService.upload(this.collectionId(), entry.file).subscribe({
      next: (_result: GalleryMediaDto) => {
        this.updateFileStatus(entry.name, { status: 'complete', progress: 100 });
        this.checkAllComplete();
      },
      error: (err) => {
        this.updateFileStatus(entry.name, {
          status: 'error',
          errorMessage: err.error?.message ?? 'Upload failed',
        });
        this.checkAllComplete();
      },
    });
  }

  private updateFileStatus(
    fileName: string,
    updates: Partial<UploadFileEntry>,
  ): void {
    this.files.update((items) =>
      items.map((f) => (f.name === fileName ? { ...f, ...updates } : f)),
    );
  }

  private checkAllComplete(): void {
    const allDone = this.files().every(
      (f) => f.status === 'complete' || f.status === 'error',
    );
    if (allDone && this.files().length > 0) {
      this.uploadComplete.emit();
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
