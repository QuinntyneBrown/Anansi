using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Typography;

/// <summary>
/// WEB-3.4.1 - Font System: 1000+ fonts, custom upload (WOFF, WOFF2, TTF, OTF).
/// </summary>
public record UploadCustomFontCommand(
    string FontFamily,
    string FileUrl,
    string FileFormat,
    string? FontWeight,
    string? FontStyle) : IRequest<Result<WebsiteFontDto>>;

public class UploadCustomFontValidator : AbstractValidator<UploadCustomFontCommand>
{
    private static readonly string[] AllowedFormats = ["woff", "woff2", "ttf", "otf"];

    public UploadCustomFontValidator()
    {
        RuleFor(x => x.FontFamily).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FileUrl).NotEmpty().MaximumLength(2048);
        RuleFor(x => x.FileFormat).NotEmpty().Must(f => AllowedFormats.Contains(f.ToLowerInvariant()))
            .WithMessage("Font format must be woff, woff2, ttf, or otf");
    }
}

public class UploadCustomFontHandler : IRequestHandler<UploadCustomFontCommand, Result<WebsiteFontDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UploadCustomFontHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsiteFontDto>> Handle(UploadCustomFontCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsiteFontDto>.Failure("Not authenticated", 401);

        var font = new Domain.Entities.Website.WebsiteFont
        {
            PhotographerId = photographerId.Value,
            FontFamily = request.FontFamily,
            FileUrl = request.FileUrl,
            FileFormat = request.FileFormat.ToLowerInvariant(),
            FontWeight = request.FontWeight,
            FontStyle = request.FontStyle
        };

        _db.Set<Domain.Entities.Website.WebsiteFont>().Add(font);
        await _db.SaveChangesAsync(ct);

        return Result<WebsiteFontDto>.Success(new WebsiteFontDto(
            font.Id, font.FontFamily, font.FileUrl, font.FileFormat, font.FontWeight, font.FontStyle));
    }
}

public record ListCustomFontsQuery : IRequest<Result<List<WebsiteFontDto>>>;

public class ListCustomFontsHandler : IRequestHandler<ListCustomFontsQuery, Result<List<WebsiteFontDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListCustomFontsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<WebsiteFontDto>>> Handle(ListCustomFontsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<WebsiteFontDto>>.Failure("Not authenticated", 401);

        var fonts = await _db.Set<Domain.Entities.Website.WebsiteFont>()
            .Where(f => f.PhotographerId == photographerId.Value)
            .OrderBy(f => f.FontFamily)
            .Select(f => new WebsiteFontDto(f.Id, f.FontFamily, f.FileUrl, f.FileFormat, f.FontWeight, f.FontStyle))
            .ToListAsync(ct);

        return Result<List<WebsiteFontDto>>.Success(fonts);
    }
}

public record DeleteCustomFontCommand(Guid FontId) : IRequest<Result>;

public class DeleteCustomFontHandler : IRequestHandler<DeleteCustomFontCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteCustomFontHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteCustomFontCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var font = await _db.Set<Domain.Entities.Website.WebsiteFont>()
            .FirstOrDefaultAsync(f => f.Id == request.FontId && f.PhotographerId == photographerId.Value, ct);
        if (font is null)
            return Result.NotFound("Font not found");

        _db.Set<Domain.Entities.Website.WebsiteFont>().Remove(font);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
