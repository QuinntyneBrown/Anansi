using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Integrations;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class SubmitLabOrderCommandHandler : IRequestHandler<SubmitLabOrderCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ILabIntegrationService _labService;
    private readonly IStorageService _storageService;

    public SubmitLabOrderCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ILabIntegrationService labService,
        IStorageService storageService)
    {
        _context = context;
        _currentUser = currentUser;
        _labService = labService;
        _storageService = storageService;
    }

    public async Task<Result<Guid>> Handle(SubmitLabOrderCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<Guid>.Failure("Not authenticated.", 401);

        // Get lab pricing for cost calculation
        var labProduct = await _context.LabProducts
            .FirstOrDefaultAsync(p => p.LabName == request.LabName && p.Size == request.Size, cancellationToken);

        var labCost = labProduct?.LabCostCents ?? 0;

        var labOrder = new LabOrder
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            StoreOrderId = request.StoreOrderId,
            LabName = request.LabName,
            ImageFileKey = request.ImageFileKey,
            ProductSpecifications = request.ProductSpecifications,
            Size = request.Size,
            Quantity = request.Quantity,
            ShippingName = request.ShippingName,
            ShippingAddress = request.ShippingAddress,
            ShippingCity = request.ShippingCity,
            ShippingProvince = request.ShippingProvince,
            ShippingPostalCode = request.ShippingPostalCode,
            ShippingCountry = request.ShippingCountry,
            LabCostCents = labCost * request.Quantity,
            Status = LabOrderStatus.Pending
        };

        _context.LabOrders.Add(labOrder);
        await _context.SaveChangesAsync(cancellationToken);

        // Get presigned URL for the image
        var imageUrl = await _storageService.GetPresignedUrlAsync(request.ImageFileKey, TimeSpan.FromHours(1), cancellationToken);

        // Submit to lab
        var externalId = await _labService.SubmitOrderAsync(new LabOrderRequest
        {
            LabName = request.LabName,
            ImageFileUrl = imageUrl,
            ProductSpecifications = request.ProductSpecifications,
            Size = request.Size,
            Quantity = request.Quantity,
            ShippingName = request.ShippingName,
            ShippingAddress = request.ShippingAddress,
            ShippingCity = request.ShippingCity,
            ShippingProvince = request.ShippingProvince,
            ShippingPostalCode = request.ShippingPostalCode,
            ShippingCountry = request.ShippingCountry
        }, cancellationToken);

        labOrder.ExternalLabOrderId = externalId;
        labOrder.Status = LabOrderStatus.Transmitted;
        labOrder.TransmittedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(labOrder.Id);
    }
}
