using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Anansi.Infrastructure.Identity;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext context,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return Result<RegisterResponse>.Failure("An account with this email already exists.");

        var photographer = new Photographer
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            BusinessName = request.BusinessName,
            Subdomain = request.BusinessName.ToLowerInvariant().Replace(" ", "-")
        };

        _context.Set<Photographer>().Add(photographer);
        await _context.SaveChangesAsync(cancellationToken);

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            PhotographerId = photographer.Id
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return Result<RegisterResponse>.Failure(
                string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        var token = _tokenService.GenerateAccessToken(user.Id, user.Email!, photographer.Id);

        return Result<RegisterResponse>.Success(
            new RegisterResponse(user.Id, photographer.Id, token));
    }
}
