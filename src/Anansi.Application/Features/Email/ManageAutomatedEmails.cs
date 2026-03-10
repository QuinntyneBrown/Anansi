using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Email;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Email;

/// <summary>
/// Configure automated email settings (EML-5.3.1 through EML-5.3.4).
/// </summary>
public record UpsertAutomatedEmailConfigCommand(
    Guid? Id,
    string EventType,
    bool IsEnabled,
    Guid? EmailTemplateId,
    int? TimingOffsetHours,
    int? ReminderFrequencyDays,
    string? RecipientTypes,
    string? DaysBeforeEvent) : IRequest<Result<AutomatedEmailConfigDto>>;

public class UpsertAutomatedEmailConfigValidator : AbstractValidator<UpsertAutomatedEmailConfigCommand>
{
    public UpsertAutomatedEmailConfigValidator()
    {
        RuleFor(x => x.EventType).NotEmpty().MaximumLength(100);
    }
}

public class UpsertAutomatedEmailConfigHandler : IRequestHandler<UpsertAutomatedEmailConfigCommand, Result<AutomatedEmailConfigDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpsertAutomatedEmailConfigHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<AutomatedEmailConfigDto>> Handle(UpsertAutomatedEmailConfigCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        AutomatedEmailConfig config;
        if (request.Id.HasValue)
        {
            config = await _db.Set<AutomatedEmailConfig>()
                .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == photographerId, ct)
                ?? throw new InvalidOperationException("Config not found");
        }
        else
        {
            config = new AutomatedEmailConfig { PhotographerId = photographerId };
            _db.Set<AutomatedEmailConfig>().Add(config);
        }

        config.EventType = request.EventType;
        config.IsEnabled = request.IsEnabled;
        config.EmailTemplateId = request.EmailTemplateId;
        config.TimingOffsetHours = request.TimingOffsetHours;
        config.ReminderFrequencyDays = request.ReminderFrequencyDays;
        config.RecipientTypes = request.RecipientTypes;
        config.DaysBeforeEvent = request.DaysBeforeEvent;

        await _db.SaveChangesAsync(ct);

        return Result<AutomatedEmailConfigDto>.Success(new AutomatedEmailConfigDto(
            config.Id, config.EventType, config.IsEnabled, config.EmailTemplateId,
            config.TimingOffsetHours, config.ReminderFrequencyDays,
            config.RecipientTypes, config.DaysBeforeEvent));
    }
}

/// <summary>
/// List all automated email configurations.
/// </summary>
public record ListAutomatedEmailConfigsQuery : IRequest<Result<IReadOnlyList<AutomatedEmailConfigDto>>>;

public class ListAutomatedEmailConfigsHandler : IRequestHandler<ListAutomatedEmailConfigsQuery, Result<IReadOnlyList<AutomatedEmailConfigDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListAutomatedEmailConfigsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<AutomatedEmailConfigDto>>> Handle(ListAutomatedEmailConfigsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var items = await _db.Set<AutomatedEmailConfig>()
            .Where(c => c.PhotographerId == photographerId)
            .Select(c => new AutomatedEmailConfigDto(
                c.Id, c.EventType, c.IsEnabled, c.EmailTemplateId,
                c.TimingOffsetHours, c.ReminderFrequencyDays,
                c.RecipientTypes, c.DaysBeforeEvent))
            .ToListAsync(ct);

        return Result<IReadOnlyList<AutomatedEmailConfigDto>>.Success(items);
    }
}
