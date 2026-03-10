# F18 - Blog Platform

## Overview

The Blog Platform feature provides photographers with a full-featured blogging system integrated into their Anansi websites. Blog posts serve as a key marketing tool for photographers, allowing them to showcase sessions, share behind-the-scenes content, and improve search engine visibility through regularly updated content.

Blog Post Management (WEB-3.3.1) enables creating posts with a title, rich text body (including inline images and embedded content), a custom URL slug, category assignments, and a configurable publication date. Posts support draft, published, and scheduled statuses, with scheduled posts automatically transitioning to published at their designated time. Post duplication allows photographers to reuse post structures efficiently. The Free plan limits photographers to 5 blog posts, while paid plans offer unlimited posts.

Blog Layouts (WEB-3.3.2) provide three presentation styles -- grid, stacked, and alternated cards -- configurable at the website level. Pagination is configurable with a "Load More" button alternative to traditional page-based pagination. Category filtering allows visitors to browse posts by topic. Blog content is preserved when switching website templates, ensuring posts survive design changes. Blog Migration (WEB-3.3.3) provides import tools to bring in existing blog content from other platforms, preserving post titles, body content, images, and publication dates through a URL-based import mechanism.

## Components

### Domain Layer

**BlogPost** (`Anansi.Domain.Entities.Website.BlogPost`) -- The core blog post entity. Contains `Title`, `Slug` (custom URL), `Excerpt` (summary), `BodyHtml` (rich text content), `FeaturedImageUrl`, `Status` (via `BlogPostStatus` enum: Draft, Published, Scheduled, Archived), `PublishDate`, and `ScheduledPublishDate`. Supports SEO metadata (`MetaTitle`, `MetaDescription`, `OgImageUrl`). Migration tracking via `ImportedFromUrl` and `ImportedAt`. Implements `ITenantEntity`, `ISoftDeletable`, and `IAuditableEntity`.

**BlogCategory** (`Anansi.Domain.Entities.Website.BlogCategory`) -- Represents a content category for organizing posts. Contains `Name`, `Slug`, `Description`, and `SortOrder`. Implements `ITenantEntity` for per-photographer categories.

**BlogPostCategory** (`Anansi.Domain.Entities.Website.BlogPostCategory`) -- Join entity for the many-to-many relationship between `BlogPost` and `BlogCategory`.

**Website** (blog-related properties) -- The `Website` entity holds blog-level configuration: `BlogLayout` (from `BlogLayoutType` enum: Grid, Stacked, AlternatedCards), `BlogPostsPerPage`, and `BlogLoadMoreEnabled`.

### Application Layer

**CreateBlogPostCommand / CreateBlogPostHandler** -- Creates a new blog post. Validates the blog post limit for Free-tier users (max 5). Generates a unique slug from the title if not provided. Handles category assignments through the `BlogPostCategory` join entity. Supports setting `ScheduledPublishDate` for future publication.

**UpdateBlogPostCommand / UpdateBlogPostHandler** -- Updates post properties including title, body, slug, excerpt, featured image, categories, status, and publication date. Re-validates slug uniqueness when changed.

**DuplicateBlogPostCommand / DuplicateBlogPostHandler** -- Creates a copy of an existing post with a modified title (e.g., "Copy of Original Title") and a new slug. The duplicate starts in Draft status regardless of the original's status. Category assignments are duplicated.

**DeleteBlogPostCommand / DeleteBlogPostHandler** -- Soft-deletes a blog post and removes its category associations.

**ListBlogPostsQuery / ListBlogPostsHandler** -- Returns paginated blog posts for a website with optional `BlogPostStatus` and `categoryId` filters. Returns `PagedList<BlogPostDto>` supporting both traditional pagination and the "Load More" pattern.

**ImportBlogPostCommand / ImportBlogPostHandler** -- Imports a blog post from an external URL. Fetches content, extracts title and body, downloads and re-hosts images, sets `ImportedFromUrl` and `ImportedAt` for tracking provenance. Creates the post in Draft status for review before publishing.

**CreateBlogCategoryCommand / CreateBlogCategoryHandler** -- Creates a new category with name, slug, and description.

**DeleteBlogCategoryCommand / DeleteBlogCategoryHandler** -- Deletes a category and removes all `BlogPostCategory` associations. Does not delete the posts themselves.

**ListBlogCategoriesQuery / ListBlogCategoriesHandler** -- Returns all categories for the current photographer ordered by `SortOrder`.

**PublishScheduledPostsJob** -- Background job (not a MediatR handler) that runs periodically to find posts with `Status == Scheduled` and `ScheduledPublishDate <= DateTime.UtcNow`, transitioning them to Published status.

### Infrastructure Layer

**EF Core Configurations** -- `BlogPost` configuration defines indexes on `(WebsiteId, Slug)` for uniqueness, `(WebsiteId, Status, PublishDate)` for listing queries, and `(ScheduledPublishDate)` for the scheduled publishing job. `BlogPostCategory` uses a composite key on `(BlogPostId, BlogCategoryId)`.

**BlogMigrationService** -- Infrastructure service implementing `IBlogMigrationService` that handles fetching external blog content, parsing HTML, extracting images, re-uploading them to Anansi storage, and rewriting image URLs in the post body.

### API Layer

**BlogController** (`api/websites/{websiteId}/blog`) -- Full CRUD for blog posts and categories. Endpoints include `GET posts` (paginated listing with filters), `POST posts` (create), `PUT posts/{id}` (update), `POST posts/{id}/duplicate` (duplicate), `DELETE posts/{id}` (soft-delete), `POST posts/import` (migration), `GET categories`, `POST categories`, and `DELETE categories/{id}`.

## Class Diagrams

### Domain Layer -- Blog Entities

![Domain Layer -- Blog Entities](domain-layer-blog-entities.png)

### Application Layer -- Blog Commands & Queries

![Application Layer -- Blog Commands & Queries](application-layer-blog-commands-queries.png)

### Application Layer -- Category Management

![Application Layer -- Category Management](application-layer-category-management.png)

### API Layer -- BlogController

![API Layer -- BlogController](api-layer-blogcontroller.png)

## Sequence Diagrams

### Create a Blog Post (WEB-3.3.1)

![Create a Blog Post (WEB-3.3.1)](create-a-blog-post-web-3-3-1.png)

### Duplicate a Blog Post (WEB-3.3.1)

![Duplicate a Blog Post (WEB-3.3.1)](duplicate-a-blog-post-web-3-3-1.png)

### List Blog Posts with Pagination and Filters (WEB-3.3.2)

![List Blog Posts with Pagination and Filters (WEB-3.3.2)](list-blog-posts-with-pagination-and-filters-web-3-3-2.png)

### Import Blog Post from External Platform (WEB-3.3.3)

![Import Blog Post from External Platform (WEB-3.3.3)](import-blog-post-from-external-platform-web-3-3-3.png)

### Publish Scheduled Posts (Background Job)

![Publish Scheduled Posts (Background Job)](publish-scheduled-posts-background-job.png)
