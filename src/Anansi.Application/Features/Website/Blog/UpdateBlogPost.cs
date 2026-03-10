using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

/// <summary>
/// WEB-3.3.1 - Blog Post Management: edit, schedule, duplicate.
/// </summary>
public record UpdateBlogPostCommand(
    Guid BlogPostId,
    string? Title,
    string? Slug,
    string? Excerpt,
    string? BodyHtml,
    string? FeaturedImageUrl,
    BlogPostStatus? Status,
    DateTime? ScheduledPublishDate,
    string? MetaTitle,
    string? MetaDescription,
    string? OgImageUrl,
    List<Guid>? CategoryIds) : IRequest<Result<BlogPostDto>>;

public class UpdateBlogPostValidator : AbstractValidator<UpdateBlogPostCommand>
{
    public UpdateBlogPostValidator()
    {
        RuleFor(x => x.BlogPostId).NotEmpty();
        RuleFor(x => x.Title).MaximumLength(500).When(x => x.Title != null);
    }
}

public class UpdateBlogPostHandler : IRequestHandler<UpdateBlogPostCommand, Result<BlogPostDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateBlogPostHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BlogPostDto>> Handle(UpdateBlogPostCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BlogPostDto>.Failure("Not authenticated", 401);

        var post = await _db.Set<Domain.Entities.Website.BlogPost>()
            .FirstOrDefaultAsync(p => p.Id == request.BlogPostId && p.PhotographerId == photographerId.Value, ct);
        if (post is null)
            return Result<BlogPostDto>.NotFound("Blog post not found");

        if (request.Slug != null && request.Slug != post.Slug)
        {
            var slugExists = await _db.Set<Domain.Entities.Website.BlogPost>()
                .AnyAsync(p => p.WebsiteId == post.WebsiteId && p.Slug == request.Slug && p.Id != post.Id, ct);
            if (slugExists)
                return Result<BlogPostDto>.Failure("A blog post with this slug already exists");
            post.Slug = request.Slug;
        }

        if (request.Title != null) post.Title = request.Title;
        if (request.Excerpt != null) post.Excerpt = request.Excerpt;
        if (request.BodyHtml != null) post.BodyHtml = request.BodyHtml;
        if (request.FeaturedImageUrl != null) post.FeaturedImageUrl = request.FeaturedImageUrl;
        if (request.MetaTitle != null) post.MetaTitle = request.MetaTitle;
        if (request.MetaDescription != null) post.MetaDescription = request.MetaDescription;
        if (request.OgImageUrl != null) post.OgImageUrl = request.OgImageUrl;

        if (request.Status.HasValue)
        {
            if (request.Status == BlogPostStatus.Published && post.PublishDate is null)
                post.PublishDate = DateTime.UtcNow;
            post.Status = request.Status.Value;
        }
        if (request.ScheduledPublishDate.HasValue)
            post.ScheduledPublishDate = request.ScheduledPublishDate.Value;

        // Update categories
        if (request.CategoryIds != null)
        {
            var existing = await _db.Set<Domain.Entities.Website.BlogPostCategory>()
                .Where(bpc => bpc.BlogPostId == post.Id).ToListAsync(ct);
            foreach (var e in existing)
                _db.Set<Domain.Entities.Website.BlogPostCategory>().Remove(e);

            foreach (var catId in request.CategoryIds)
            {
                _db.Set<Domain.Entities.Website.BlogPostCategory>().Add(new Domain.Entities.Website.BlogPostCategory
                {
                    BlogPostId = post.Id,
                    BlogCategoryId = catId
                });
            }
        }

        post.UpdatedBy = _currentUser.UserId;
        await _db.SaveChangesAsync(ct);

        var categories = await _db.Set<Domain.Entities.Website.BlogPostCategory>()
            .Where(bpc => bpc.BlogPostId == post.Id)
            .Select(bpc => new BlogCategoryDto(bpc.BlogCategory.Id, bpc.BlogCategory.Name, bpc.BlogCategory.Slug, bpc.BlogCategory.Description, bpc.BlogCategory.SortOrder))
            .ToListAsync(ct);

        return Result<BlogPostDto>.Success(MapToDto(post, categories));
    }

    private static BlogPostDto MapToDto(Domain.Entities.Website.BlogPost p, List<BlogCategoryDto> cats) => new(
        p.Id, p.WebsiteId, p.Title, p.Slug, p.Excerpt, p.BodyHtml, p.FeaturedImageUrl,
        p.Status, p.PublishDate, p.ScheduledPublishDate, p.MetaTitle, p.MetaDescription,
        p.OgImageUrl, p.ImportedFromUrl, cats, p.CreatedAt, p.UpdatedAt);
}
