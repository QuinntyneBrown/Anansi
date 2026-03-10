using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Pages;

/// <summary>
/// WEB-3.2.1 - Page Management: add pages with type, slug, navigation ordering.
/// </summary>
public record CreatePageCommand(
    Guid WebsiteId,
    string Title,
    string Slug,
    WebsitePageType PageType,
    bool ShowInNavigation = true,
    string? PagePassword = null,
    string? MetaTitle = null,
    string? MetaDescription = null,
    string? OgImageUrl = null) : IRequest<Result<WebsitePageDto>>;

public class CreatePageValidator : AbstractValidator<CreatePageCommand>
{
    public CreatePageValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches(@"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")
            .WithMessage("Slug must be lowercase alphanumeric with optional hyphens.");
    }
}

public class CreatePageHandler : IRequestHandler<CreatePageCommand, Result<WebsitePageDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsitePageDto>> Handle(CreatePageCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsitePageDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);

        if (website is null)
            return Result<WebsitePageDto>.NotFound("Website not found");

        // Check slug uniqueness within website
        var slugExists = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .AnyAsync(p => p.WebsiteId == request.WebsiteId && p.Slug == request.Slug, ct);
        if (slugExists)
            return Result<WebsitePageDto>.Failure("A page with this slug already exists");

        var maxOrder = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .Where(p => p.WebsiteId == request.WebsiteId)
            .MaxAsync(p => (int?)p.SortOrder, ct) ?? 0;

        var page = new Domain.Entities.Website.WebsitePage
        {
            PhotographerId = photographerId.Value,
            WebsiteId = request.WebsiteId,
            Title = request.Title,
            Slug = request.Slug,
            PageType = request.PageType,
            SortOrder = maxOrder + 1,
            ShowInNavigation = request.ShowInNavigation,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            OgImageUrl = request.OgImageUrl
        };

        if (request.PagePassword != null)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(request.PagePassword));
            page.PagePasswordHash = Convert.ToBase64String(bytes);
        }

        _db.Set<Domain.Entities.Website.WebsitePage>().Add(page);
        await _db.SaveChangesAsync(ct);

        return Result<WebsitePageDto>.Success(MapToDto(page));
    }

    private static WebsitePageDto MapToDto(Domain.Entities.Website.WebsitePage p) => new(
        p.Id, p.WebsiteId, p.Title, p.Slug, p.PageType, p.SortOrder,
        p.IsVisible, p.ShowInNavigation, p.PagePasswordHash != null,
        p.MetaTitle, p.MetaDescription, p.OgImageUrl, p.CreatedAt, p.UpdatedAt);
}
