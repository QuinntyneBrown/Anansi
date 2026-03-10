using Anansi.Application.Common;
using Anansi.Domain.Enums;
using MediatR;

namespace Anansi.Application.Features.Integrations.Queries;

public record GetCustomCodeInjectionsQuery : IRequest<Result<IReadOnlyList<CustomCodeInjectionDto>>>;

public record CustomCodeInjectionDto(
    Guid Id,
    string Code,
    CodeInjectionLocation Location,
    bool IsActive,
    string? Label);
