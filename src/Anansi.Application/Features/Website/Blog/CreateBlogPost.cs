using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

/// <summary>
/// WEB-3.3.1 - Blog Post Management: create with title, body, images, URL, categories, scheduling.
/// </summary>
public record CreateBlogPostCommand(
    Guid WebsiteId,
    string Title,
    string? Slug,
    string? Excerpt,
    string BodyHtml,
    string? FeaturedImageUrl,
    BlogPostStatus Status,
    DateTime? ScheduledPublishDate,
    string? MetaTitle,
    string? MetaDescription,
    string? OgImageUrl,
    List<Guid>? CategoryIds) : IRequest<Result<BlogPostDto>>;

public class CreateBlogPostValidator : AbstractValidator<CreateBlogPostCommand>
{
    public CreateBlogPostValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BodyHtml).NotEmpty();
    }
}

public class CreateBlogPostHandler : IRequestHandler<CreateBlogPostCommand, Result<BlogPostDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBlogPostHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BlogPostDto>> Handle(CreateBlogPostCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BlogPostDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);
        if (website is null)
            return Result<BlogPostDto>.NotFound("Website not found");

        var slug = request.Slug ?? GenerateSlug(request.Title);

        var slugExists = await _db.Set<Domain.Entities.Website.BlogPost>()
            .AnyAsync(p => p.WebsiteId == request.WebsiteId && p.Slug == slug, ct);
        if (slugExists)
            return Result<BlogPostDto>.Failure("A blog post with this slug already exists");

        var post = new Domain.Entities.Website.BlogPost
        {
            PhotographerId = photographerId.Value,
            WebsiteId = request.WebsiteId,
            Title = request.Title,
            Slug = slug,
            Excerpt = request.Excerpt,
            BodyHtml = request.BodyHtml,
            FeaturedImageUrl = request.FeaturedImageUrl,
            Status = request.Status,
            ScheduledPublishDate = request.ScheduledPublishDate,
            PublishDate = request.Status == BlogPostStatus.Published ? DateTime.UtcNow : null,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            OgImageUrl = request.OgImageUrl,
            CreatedBy = _currentUser.UserId,
            UpdatedBy = _currentUser.UserId
        };

        _db.Set<Domain.Entities.Website.BlogPost>().Add(post);

        // Add categories
        if (request.CategoryIds != null)
        {
            foreach (var catId in request.CategoryIds)
            {
                _db.Set<Domain.Entities.Website.BlogPostCategory>().Add(new Domain.Entities.Website.BlogPostCategory
                {
                    BlogPostId = post.Id,
                    BlogCategoryId = catId
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        var categories = await _db.Set<Domain.Entities.Website.BlogPostCategory>()
            .Where(bpc => bpc.BlogPostId == post.Id)
            .Select(bpc => new BlogCategoryDto(bpc.BlogCategory.Id, bpc.BlogCategory.Name, bpc.BlogCategory.Slug, bpc.BlogCategory.Description, bpc.BlogCategory.SortOrder))
            .ToListAsync(ct);

        return Result<BlogPostDto>.Success(MapToDto(post, categories));
    }

    private static string GenerateSlug(string title) =>
        System.Text.RegularExpressions.Regex.Replace(title.ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');

    private static BlogPostDto MapToDto(Domain.Entities.Website.BlogPost p, List<BlogCategoryDto> cats) => new(
        p.Id, p.WebsiteId, p.Title, p.Slug, p.Excerpt, p.BodyHtml, p.FeaturedImageUrl,
        p.Status, p.PublishDate, p.ScheduledPublishDate, p.MetaTitle, p.MetaDescription,
        p.OgImageUrl, p.ImportedFromUrl, cats, p.CreatedAt, p.UpdatedAt);
}
