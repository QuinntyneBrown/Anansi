import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { BlogService } from './blog.service';
import { PagedList } from '../models/common';
import {
  BlogCategoryDto,
  BlogPostDto,
  CreateBlogCategoryCommand,
  CreateBlogPostCommand,
  ImportBlogPostCommand,
  UpdateBlogPostCommand,
} from '../models/website.models';
import { BlogPostStatus } from '../models/enums';

describe('BlogService', () => {
  let service: BlogService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(BlogService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockCategory: BlogCategoryDto = {
    id: 'cat-1',
    name: 'Weddings',
    slug: 'weddings',
    description: 'Wedding photography posts',
    sortOrder: 0,
  };

  const mockPost: BlogPostDto = {
    id: 'post-1',
    websiteId: 'ws-1',
    title: 'My First Post',
    slug: 'my-first-post',
    excerpt: 'A short excerpt',
    bodyHtml: '<p>Hello World</p>',
    featuredImageUrl: 'https://example.com/photo.jpg',
    status: BlogPostStatus.Published,
    publishDate: '2026-01-15T00:00:00Z',
    categories: [mockCategory],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  };

  const mockPagedPosts: PagedList<BlogPostDto> = {
    items: [mockPost],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  describe('listPosts', () => {
    it('should GET /api/websites/{websiteId}/blog/posts without params', () => {
      service.listPosts('ws-1').subscribe((result) => {
        expect(result).toEqual(mockPagedPosts);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedPosts);
    });

    it('should GET /api/websites/{websiteId}/blog/posts with all params', () => {
      service.listPosts('ws-1', {
        status: BlogPostStatus.Draft,
        categoryId: 'cat-1',
        page: 2,
        pageSize: 5,
      }).subscribe((result) => {
        expect(result).toEqual(mockPagedPosts);
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/websites/ws-1/blog/posts` &&
          r.params.get('status') === '0' &&
          r.params.get('categoryId') === 'cat-1' &&
          r.params.get('page') === '2' &&
          r.params.get('pageSize') === '5',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedPosts);
    });

    it('should GET /api/websites/{websiteId}/blog/posts with only status param', () => {
      service.listPosts('ws-1', { status: BlogPostStatus.Published }).subscribe((result) => {
        expect(result).toEqual(mockPagedPosts);
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/websites/ws-1/blog/posts` &&
          r.params.get('status') === '1',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('categoryId')).toBe(false);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedPosts);
    });

    it('should GET /api/websites/{websiteId}/blog/posts with empty params object', () => {
      service.listPosts('ws-1', {}).subscribe((result) => {
        expect(result).toEqual(mockPagedPosts);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedPosts);
    });
  });

  describe('createPost', () => {
    it('should POST to /api/websites/{websiteId}/blog/posts and return BlogPostDto', () => {
      const command: CreateBlogPostCommand = {
        websiteId: 'ws-1',
        title: 'New Post',
        slug: 'new-post',
        bodyHtml: '<p>Content</p>',
        status: BlogPostStatus.Draft,
        categoryIds: ['cat-1'],
      };

      service.createPost('ws-1', command).subscribe((result) => {
        expect(result).toEqual(mockPost);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockPost);
    });
  });

  describe('updatePost', () => {
    it('should PUT to /api/websites/{websiteId}/blog/posts/{postId} and return BlogPostDto', () => {
      const command: UpdateBlogPostCommand = {
        postId: 'post-1',
        title: 'Updated Post',
        slug: 'updated-post',
        bodyHtml: '<p>Updated content</p>',
        status: BlogPostStatus.Published,
        categoryIds: ['cat-1'],
      };

      service.updatePost('ws-1', 'post-1', command).subscribe((result) => {
        expect(result).toEqual(mockPost);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts/post-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockPost);
    });
  });

  describe('duplicatePost', () => {
    it('should POST to /api/websites/{websiteId}/blog/posts/{postId}/duplicate and return BlogPostDto', () => {
      service.duplicatePost('ws-1', 'post-1').subscribe((result) => {
        expect(result).toEqual(mockPost);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts/post-1/duplicate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockPost);
    });
  });

  describe('deletePost', () => {
    it('should DELETE /api/websites/{websiteId}/blog/posts/{postId}', () => {
      service.deletePost('ws-1', 'post-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts/post-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('importPost', () => {
    it('should POST to /api/websites/{websiteId}/blog/posts/import and return BlogPostDto', () => {
      const command: ImportBlogPostCommand = {
        websiteId: 'ws-1',
        url: 'https://external-blog.com/post-1',
      };

      service.importPost('ws-1', command).subscribe((result) => {
        expect(result).toEqual(mockPost);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/posts/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockPost);
    });
  });

  describe('listCategories', () => {
    it('should GET /api/websites/{websiteId}/blog/categories and return BlogCategoryDto[]', () => {
      service.listCategories('ws-1').subscribe((result) => {
        expect(result).toEqual([mockCategory]);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/categories`);
      expect(req.request.method).toBe('GET');
      req.flush([mockCategory]);
    });
  });

  describe('createCategory', () => {
    it('should POST to /api/websites/{websiteId}/blog/categories and return BlogCategoryDto', () => {
      const command: CreateBlogCategoryCommand = {
        websiteId: 'ws-1',
        name: 'Portraits',
        slug: 'portraits',
        description: 'Portrait photography',
        sortOrder: 1,
      };

      service.createCategory('ws-1', command).subscribe((result) => {
        expect(result).toEqual(mockCategory);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/categories`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should DELETE /api/websites/{websiteId}/blog/categories/{categoryId}', () => {
      service.deleteCategory('ws-1', 'cat-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/websites/ws-1/blog/categories/cat-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
