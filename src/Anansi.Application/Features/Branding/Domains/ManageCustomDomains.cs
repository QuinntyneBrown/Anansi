using Anansi.Application.Common;
using Anansi.Application.DTOs.Branding;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Branding.Domains;

/// <summary>
/// BRD-7.3.1 Gallery Custom Domain, BRD-7.3.2 Website Custom Domain.
/// SSL auto-provisioned, DNS instructions provided.
/// </summary>
public record CreateCustomDomainCommand(
    string DomainName,
    DomainPurpose Purpose) : IRequest<Result<CustomDomainDto>>;

public class CreateCustomDomainValidator : AbstractValidator<CreateCustomDomainCommand>
{
    public CreateCustomDomainValidator()
    {
        RuleFor(x => x.DomainName).NotEmpty().MaximumLength(500)
            .Matches(@"^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$")
            .WithMessage("Invalid domain name format");
    }
}

public class CreateCustomDomainHandler : IRequestHandler<CreateCustomDomainCommand, Result<CustomDomainDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCustomDomainHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomDomainDto>> Handle(CreateCustomDomainCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<CustomDomainDto>.Failure("Not authenticated", 401);

        var exists = await _db.Set<Domain.Entities.Branding.CustomDomain>()
            .AnyAsync(d => d.DomainName == request.DomainName, ct);
        if (exists)
            return Result<CustomDomainDto>.Failure("Domain is already registered");

        var verificationToken = Guid.NewGuid().ToString("N");

        var domain = new Domain.Entities.Branding.CustomDomain
        {
            PhotographerId = photographerId.Value,
            DomainName = request.DomainName,
            Purpose = request.Purpose,
            IsVerified = false,
            SslStatus = SslStatus.Pending,
            VerificationToken = verificationToken,
            DnsInstructions = GenerateDnsInstructions(request.DomainName, verificationToken, request.Purpose)
        };

        _db.Set<Domain.Entities.Branding.CustomDomain>().Add(domain);
        await _db.SaveChangesAsync(ct);

        return Result<CustomDomainDto>.Success(MapToDto(domain));
    }

    private static string GenerateDnsInstructions(string domainName, string token, DomainPurpose purpose)
    {
        var target = purpose == DomainPurpose.Gallery ? "gallery" : "website";
        return $"To connect {domainName}:\n" +
               $"1. Add a CNAME record pointing to {target}.anansi.com\n" +
               $"2. Add a TXT record with value: anansi-verify={token}\n" +
               $"3. Wait for DNS propagation (up to 48 hours)\n" +
               $"4. SSL will be auto-provisioned once verified.";
    }

    private static CustomDomainDto MapToDto(Domain.Entities.Branding.CustomDomain d) => new(
        d.Id, d.DomainName, d.Purpose, d.IsVerified, d.SslStatus,
        d.SslExpiresAt, d.DnsInstructions, d.VerifiedAt, d.CreatedAt);
}

public record VerifyCustomDomainCommand(Guid DomainId) : IRequest<Result<CustomDomainDto>>;

public class VerifyCustomDomainHandler : IRequestHandler<VerifyCustomDomainCommand, Result<CustomDomainDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public VerifyCustomDomainHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomDomainDto>> Handle(VerifyCustomDomainCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<CustomDomainDto>.Failure("Not authenticated", 401);

        var domain = await _db.Set<Domain.Entities.Branding.CustomDomain>()
            .FirstOrDefaultAsync(d => d.Id == request.DomainId && d.PhotographerId == photographerId.Value, ct);
        if (domain is null)
            return Result<CustomDomainDto>.NotFound("Domain not found");

        // DNS verification placeholder - in production, would query DNS
        domain.IsVerified = true;
        domain.VerifiedAt = DateTime.UtcNow;
        domain.SslStatus = SslStatus.Active;
        domain.SslExpiresAt = DateTime.UtcNow.AddYears(1);

        await _db.SaveChangesAsync(ct);

        return Result<CustomDomainDto>.Success(MapToDto(domain));
    }

    private static CustomDomainDto MapToDto(Domain.Entities.Branding.CustomDomain d) => new(
        d.Id, d.DomainName, d.Purpose, d.IsVerified, d.SslStatus,
        d.SslExpiresAt, d.DnsInstructions, d.VerifiedAt, d.CreatedAt);
}

public record ListCustomDomainsQuery : IRequest<Result<List<CustomDomainDto>>>;

public class ListCustomDomainsHandler : IRequestHandler<ListCustomDomainsQuery, Result<List<CustomDomainDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListCustomDomainsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CustomDomainDto>>> Handle(ListCustomDomainsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<CustomDomainDto>>.Failure("Not authenticated", 401);

        var domains = await _db.Set<Domain.Entities.Branding.CustomDomain>()
            .Where(d => d.PhotographerId == photographerId.Value)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new CustomDomainDto(d.Id, d.DomainName, d.Purpose, d.IsVerified,
                d.SslStatus, d.SslExpiresAt, d.DnsInstructions, d.VerifiedAt, d.CreatedAt))
            .ToListAsync(ct);

        return Result<List<CustomDomainDto>>.Success(domains);
    }
}

public record DeleteCustomDomainCommand(Guid DomainId) : IRequest<Result>;

public class DeleteCustomDomainHandler : IRequestHandler<DeleteCustomDomainCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteCustomDomainHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteCustomDomainCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var domain = await _db.Set<Domain.Entities.Branding.CustomDomain>()
            .FirstOrDefaultAsync(d => d.Id == request.DomainId && d.PhotographerId == photographerId.Value, ct);
        if (domain is null)
            return Result.NotFound("Domain not found");

        _db.Set<Domain.Entities.Branding.CustomDomain>().Remove(domain);
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
