namespace Anansi.Domain.Entities.Discovery;

public static class PredefinedCulturalTags
{
    public static readonly string[] All =
    {
        "Caribbean Wedding",
        "Nigerian Traditional",
        "Ghanaian Engagement",
        "Ethiopian/Eritrean Ceremony",
        "Somali Wedding",
        "Caribana/Carnival",
        "Afrofest Coverage",
        "Church/Gospel Event",
        "Natural Hair Photography",
        "Melanin Portraiture",
        "African Fashion",
        "Cultural Portraits",
        "Community Event",
        "Black Family",
        "Maternity/Newborn"
    };
}

public static class PredefinedNeighborhoods
{
    public static readonly IReadOnlyList<NeighborhoodInfo> All = new List<NeighborhoodInfo>
    {
        new("Little Jamaica / Eglinton West", 43.6919, -79.4312),
        new("Jane-Finch / Black Creek", 43.7615, -79.5200),
        new("Scarborough / Malvern", 43.8090, -79.2170),
        new("Rexdale / Etobicoke North", 43.7340, -79.5870),
        new("Weston", 43.7000, -79.5150),
        new("Lawrence Heights", 43.7230, -79.4380),
        new("Downsview", 43.7530, -79.4680),
        new("St. James Town", 43.6680, -79.3720),
        new("Kensington Market", 43.6545, -79.4005),
        new("Liberty Village", 43.6380, -79.4170),
        new("The Annex", 43.6700, -79.4060),
        new("Yorkville", 43.6710, -79.3930),
        new("Downtown Core", 43.6510, -79.3830),
        new("North York Centre", 43.7670, -79.4130),
        new("Mississauga", 43.5890, -79.6441)
    };
}

public record NeighborhoodInfo(string Name, double Latitude, double Longitude);
