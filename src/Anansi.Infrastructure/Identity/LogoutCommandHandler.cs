using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using MediatR;

namespace Anansi.Infrastructure.Identity;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    public Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        // With JWT-based auth, logout is primarily client-side (discard the token).
        // Server-side, we could add the token to a blocklist for additional security.
        return Task.FromResult(Result.Success());
    }
}
