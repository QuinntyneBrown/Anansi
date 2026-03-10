namespace Anansi.Application.Features.Discovery.Queries;

public static class HaversineHelper
{
    private const double EarthRadiusKm = 6371.0;

    /// <summary>
    /// Calculates the great-circle distance between two points on the Earth
    /// using the Haversine formula.
    /// </summary>
    public static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    /// <summary>
    /// Calculates a rough bounding box for filtering candidates before exact Haversine.
    /// Returns (minLat, maxLat, minLon, maxLon).
    /// </summary>
    public static (double MinLat, double MaxLat, double MinLon, double MaxLon) GetBoundingBox(
        double lat, double lon, double radiusKm)
    {
        var latDelta = radiusKm / 111.0; // ~111 km per degree of latitude
        var lonDelta = radiusKm / (111.0 * Math.Cos(DegreesToRadians(lat)));

        return (lat - latDelta, lat + latDelta, lon - lonDelta, lon + lonDelta);
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
}
