using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contracts;

/// <summary>
/// Client signs a contract (CON-4.4.4).
/// </summary>
public record SignContractCommand(
    Guid ContractId,
    Guid SignatureId,
    string SignatureData,
    string SignerName,
    string SignerEmail,
    string? IpAddress,
    string? UserAgent) : IRequest<Result>;

public class SignContractHandler : IRequestHandler<SignContractCommand, Result>
{
    private readonly IApplicationDbContext _db;

    public SignContractHandler(IApplicationDbContext db) => _db = db;

    public async Task<Result> Handle(SignContractCommand request, CancellationToken ct)
    {
        var contract = await _db.Set<Contract>()
            .Include(c => c.Signatures)
            .FirstOrDefaultAsync(c => c.Id == request.ContractId, ct);

        if (contract is null) return Result.NotFound("Contract not found");
        if (contract.Status == ContractStatus.Expired) return Result.Failure("Contract has expired.");
        if (contract.Status == ContractStatus.Cancelled) return Result.Failure("Contract has been cancelled.");

        var signature = contract.Signatures.FirstOrDefault(s => s.Id == request.SignatureId);
        if (signature is null) return Result.NotFound("Signature field not found");

        signature.SignatureData = request.SignatureData;
        signature.SignerName = request.SignerName;
        signature.SignerEmail = request.SignerEmail;
        signature.SignedAt = DateTime.UtcNow;
        signature.IpAddress = request.IpAddress;
        signature.UserAgent = request.UserAgent;

        // If all signatures are signed, mark contract as signed
        if (contract.Signatures.All(s => s.SignedAt.HasValue))
            contract.Status = ContractStatus.Signed;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
