using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contracts;

public record GetContractQuery(Guid Id) : IRequest<Result<ContractDto>>;

public class GetContractHandler : IRequestHandler<GetContractQuery, Result<ContractDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetContractHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ContractDto>> Handle(GetContractQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var contract = await _db.Set<Contract>()
            .Include(c => c.Contact)
            .Include(c => c.Fields)
            .Include(c => c.Signatures)
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == photographerId, ct);

        if (contract is null) return Result<ContractDto>.NotFound("Contract not found");

        return Result<ContractDto>.Success(CreateContractHandler.MapToDto(contract));
    }
}

public record ListContractsQuery(bool? IsTemplate, int Page = 1, int PageSize = 25) : IRequest<Result<PagedList<ContractDto>>>;

public class ListContractsHandler : IRequestHandler<ListContractsQuery, Result<PagedList<ContractDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListContractsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<ContractDto>>> Handle(ListContractsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<Contract>()
            .Include(c => c.Contact)
            .Include(c => c.Fields)
            .Include(c => c.Signatures)
            .Where(c => c.PhotographerId == photographerId);

        if (request.IsTemplate.HasValue)
            query = query.Where(c => c.IsTemplate == request.IsTemplate.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return Result<PagedList<ContractDto>>.Success(
            new PagedList<ContractDto>(items.Select(CreateContractHandler.MapToDto).ToList(), total, request.Page, request.PageSize));
    }
}
