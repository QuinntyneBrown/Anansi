using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Interac;

/// <summary>
/// Configure Interac e-Transfer email on the photographer's profile (INT-20.2.1).
/// </summary>
public record ConfigureInteracCommand(string InteracEmail) : IRequest<Result>;

public class ConfigureInteracValidator : AbstractValidator<ConfigureInteracCommand>
{
    public ConfigureInteracValidator()
    {
        RuleFor(x => x.InteracEmail).NotEmpty().EmailAddress();
    }
}

public class ConfigureInteracHandler : IRequestHandler<ConfigureInteracCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ConfigureInteracHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfigureInteracCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Failure("Not authenticated.", 401);

        var photographer = await _db.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, ct);
        if (photographer is null)
            return Result.NotFound("Photographer not found.");

        photographer.InteracEmail = request.InteracEmail;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}

/// <summary>
/// Get Interac e-Transfer configuration (INT-20.2.1).
/// </summary>
public record GetInteracConfigQuery() : IRequest<Result<InteracConfigDto>>;

public class GetInteracConfigHandler : IRequestHandler<GetInteracConfigQuery, Result<InteracConfigDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetInteracConfigHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<InteracConfigDto>> Handle(GetInteracConfigQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<InteracConfigDto>.Forbidden();

        var photographer = await _db.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, ct);
        if (photographer is null)
            return Result<InteracConfigDto>.NotFound("Photographer not found.");

        return Result<InteracConfigDto>.Success(new InteracConfigDto(
            photographer.InteracEmail,
            !string.IsNullOrWhiteSpace(photographer.InteracEmail)));
    }
}
