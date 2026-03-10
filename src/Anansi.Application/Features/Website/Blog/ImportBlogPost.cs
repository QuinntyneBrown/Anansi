using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

/// <summary>
/// WEB-3.3.3 - Blog Migration: import existing blog content preserving title, body, images, dates.
/// </summary>
public record ImportBlogPostCommand(
    Guid WebsiteId,
    string Title,
    string BodyHtml,
    string? Slug,
    string? FeaturedImageUrl,
    DateTime? OriginalPublishDate,
    string ImportedFromUrl) : IRequest<Result<BlogPostDto>>;

public class ImportBlogPostValidator : AbstractValidator<ImportBlogPostCommand>
{
    public ImportBlogPostValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BodyHtml).NotEmpty();
        RuleFor(x => x.ImportedFromUrl).NotEmpty().MaximumLength(2048);
    }
}

public class ImportBlogPostHandler : IRequestHandler<ImportBlogPostCommand, Result<BlogPostDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ImportBlogPostHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BlogPostDto>> Handle(ImportBlogPostCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BlogPostDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);
        if (website is null)
            return Result<BlogPostDto>.NotFound("Website not found");

        var slug = request.Slug ?? System.Text.RegularExpressions.Regex.Replace(
            request.Title.ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');

        // Ensure unique slug
        var baseSlug = slug;
        var counter = 1;
        while (await _db.Set<Domain.Entities.Website.BlogPost>()
            .AnyAsync(p => p.WebsiteId == request.WebsiteId && p.Slug == slug, ct))
        {
            slug = $"{baseSlug}-{counter++}";
        }

        var post = new Domain.Entities.Website.BlogPost
        {
            PhotographerId = photographerId.Value,
            WebsiteId = request.WebsiteId,
            Title = request.Title,
            Slug = slug,
            BodyHtml = request.BodyHtml,
            FeaturedImageUrl = request.FeaturedImageUrl,
            Status = BlogPostStatus.Draft,
            PublishDate = request.OriginalPublishDate,
            ImportedFromUrl = request.ImportedFromUrl,
            ImportedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId,
            UpdatedBy = _currentUser.UserId
        };

        _db.Set<Domain.Entities.Website.BlogPost>().Add(post);
        await _db.SaveChangesAsync(ct);

        return Result<BlogPostDto>.Success(new BlogPostDto(
            post.Id, post.WebsiteId, post.Title, post.Slug, post.Excerpt, post.BodyHtml,
            post.FeaturedImageUrl, post.Status, post.PublishDate, post.ScheduledPublishDate,
            post.MetaTitle, post.MetaDescription, post.OgImageUrl, post.ImportedFromUrl,
            new List<BlogCategoryDto>(), post.CreatedAt, post.UpdatedAt));
    }
}
