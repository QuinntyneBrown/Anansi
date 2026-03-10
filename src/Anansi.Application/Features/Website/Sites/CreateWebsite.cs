using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Sites;

/// <summary>
/// WEB-3.1.3 - Draft Sites: create a new website (draft by default, max 10 drafts).
/// </summary>
public record CreateWebsiteCommand(
    string Name,
    string? Description,
    Guid? TemplateId,
    string Subdomain) : IRequest<Result<WebsiteDto>>;

public class CreateWebsiteValidator : AbstractValidator<CreateWebsiteCommand>
{
    public CreateWebsiteValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Subdomain).NotEmpty().MaximumLength(100)
            .Matches(@"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")
            .WithMessage("Subdomain must be lowercase alphanumeric with optional hyphens.");
    }
}

public class CreateWebsiteHandler : IRequestHandler<CreateWebsiteCommand, Result<WebsiteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateWebsiteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsiteDto>> Handle(CreateWebsiteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsiteDto>.Failure("Not authenticated", 401);

        // WEB-3.1.3: max 10 simultaneous draft sites
        var draftCount = await _db.Set<Domain.Entities.Website.Website>()
            .CountAsync(w => w.PhotographerId == photographerId.Value
                && w.Status == Domain.Enums.WebsiteStatus.Draft, ct);

        if (draftCount >= 10)
            return Result<WebsiteDto>.Failure("Maximum of 10 draft sites allowed");

        // Check subdomain uniqueness
        var subdomainExists = await _db.Set<Domain.Entities.Website.Website>()
            .AnyAsync(w => w.Subdomain == request.Subdomain, ct);

        if (subdomainExists)
            return Result<WebsiteDto>.Failure("Subdomain is already taken");

        // If template specified, verify it exists
        if (request.TemplateId.HasValue)
        {
            var templateExists = await _db.Set<Domain.Entities.Website.WebsiteTemplate>()
                .AnyAsync(t => t.Id == request.TemplateId.Value && t.IsActive, ct);
            if (!templateExists)
                return Result<WebsiteDto>.Failure("Template not found");
        }

        var website = new Domain.Entities.Website.Website
        {
            PhotographerId = photographerId.Value,
            Name = request.Name,
            Description = request.Description,
            TemplateId = request.TemplateId,
            Subdomain = request.Subdomain,
            Status = Domain.Enums.WebsiteStatus.Draft,
            SslEnabled = true,
            RightClickProtectionEnabled = true,
            CreatedBy = _currentUser.UserId,
            UpdatedBy = _currentUser.UserId
        };

        _db.Set<Domain.Entities.Website.Website>().Add(website);
        await _db.SaveChangesAsync(ct);

        var dto = MapToDto(website);
        return Result<WebsiteDto>.Success(dto);
    }

    private static WebsiteDto MapToDto(Domain.Entities.Website.Website w) => new(
        w.Id, w.PhotographerId, w.Name, w.Description, w.Status,
        w.TemplateId, w.PrimaryFontFamily, w.SecondaryFontFamily, w.CustomFontUrl,
        w.ColorPaletteJson, w.AnimationType, w.AnimationsEnabled,
        w.Subdomain, w.SslEnabled, w.CustomDomain, w.CustomDomainVerified,
        w.RightClickProtectionEnabled, w.DefaultMetaTitle, w.DefaultMetaDescription,
        w.DefaultOgImageUrl, w.BuiltInAnalyticsEnabled,
        w.GoogleAnalyticsMeasurementId, w.FacebookPixelId,
        w.BlogLayout, w.BlogPostsPerPage, w.BlogLoadMoreEnabled,
        w.SitePasswordHash != null, w.CreatedAt, w.UpdatedAt);
}
