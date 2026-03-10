using Anansi.Application.Common;
using MediatR;

namespace Anansi.Application.Features.Account.Commands;

public record DeleteAccountCommand(bool ExportDataFirst = false) : IRequest<Result>;
