import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG } from 'api';
import { FileUploadModalComponent } from './file-upload-modal.component';

describe('FileUploadModalComponent', () => {
  let component: FileUploadModalComponent;
  let fixture: ComponentFixture<FileUploadModalComponent>;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FileUploadModalComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show drop zone when no files are selected', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const dropZone = fixture.nativeElement.querySelector('.drop-zone');
    expect(dropZone).toBeTruthy();

    const fileList = fixture.nativeElement.querySelector('.file-list');
    expect(fileList).toBeNull();
  });

  it('should show cloud icon and instructional text in drop zone', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const cloudIcon = fixture.nativeElement.querySelector('.cloud-icon');
    expect(cloudIcon).toBeTruthy();

    const dropText = fixture.nativeElement.querySelector('.drop-text');
    expect(dropText.textContent).toBe('Drop photos here or click to browse');

    const fileInfo = fixture.nativeElement.querySelector('.file-info');
    expect(fileInfo.textContent).toContain('JPG, PNG, WEBP, HEIC');
  });

  it('should show Browse Files button', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('lib-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Browse Files');
  });

  it('should set dragOver on dragover event', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const dragEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as DragEvent;

    component.onDragOver(dragEvent);
    fixture.detectChanges();

    expect(component.dragOver()).toBe(true);
    expect(dragEvent.preventDefault).toHaveBeenCalled();
    expect(dragEvent.stopPropagation).toHaveBeenCalled();

    const dropZone = fixture.nativeElement.querySelector('.drop-zone');
    expect(dropZone.classList.contains('drag-over')).toBe(true);
  });

  it('should clear dragOver on dragleave event', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.dragOver.set(true);
    component.onDragLeave();
    fixture.detectChanges();

    expect(component.dragOver()).toBe(false);
  });

  it('should handle file drop with files', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-1');
    fixture.detectChanges();

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    const mockFileList = { length: 1, 0: file, item: (i: number) => file } as unknown as FileList;
    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: mockFileList },
    } as unknown as DragEvent;

    component.onDrop(dropEvent);
    fixture.detectChanges();

    expect(component.files().length).toBe(1);
    expect(component.files()[0].file.name).toBe('photo.jpg');
    expect(component.files()[0].status).toBe('uploading');
    expect(component.dragOver()).toBe(false);
    expect(dropEvent.preventDefault).toHaveBeenCalled();

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/col-1/media`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', fileName: 'photo.jpg' });
  });

  it('should do nothing on drop with no dataTransfer', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: null,
    } as unknown as DragEvent;

    component.onDrop(dropEvent);

    expect(component.files().length).toBe(0);
  });

  it('should do nothing on drop with empty file list', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const mockFileList = { length: 0 } as unknown as FileList;
    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: mockFileList },
    } as unknown as DragEvent;

    component.onDrop(dropEvent);

    expect(component.files().length).toBe(0);
  });

  it('should handle file selection via input', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-2');
    fixture.detectChanges();

    const file = new File(['data'], 'pic.png', { type: 'image/png' });
    const mockFileList = { length: 1, 0: file, item: (i: number) => file } as unknown as FileList;
    const mockEvent = {
      target: { files: mockFileList, value: 'C:\\fakepath\\pic.png' },
    } as unknown as Event;

    component.onFileSelected(mockEvent);
    fixture.detectChanges();

    expect(component.files().length).toBe(1);
    expect(component.files()[0].file.name).toBe('pic.png');
    expect((mockEvent.target as HTMLInputElement).value).toBe('');

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/col-2/media`);
    req.flush({ id: '2', fileName: 'pic.png' });
  });

  it('should do nothing on file input change with no files', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const mockEvent = { target: { files: null } } as unknown as Event;
    component.onFileSelected(mockEvent);

    expect(component.files().length).toBe(0);
  });

  it('should do nothing on file input change with empty file list', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const mockFileList = { length: 0 } as unknown as FileList;
    const mockEvent = { target: { files: mockFileList, value: '' } } as unknown as Event;
    component.onFileSelected(mockEvent);

    expect(component.files().length).toBe(0);
  });

  it('should upload files sequentially and track progress', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-3');
    fixture.detectChanges();

    const file1 = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const file2 = new File(['b'], 'b.jpg', { type: 'image/jpeg' });

    component.addFiles([file1, file2]);
    fixture.detectChanges();

    expect(component.files().length).toBe(2);
    expect(component.files()[0].status).toBe('uploading');
    expect(component.files()[1].status).toBe('pending');

    // Complete first upload
    const req1 = httpTesting.expectOne(`${baseUrl}/api/collections/col-3/media`);
    req1.flush({ id: '1', fileName: 'a.jpg' });
    fixture.detectChanges();

    expect(component.files()[0].status).toBe('done');
    expect(component.files()[0].progress).toBe(100);
    expect(component.files()[1].status).toBe('uploading');

    // Complete second upload
    const req2 = httpTesting.expectOne(`${baseUrl}/api/collections/col-3/media`);
    req2.flush({ id: '2', fileName: 'b.jpg' });
    fixture.detectChanges();

    expect(component.files()[1].status).toBe('done');
    expect(component.files()[1].progress).toBe(100);
  });

  it('should show file list with progress bars when files exist', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-4');
    fixture.detectChanges();

    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
    component.addFiles([file]);
    fixture.detectChanges();

    const fileList = fixture.nativeElement.querySelector('.file-list');
    expect(fileList).toBeTruthy();

    const dropZone = fixture.nativeElement.querySelector('.drop-zone');
    expect(dropZone).toBeNull();

    const fileName = fixture.nativeElement.querySelector('.file-name');
    expect(fileName.textContent).toBe('test.jpg');

    const progressTrack = fixture.nativeElement.querySelector('.progress-track');
    expect(progressTrack).toBeTruthy();

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/col-4/media`);
    req.flush({ id: '1', fileName: 'test.jpg' });
  });

  it('should handle upload error', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-5');
    fixture.detectChanges();

    const file = new File(['data'], 'fail.jpg', { type: 'image/jpeg' });
    component.addFiles([file]);

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/col-5/media`);
    req.error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(component.files()[0].status).toBe('error');
    expect(component.files()[0].progress).toBe(0);

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText).toBeTruthy();
    expect(errorText.textContent).toBe('Upload failed');

    const progressFill = fixture.nativeElement.querySelector('.progress-fill');
    expect(progressFill.classList.contains('error')).toBe(true);
  });

  it('should continue uploading remaining files after error', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-6');
    fixture.detectChanges();

    const file1 = new File(['a'], 'err.jpg', { type: 'image/jpeg' });
    const file2 = new File(['b'], 'ok.jpg', { type: 'image/jpeg' });
    component.addFiles([file1, file2]);

    // First fails
    const req1 = httpTesting.expectOne(`${baseUrl}/api/collections/col-6/media`);
    req1.error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(component.files()[0].status).toBe('error');
    expect(component.files()[1].status).toBe('uploading');

    // Second succeeds
    const req2 = httpTesting.expectOne(`${baseUrl}/api/collections/col-6/media`);
    req2.flush({ id: '2', fileName: 'ok.jpg' });
    fixture.detectChanges();

    expect(component.files()[1].status).toBe('done');
  });

  it('should emit uploadComplete when all uploads finish', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-7');
    fixture.detectChanges();

    const spy = vi.fn();
    component.uploadComplete.subscribe(spy);

    const file = new File(['data'], 'done.jpg', { type: 'image/jpeg' });
    component.addFiles([file]);

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/col-7/media`);
    req.flush({ id: '1', fileName: 'done.jpg' });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit closed and reset files on close', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.files.set([
      { file: new File([''], 'x.jpg'), progress: 100, status: 'done' },
    ]);

    const spy = vi.fn();
    component.closed.subscribe(spy);

    component.onClose();

    expect(component.files().length).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should append files to existing list', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-8');
    fixture.detectChanges();

    const file1 = new File(['a'], 'first.jpg', { type: 'image/jpeg' });
    component.addFiles([file1]);

    const req1 = httpTesting.expectOne(`${baseUrl}/api/collections/col-8/media`);
    req1.flush({ id: '1', fileName: 'first.jpg' });

    const file2 = new File(['b'], 'second.jpg', { type: 'image/jpeg' });
    component.addFiles([file2]);

    expect(component.files().length).toBe(2);
    expect(component.files()[0].file.name).toBe('first.jpg');
    expect(component.files()[1].file.name).toBe('second.jpg');

    const req2 = httpTesting.expectOne(`${baseUrl}/api/collections/col-8/media`);
    req2.flush({ id: '2', fileName: 'second.jpg' });
  });

  it('should click hidden file input when drop zone is clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput, 'click');

    const dropZone = fixture.nativeElement.querySelector('.drop-zone');
    dropZone.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should have hidden file input with correct attributes', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    expect(fileInput.multiple).toBe(true);
    expect(fileInput.accept).toBe('image/*');
    expect(fileInput.classList.contains('hidden-input')).toBe(true);
  });

  it('should show percentage text for each file', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('collectionId', 'col-9');
    fixture.detectChanges();

    const file = new File(['x'], 'pct.jpg', { type: 'image/jpeg' });
    component.addFiles([file]);
    fixture.detectChanges();

    const percent = fixture.nativeElement.querySelector('.file-percent');
    expect(percent.textContent).toBe('0%');

    const req = httpTesting.expectOne(`${baseUrl}/api/collections/col-9/media`);
    req.flush({ id: '1', fileName: 'pct.jpg' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.file-percent').textContent).toBe('100%');
  });

  it('should not render modal content when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const dropZone = fixture.nativeElement.querySelector('.drop-zone');
    expect(dropZone).toBeNull();
  });
});
