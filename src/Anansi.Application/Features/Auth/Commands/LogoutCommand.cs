using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Auth.Commands;

public record LogoutCommand : IRequest<Result>;
