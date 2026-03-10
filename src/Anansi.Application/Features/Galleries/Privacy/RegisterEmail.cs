using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Privacy;

// GAL-1.6.4: Email Registration Gate
public record RegisterEmailCommand(
    Guid CollectionId,
    string Name,
    string Email
) : IRequest<Result<GalleryEmailRegistrationDto>>;

public class RegisterEmailValidator : AbstractValidator<RegisterEmailCommand>
{
    public RegisterEmailValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(500);
    }
}

public class RegisterEmailHandler : IRequestHandler<RegisterEmailCommand, Result<GalleryEmailRegistrationDto>>
{
    private readonly IApplicationDbContext _db;

    public RegisterEmailHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<GalleryEmailRegistrationDto>> Handle(RegisterEmailCommand request, CancellationToken ct)
    {
        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId, ct);

        if (collection is null)
            return Result<GalleryEmailRegistrationDto>.NotFound("Collection not found");

        if (!collection.RequireEmailRegistration)
            return Result<GalleryEmailRegistrationDto>.Failure("Email registration is not enabled for this collection");

        var registration = new GalleryEmailRegistration
        {
            PhotographerId = collection.PhotographerId,
            CollectionId = request.CollectionId,
            Name = request.Name,
            Email = request.Email
        };

        _db.GalleryEmailRegistrations.Add(registration);

        // Track activity
        var activity = new GalleryActivity
        {
            PhotographerId = collection.PhotographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.EmailRegistration,
            ActorName = request.Name,
            ActorEmail = request.Email,
            Details = "Email registration"
        };
        _db.GalleryActivities.Add(activity);

        await _db.SaveChangesAsync(ct);

        return Result<GalleryEmailRegistrationDto>.Success(new GalleryEmailRegistrationDto(
            registration.Id, registration.CollectionId, registration.Name, registration.Email, registration.CreatedAt
        ));
    }
}
