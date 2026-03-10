namespace Anansi.Application.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    Guid? PhotographerId { get; }
    bool IsAuthenticated { get; }
}
