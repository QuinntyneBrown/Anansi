using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

/// <summary>
/// WEB-3.3.1 - Post duplication must be supported.
/// </summary>
public record DuplicateBlogPostCommand(Guid BlogPostId) : IRequest<Result<BlogPostDto>>;

public class DuplicateBlogPostHandler : IRequestHandler<DuplicateBlogPostCommand, Result<BlogPostDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DuplicateBlogPostHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BlogPostDto>> Handle(DuplicateBlogPostCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BlogPostDto>.Failure("Not authenticated", 401);

        var source = await _db.Set<Domain.Entities.Website.BlogPost>()
            .FirstOrDefaultAsync(p => p.Id == request.BlogPostId && p.PhotographerId == photographerId.Value, ct);
        if (source is null)
            return Result<BlogPostDto>.NotFound("Blog post not found");

        var newSlug = $"{source.Slug}-copy-{DateTime.UtcNow.Ticks}";

        var copy = new Domain.Entities.Website.BlogPost
        {
            PhotographerId = photographerId.Value,
            WebsiteId = source.WebsiteId,
            Title = $"{source.Title} (Copy)",
            Slug = newSlug,
            Excerpt = source.Excerpt,
            BodyHtml = source.BodyHtml,
            FeaturedImageUrl = source.FeaturedImageUrl,
            Status = BlogPostStatus.Draft,
            MetaTitle = source.MetaTitle,
            MetaDescription = source.MetaDescription,
            OgImageUrl = source.OgImageUrl,
            CreatedBy = _currentUser.UserId,
            UpdatedBy = _currentUser.UserId
        };

        _db.Set<Domain.Entities.Website.BlogPost>().Add(copy);

        // Copy categories
        var sourceCats = await _db.Set<Domain.Entities.Website.BlogPostCategory>()
            .Where(bpc => bpc.BlogPostId == source.Id).ToListAsync(ct);

        foreach (var sc in sourceCats)
        {
            _db.Set<Domain.Entities.Website.BlogPostCategory>().Add(new Domain.Entities.Website.BlogPostCategory
            {
                BlogPostId = copy.Id,
                BlogCategoryId = sc.BlogCategoryId
            });
        }

        await _db.SaveChangesAsync(ct);

        var categories = await _db.Set<Domain.Entities.Website.BlogPostCategory>()
            .Where(bpc => bpc.BlogPostId == copy.Id)
            .Select(bpc => new BlogCategoryDto(bpc.BlogCategory.Id, bpc.BlogCategory.Name, bpc.BlogCategory.Slug, bpc.BlogCategory.Description, bpc.BlogCategory.SortOrder))
            .ToListAsync(ct);

        return Result<BlogPostDto>.Success(new BlogPostDto(
            copy.Id, copy.WebsiteId, copy.Title, copy.Slug, copy.Excerpt, copy.BodyHtml,
            copy.FeaturedImageUrl, copy.Status, copy.PublishDate, copy.ScheduledPublishDate,
            copy.MetaTitle, copy.MetaDescription, copy.OgImageUrl, copy.ImportedFromUrl,
            categories, copy.CreatedAt, copy.UpdatedAt));
    }
}
