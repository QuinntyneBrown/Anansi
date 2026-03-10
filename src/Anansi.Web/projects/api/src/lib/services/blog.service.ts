import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  BlogCategoryDto,
  BlogPostDto,
  BlogPostListParams,
  CreateBlogCategoryCommand,
  CreateBlogPostCommand,
  ImportBlogPostCommand,
  UpdateBlogPostCommand,
} from '../models/website.models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  listPosts(websiteId: string, params?: BlogPostListParams): Observable<PagedList<BlogPostDto>> {
    let httpParams = new HttpParams();
    if (params?.status != null) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.categoryId != null) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedList<BlogPostDto>>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/posts`,
      { params: httpParams },
    );
  }

  createPost(websiteId: string, command: CreateBlogPostCommand): Observable<BlogPostDto> {
    return this.http.post<BlogPostDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/posts`,
      command,
    );
  }

  updatePost(websiteId: string, postId: string, command: UpdateBlogPostCommand): Observable<BlogPostDto> {
    return this.http.put<BlogPostDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/posts/${postId}`,
      command,
    );
  }

  duplicatePost(websiteId: string, postId: string): Observable<BlogPostDto> {
    return this.http.post<BlogPostDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/posts/${postId}/duplicate`,
      {},
    );
  }

  deletePost(websiteId: string, postId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/posts/${postId}`,
    );
  }

  importPost(websiteId: string, command: ImportBlogPostCommand): Observable<BlogPostDto> {
    return this.http.post<BlogPostDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/posts/import`,
      command,
    );
  }

  listCategories(websiteId: string): Observable<BlogCategoryDto[]> {
    return this.http.get<BlogCategoryDto[]>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/categories`,
    );
  }

  createCategory(websiteId: string, command: CreateBlogCategoryCommand): Observable<BlogCategoryDto> {
    return this.http.post<BlogCategoryDto>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/categories`,
      command,
    );
  }

  deleteCategory(websiteId: string, categoryId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/websites/${websiteId}/blog/categories/${categoryId}`,
    );
  }
}
