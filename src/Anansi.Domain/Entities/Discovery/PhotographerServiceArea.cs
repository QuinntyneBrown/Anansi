using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Discovery;

public class PhotographerServiceArea : BaseEntity
{
    public Guid PhotographerId { get; set; }
    public string Neighborhood { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int RadiusKm { get; set; }
}
