using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Seo;

/// <summary>
/// WEB-3.5.4 - URL Redirects: create, list, update, delete 301/302 redirects.
/// </summary>
public record CreateUrlRedirectCommand(
    Guid WebsiteId,
    string SourcePath,
    string DestinationUrl,
    RedirectType RedirectType) : IRequest<Result<UrlRedirectDto>>;

public class CreateUrlRedirectValidator : AbstractValidator<CreateUrlRedirectCommand>
{
    public CreateUrlRedirectValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.SourcePath).NotEmpty().MaximumLength(2048);
        RuleFor(x => x.DestinationUrl).NotEmpty().MaximumLength(2048);
    }
}

public class CreateUrlRedirectHandler : IRequestHandler<CreateUrlRedirectCommand, Result<UrlRedirectDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateUrlRedirectHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<UrlRedirectDto>> Handle(CreateUrlRedirectCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<UrlRedirectDto>.Failure("Not authenticated", 401);

        var redirect = new Domain.Entities.Website.UrlRedirect
        {
            PhotographerId = photographerId.Value,
            WebsiteId = request.WebsiteId,
            SourcePath = request.SourcePath,
            DestinationUrl = request.DestinationUrl,
            RedirectType = request.RedirectType,
            IsActive = true
        };

        _db.Set<Domain.Entities.Website.UrlRedirect>().Add(redirect);
        await _db.SaveChangesAsync(ct);

        return Result<UrlRedirectDto>.Success(new UrlRedirectDto(
            redirect.Id, redirect.WebsiteId, redirect.SourcePath, redirect.DestinationUrl,
            redirect.RedirectType, redirect.IsActive, redirect.CreatedAt));
    }
}

public record ListUrlRedirectsQuery(Guid WebsiteId) : IRequest<Result<List<UrlRedirectDto>>>;

public class ListUrlRedirectsHandler : IRequestHandler<ListUrlRedirectsQuery, Result<List<UrlRedirectDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListUrlRedirectsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<UrlRedirectDto>>> Handle(ListUrlRedirectsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<UrlRedirectDto>>.Failure("Not authenticated", 401);

        var redirects = await _db.Set<Domain.Entities.Website.UrlRedirect>()
            .Where(r => r.WebsiteId == request.WebsiteId && r.PhotographerId == photographerId.Value)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new UrlRedirectDto(r.Id, r.WebsiteId, r.SourcePath, r.DestinationUrl, r.RedirectType, r.IsActive, r.CreatedAt))
            .ToListAsync(ct);

        return Result<List<UrlRedirectDto>>.Success(redirects);
    }
}

public record UpdateUrlRedirectCommand(
    Guid RedirectId,
    string? SourcePath,
    string? DestinationUrl,
    RedirectType? RedirectType,
    bool? IsActive) : IRequest<Result<UrlRedirectDto>>;

public class UpdateUrlRedirectHandler : IRequestHandler<UpdateUrlRedirectCommand, Result<UrlRedirectDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateUrlRedirectHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<UrlRedirectDto>> Handle(UpdateUrlRedirectCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<UrlRedirectDto>.Failure("Not authenticated", 401);

        var redirect = await _db.Set<Domain.Entities.Website.UrlRedirect>()
            .FirstOrDefaultAsync(r => r.Id == request.RedirectId && r.PhotographerId == photographerId.Value, ct);
        if (redirect is null)
            return Result<UrlRedirectDto>.NotFound("Redirect not found");

        if (request.SourcePath != null) redirect.SourcePath = request.SourcePath;
        if (request.DestinationUrl != null) redirect.DestinationUrl = request.DestinationUrl;
        if (request.RedirectType.HasValue) redirect.RedirectType = request.RedirectType.Value;
        if (request.IsActive.HasValue) redirect.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync(ct);

        return Result<UrlRedirectDto>.Success(new UrlRedirectDto(
            redirect.Id, redirect.WebsiteId, redirect.SourcePath, redirect.DestinationUrl,
            redirect.RedirectType, redirect.IsActive, redirect.CreatedAt));
    }
}

public record DeleteUrlRedirectCommand(Guid RedirectId) : IRequest<Result>;

public class DeleteUrlRedirectHandler : IRequestHandler<DeleteUrlRedirectCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteUrlRedirectHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteUrlRedirectCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var redirect = await _db.Set<Domain.Entities.Website.UrlRedirect>()
            .FirstOrDefaultAsync(r => r.Id == request.RedirectId && r.PhotographerId == photographerId.Value, ct);
        if (redirect is null)
            return Result.NotFound("Redirect not found");

        _db.Set<Domain.Entities.Website.UrlRedirect>().Remove(redirect);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
