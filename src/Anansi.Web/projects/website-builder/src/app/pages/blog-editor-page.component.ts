import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  BlogPostDto,
  BlogPostStatus,
  BlogService,
  UpdateBlogPostCommand,
} from 'api';
import {
  ButtonComponent,
  InputGroupComponent,
  TextareaGroupComponent,
} from 'components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wb-blog-editor-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    InputGroupComponent,
    TextareaGroupComponent,
    FormsModule,
  ],
  template: `
    <div class="editor-layout">
      <div class="editor-panel">
        <input
          class="title-input"
          type="text"
          placeholder="Post title"
          [value]="title()"
          (input)="onTitleInput($event)"
        />

        <div class="toolbar">
          <button class="toolbar-btn" title="Bold">
            <lucide-icon name="bold" [size]="16"></lucide-icon>
          </button>
          <button class="toolbar-btn" title="Italic">
            <lucide-icon name="italic" [size]="16"></lucide-icon>
          </button>
          <button class="toolbar-btn" title="Underline">
            <lucide-icon name="underline" [size]="16"></lucide-icon>
          </button>
          <span class="toolbar-divider"></span>
          <button class="toolbar-btn" title="Heading">
            <lucide-icon name="heading" [size]="16"></lucide-icon>
          </button>
          <button class="toolbar-btn" title="List">
            <lucide-icon name="list" [size]="16"></lucide-icon>
          </button>
          <span class="toolbar-divider"></span>
          <button class="toolbar-btn" title="Link">
            <lucide-icon name="link" [size]="16"></lucide-icon>
          </button>
          <button class="toolbar-btn" title="Image">
            <lucide-icon name="image" [size]="16"></lucide-icon>
          </button>
        </div>

        <textarea
          class="body-editor"
          placeholder="Start writing..."
          [value]="bodyHtml()"
          (input)="onBodyInput($event)"
        ></textarea>

        <div class="editor-actions">
          <lib-button variant="outline" (clicked)="onPreview()">Preview</lib-button>
          <lib-button variant="primary" (clicked)="onPublish()">Publish</lib-button>
        </div>
      </div>

      <div class="editor-sidebar">
        <lib-input-group
          label="Publication Date"
          type="date"
          [(ngModel)]="publishDate"
        />

        <lib-input-group
          label="URL Slug"
          [(ngModel)]="slug"
        />

        <div class="upload-area">
          <lucide-icon name="upload" [size]="24"></lucide-icon>
          <span class="upload-text">Drop image here</span>
        </div>

        <lib-input-group
          label="Category"
          [(ngModel)]="category"
        />

        <lib-input-group
          label="SEO Title"
          [(ngModel)]="seoTitle"
        />

        <lib-textarea-group
          label="SEO Description"
          [(ngModel)]="seoDescription"
        />
      </div>
    </div>
  `,
  styles: `
    .editor-layout {
      display: flex;
      background: #1A1A1C;
      min-height: 100vh;
    }

    .editor-panel {
      flex: 1;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 0;
    }

    .title-input {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 300;
      color: #F5F5F0;
      background: transparent;
      border: none;
      outline: none;
      width: 100%;
    }

    .title-input::placeholder {
      color: #4A4A4C;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #F5F5F0;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .toolbar-btn:hover {
      background: #242426;
    }

    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: #3A3A3C;
      margin: 0 4px;
    }

    .body-editor {
      font-family: Inter, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      color: #F5F5F0;
      background: transparent;
      border: none;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      min-height: 400px;
      resize: vertical;
    }

    .body-editor::placeholder {
      color: #4A4A4C;
    }

    .editor-actions {
      display: flex;
      gap: 8px;
    }

    .editor-sidebar {
      width: 320px;
      flex-shrink: 0;
      background: #242426;
      border-left: 1px solid #3A3A3C;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      height: 160px;
      border: 2px dashed #3A3A3C;
      border-radius: 12px;
      color: #6E6E70;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .upload-area:hover {
      border-color: #C9A962;
    }

    .upload-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }
  `,
})
export class BlogEditorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);

  readonly title = signal('');
  readonly bodyHtml = signal('');
  readonly postId = signal<string | null>(null);
  readonly websiteId = signal('');

  slug = '';
  publishDate = '';
  category = '';
  seoTitle = '';
  seoDescription = '';

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    this.websiteId.set(params.get('websiteId') ?? '');
    const id = params.get('postId');
    this.postId.set(id);

    if (id && id !== 'new') {
      this.loadPost(id);
    }
  }

  private loadPost(postId: string): void {
    this.blogService.listPosts(this.websiteId(), { pageSize: 100 }).subscribe({
      next: (result) => {
        const post = result.items.find((p) => p.id === postId);
        if (post) {
          this.title.set(post.title);
          this.bodyHtml.set(post.bodyHtml);
          this.slug = post.slug;
          this.publishDate = post.publishDate ?? '';
          this.seoTitle = post.metaTitle ?? '';
          this.seoDescription = post.metaDescription ?? '';
          this.category = post.categories.length > 0
            ? post.categories[0].name
            : '';
        }
      },
    });
  }

  onTitleInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  onBodyInput(event: Event): void {
    this.bodyHtml.set((event.target as HTMLTextAreaElement).value);
  }

  onPreview(): void {
    // Preview placeholder
  }

  onPublish(): void {
    const id = this.postId();
    if (!id || id === 'new') {
      this.blogService.createPost(this.websiteId(), {
        websiteId: this.websiteId(),
        title: this.title(),
        slug: this.slug,
        bodyHtml: this.bodyHtml(),
        status: BlogPostStatus.Published,
        publishDate: new Date().toISOString(),
        metaTitle: this.seoTitle || undefined,
        metaDescription: this.seoDescription || undefined,
      }).subscribe({
        next: () => {
          this.router.navigate(['/sites', this.websiteId(), 'blog']);
        },
      });
    } else {
      const command: UpdateBlogPostCommand = {
        postId: id,
        title: this.title(),
        slug: this.slug,
        bodyHtml: this.bodyHtml(),
        status: BlogPostStatus.Published,
        publishDate: new Date().toISOString(),
        metaTitle: this.seoTitle || undefined,
        metaDescription: this.seoDescription || undefined,
      };
      this.blogService.updatePost(this.websiteId(), id, command).subscribe({
        next: () => {
          this.router.navigate(['/sites', this.websiteId(), 'blog']);
        },
      });
    }
  }
}
