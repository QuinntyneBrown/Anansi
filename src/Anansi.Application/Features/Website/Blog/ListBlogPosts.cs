using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

/// <summary>
/// WEB-3.3.2 - Blog Layouts: pagination, category filtering.
/// </summary>
public record ListBlogPostsQuery(
    Guid WebsiteId,
    BlogPostStatus? Status = null,
    Guid? CategoryId = null,
    int Page = 1,
    int PageSize = 10) : IRequest<Result<PagedList<BlogPostDto>>>;

public class ListBlogPostsHandler : IRequestHandler<ListBlogPostsQuery, Result<PagedList<BlogPostDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListBlogPostsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<BlogPostDto>>> Handle(ListBlogPostsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<PagedList<BlogPostDto>>.Failure("Not authenticated", 401);

        var query = _db.Set<Domain.Entities.Website.BlogPost>()
            .Where(p => p.WebsiteId == request.WebsiteId && p.PhotographerId == photographerId.Value);

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.BlogPostCategories.Any(bpc => bpc.BlogCategoryId == request.CategoryId.Value));

        var total = await query.CountAsync(ct);

        var posts = await query
            .OrderByDescending(p => p.PublishDate ?? p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new BlogPostDto(
                p.Id, p.WebsiteId, p.Title, p.Slug, p.Excerpt, p.BodyHtml, p.FeaturedImageUrl,
                p.Status, p.PublishDate, p.ScheduledPublishDate, p.MetaTitle, p.MetaDescription,
                p.OgImageUrl, p.ImportedFromUrl,
                p.BlogPostCategories.Select(bpc => new BlogCategoryDto(
                    bpc.BlogCategory.Id, bpc.BlogCategory.Name, bpc.BlogCategory.Slug,
                    bpc.BlogCategory.Description, bpc.BlogCategory.SortOrder)).ToList(),
                p.CreatedAt, p.UpdatedAt))
            .ToListAsync(ct);

        return Result<PagedList<BlogPostDto>>.Success(new PagedList<BlogPostDto>(posts, total, request.Page, request.PageSize));
    }
}
