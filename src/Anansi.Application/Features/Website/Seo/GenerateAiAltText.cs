using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;

namespace Anansi.Application.Features.Website.Seo;

/// <summary>
/// WEB-3.5.2 - AI Alt Text Generation: generate descriptive alt text for images.
/// Individual and bulk generation supported. Generated text is editable.
/// </summary>
public record GenerateAiAltTextCommand(List<Guid> ImageElementIds) : IRequest<Result<List<AiAltTextResult>>>;

public record AiAltTextResult(Guid ElementId, string GeneratedAltText);

public class GenerateAiAltTextHandler : IRequestHandler<GenerateAiAltTextCommand, Result<List<AiAltTextResult>>>
{
    private readonly ICurrentUserService _currentUser;

    public GenerateAiAltTextHandler(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    public Task<Result<List<AiAltTextResult>>> Handle(GenerateAiAltTextCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Task.FromResult(Result<List<AiAltTextResult>>.Failure("Not authenticated", 401));

        // AI generation placeholder - returns generated alt text per element
        var results = request.ImageElementIds.Select(id =>
            new AiAltTextResult(id, $"AI-generated alt text for image {id}")).ToList();

        return Task.FromResult(Result<List<AiAltTextResult>>.Success(results));
    }
}
