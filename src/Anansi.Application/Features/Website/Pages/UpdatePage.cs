using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Pages;

/// <summary>
/// WEB-3.2.1 - Page Management: update pages, reorder navigation, password protect.
/// WEB-3.5.1/3.5.3/3.5.5 - SEO: meta title, description, OG image per page.
/// </summary>
public record UpdatePageCommand(
    Guid PageId,
    string? Title,
    string? Slug,
    int? SortOrder,
    bool? IsVisible,
    bool? ShowInNavigation,
    string? PagePassword,
    bool? ClearPassword,
    string? MetaTitle,
    string? MetaDescription,
    string? OgImageUrl) : IRequest<Result<WebsitePageDto>>;

public class UpdatePageValidator : AbstractValidator<UpdatePageCommand>
{
    public UpdatePageValidator()
    {
        RuleFor(x => x.PageId).NotEmpty();
        RuleFor(x => x.Title).MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.Slug).MaximumLength(200)
            .Matches(@"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")
            .When(x => x.Slug != null);
    }
}

public class UpdatePageHandler : IRequestHandler<UpdatePageCommand, Result<WebsitePageDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdatePageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsitePageDto>> Handle(UpdatePageCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsitePageDto>.Failure("Not authenticated", 401);

        var page = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.PhotographerId == photographerId.Value, ct);

        if (page is null)
            return Result<WebsitePageDto>.NotFound("Page not found");

        if (request.Slug != null && request.Slug != page.Slug)
        {
            var slugExists = await _db.Set<Domain.Entities.Website.WebsitePage>()
                .AnyAsync(p => p.WebsiteId == page.WebsiteId && p.Slug == request.Slug && p.Id != page.Id, ct);
            if (slugExists)
                return Result<WebsitePageDto>.Failure("A page with this slug already exists");
            page.Slug = request.Slug;
        }

        if (request.Title != null) page.Title = request.Title;
        if (request.SortOrder.HasValue) page.SortOrder = request.SortOrder.Value;
        if (request.IsVisible.HasValue) page.IsVisible = request.IsVisible.Value;
        if (request.ShowInNavigation.HasValue) page.ShowInNavigation = request.ShowInNavigation.Value;
        if (request.MetaTitle != null) page.MetaTitle = request.MetaTitle;
        if (request.MetaDescription != null) page.MetaDescription = request.MetaDescription;
        if (request.OgImageUrl != null) page.OgImageUrl = request.OgImageUrl;

        if (request.ClearPassword == true)
            page.PagePasswordHash = null;
        else if (request.PagePassword != null)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(request.PagePassword));
            page.PagePasswordHash = Convert.ToBase64String(bytes);
        }

        await _db.SaveChangesAsync(ct);
        return Result<WebsitePageDto>.Success(MapToDto(page));
    }

    private static WebsitePageDto MapToDto(Domain.Entities.Website.WebsitePage p) => new(
        p.Id, p.WebsiteId, p.Title, p.Slug, p.PageType, p.SortOrder,
        p.IsVisible, p.ShowInNavigation, p.PagePasswordHash != null,
        p.MetaTitle, p.MetaDescription, p.OgImageUrl, p.CreatedAt, p.UpdatedAt);
}
