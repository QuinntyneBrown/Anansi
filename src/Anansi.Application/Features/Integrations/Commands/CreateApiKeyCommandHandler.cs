using System.Security.Cryptography;
using System.Text;
using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Integrations;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public class CreateApiKeyCommandHandler : IRequestHandler<CreateApiKeyCommand, Result<ApiKeyResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateApiKeyCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ApiKeyResponse>> Handle(CreateApiKeyCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<ApiKeyResponse>.Failure("Not authenticated.", 401);

        // Generate a random API key
        var rawKey = GenerateApiKey();
        var prefix = rawKey[..8];
        var hash = HashKey(rawKey);

        var apiKey = new ApiKey
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = request.Name,
            KeyHash = hash,
            KeyPrefix = prefix,
            ExpiresAt = request.ExpiresAt
        };

        _context.ApiKeys.Add(apiKey);
        await _context.SaveChangesAsync(cancellationToken);

        // Return the full key only once - it cannot be retrieved again
        return Result<ApiKeyResponse>.Success(
            new ApiKeyResponse(apiKey.Id, apiKey.Name, rawKey, prefix, apiKey.ExpiresAt));
    }

    private static string GenerateApiKey()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return "anansi_" + Convert.ToBase64String(bytes).Replace("+", "").Replace("/", "").Replace("=", "")[..40];
    }

    private static string HashKey(string key)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(key));
        return Convert.ToBase64String(bytes);
    }
}
