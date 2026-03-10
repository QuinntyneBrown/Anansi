using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contracts;

/// <summary>
/// Send a contract to the client and set expiry (CON-4.4.6).
/// </summary>
public record SendContractCommand(Guid ContractId) : IRequest<Result>;

public class SendContractHandler : IRequestHandler<SendContractCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SendContractHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(SendContractCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var contract = await _db.Set<Contract>()
            .FirstOrDefaultAsync(c => c.Id == request.ContractId && c.PhotographerId == photographerId, ct);

        if (contract is null) return Result.NotFound("Contract not found");

        contract.Status = ContractStatus.Sent;
        contract.SentAt = DateTime.UtcNow;
        if (contract.ExpiryDays.HasValue)
            contract.ExpiresAt = DateTime.UtcNow.AddDays(contract.ExpiryDays.Value);

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
