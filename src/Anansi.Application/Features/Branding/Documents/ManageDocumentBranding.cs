using Anansi.Application.Common;
using Anansi.Application.DTOs.Branding;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Branding.Documents;

/// <summary>
/// BRD-7.4.1 Document Branding: logo, brand colors, custom header images per document type.
/// BRD-7.4.2 Font Theme: consistent font theme for branded documents and emails.
/// </summary>
public record UpsertDocumentBrandingCommand(
    DocumentType DocumentType,
    string? HeaderImageUrl,
    string? BrandColorHex,
    string? SecondaryColorHex,
    string? FontTheme) : IRequest<Result<DocumentBrandingDto>>;

public class UpsertDocumentBrandingValidator : AbstractValidator<UpsertDocumentBrandingCommand>
{
    public UpsertDocumentBrandingValidator()
    {
        RuleFor(x => x.BrandColorHex)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .When(x => x.BrandColorHex != null)
            .WithMessage("Brand color must be a valid hex color code");
        RuleFor(x => x.SecondaryColorHex)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .When(x => x.SecondaryColorHex != null)
            .WithMessage("Secondary color must be a valid hex color code");
    }
}

public class UpsertDocumentBrandingHandler : IRequestHandler<UpsertDocumentBrandingCommand, Result<DocumentBrandingDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpsertDocumentBrandingHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<DocumentBrandingDto>> Handle(UpsertDocumentBrandingCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<DocumentBrandingDto>.Failure("Not authenticated", 401);

        var branding = await _db.Set<Domain.Entities.Branding.DocumentBranding>()
            .FirstOrDefaultAsync(b => b.PhotographerId == photographerId.Value
                && b.DocumentType == request.DocumentType, ct);

        if (branding is null)
        {
            branding = new Domain.Entities.Branding.DocumentBranding
            {
                PhotographerId = photographerId.Value,
                DocumentType = request.DocumentType,
                HeaderImageUrl = request.HeaderImageUrl,
                BrandColorHex = request.BrandColorHex,
                SecondaryColorHex = request.SecondaryColorHex,
                FontTheme = request.FontTheme
            };
            _db.Set<Domain.Entities.Branding.DocumentBranding>().Add(branding);
        }
        else
        {
            if (request.HeaderImageUrl != null) branding.HeaderImageUrl = request.HeaderImageUrl;
            if (request.BrandColorHex != null) branding.BrandColorHex = request.BrandColorHex;
            if (request.SecondaryColorHex != null) branding.SecondaryColorHex = request.SecondaryColorHex;
            if (request.FontTheme != null) branding.FontTheme = request.FontTheme;
        }

        await _db.SaveChangesAsync(ct);

        return Result<DocumentBrandingDto>.Success(new DocumentBrandingDto(
            branding.Id, branding.DocumentType, branding.HeaderImageUrl,
            branding.BrandColorHex, branding.SecondaryColorHex, branding.FontTheme));
    }
}

public record GetDocumentBrandingQuery(DocumentType DocumentType) : IRequest<Result<DocumentBrandingDto>>;

public class GetDocumentBrandingHandler : IRequestHandler<GetDocumentBrandingQuery, Result<DocumentBrandingDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetDocumentBrandingHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<DocumentBrandingDto>> Handle(GetDocumentBrandingQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<DocumentBrandingDto>.Failure("Not authenticated", 401);

        var branding = await _db.Set<Domain.Entities.Branding.DocumentBranding>()
            .FirstOrDefaultAsync(b => b.PhotographerId == photographerId.Value
                && b.DocumentType == request.DocumentType, ct);

        if (branding is null)
            return Result<DocumentBrandingDto>.NotFound("Document branding not configured");

        return Result<DocumentBrandingDto>.Success(new DocumentBrandingDto(
            branding.Id, branding.DocumentType, branding.HeaderImageUrl,
            branding.BrandColorHex, branding.SecondaryColorHex, branding.FontTheme));
    }
}

public record ListDocumentBrandingsQuery : IRequest<Result<List<DocumentBrandingDto>>>;

public class ListDocumentBrandingsHandler : IRequestHandler<ListDocumentBrandingsQuery, Result<List<DocumentBrandingDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListDocumentBrandingsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<DocumentBrandingDto>>> Handle(ListDocumentBrandingsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<DocumentBrandingDto>>.Failure("Not authenticated", 401);

        var brandings = await _db.Set<Domain.Entities.Branding.DocumentBranding>()
            .Where(b => b.PhotographerId == photographerId.Value)
            .Select(b => new DocumentBrandingDto(b.Id, b.DocumentType, b.HeaderImageUrl,
                b.BrandColorHex, b.SecondaryColorHex, b.FontTheme))
            .ToListAsync(ct);

        return Result<List<DocumentBrandingDto>>.Success(brandings);
    }
}
