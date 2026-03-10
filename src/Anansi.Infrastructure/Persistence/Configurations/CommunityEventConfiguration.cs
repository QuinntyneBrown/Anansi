using Anansi.Domain.Entities.Events;
using Anansi.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class CommunityEventConfiguration : IEntityTypeConfiguration<CommunityEvent>
{
    public void Configure(EntityTypeBuilder<CommunityEvent> builder)
    {
        builder.ToTable("CommunityEvents");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(5000);
        builder.Property(e => e.Venue).HasMaxLength(500);
        builder.Property(e => e.Neighborhood).HasMaxLength(200);
        builder.Property(e => e.WebsiteUrl).HasMaxLength(2000);
        builder.Property(e => e.Category).HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.Recurrence).HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);

        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.Category);
        builder.HasIndex(e => e.SubmittedByPhotographerId);
        builder.HasIndex(e => new { e.StartDate, e.EndDate });

        builder.HasMany(e => e.CalendarBlocks)
            .WithOne(b => b.CommunityEvent)
            .HasForeignKey(b => b.CommunityEventId)
            .OnDelete(DeleteBehavior.Cascade);

        SeedEvents(builder);
    }

    private static void SeedEvents(EntityTypeBuilder<CommunityEvent> builder)
    {
        builder.HasData(
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000001"),
                Name = "Toronto Caribbean Carnival (Caribana)",
                Description = "North America's largest Caribbean festival celebrating Caribbean culture, music, and cuisine. The Grand Parade along Lakeshore Blvd is the highlight, featuring elaborate mas bands, steel pan, soca, and calypso music.",
                Venue = "Lakeshore Blvd West",
                Neighborhood = "Lakeshore",
                Category = EventCategory.Festival,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 7,
                TypicalEndMonth = 8,
                WebsiteUrl = "https://www.torontocarnival.ca",
                Status = EventStatus.Approved,
                IsSeeded = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000002"),
                Name = "Afrofest",
                Description = "Canada's largest free celebration of African music, culture, and heritage. Featuring live performances from African musicians, traditional and contemporary dance, African cuisine, arts and crafts, and children's activities.",
                Venue = "Woodbine Park",
                Neighborhood = "The Beaches",
                Category = EventCategory.Festival,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 7,
                TypicalEndMonth = 7,
                WebsiteUrl = "https://www.afrofest.ca",
                Status = EventStatus.Approved,
                IsSeeded = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000003"),
                Name = "Afro-Carib Fest",
                Description = "A vibrant celebration of African and Caribbean culture in Scarborough featuring live music, DJs, food vendors, artisan markets, and cultural performances that bring together the diverse Black communities of the GTA.",
                Venue = "Thomson Memorial Park",
                Neighborhood = "Scarborough",
                Category = EventCategory.Festival,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 8,
                TypicalEndMonth = 8,
                WebsiteUrl = "https://www.afrocaribfest.com",
                Status = EventStatus.Approved,
                IsSeeded = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000004"),
                Name = "KUUMBA",
                Description = "Toronto's premier Black arts festival held during Black History Month at Harbourfront Centre. KUUMBA (Swahili for 'creativity') showcases Black excellence through visual arts, music, dance, film, literature, and spoken word.",
                Venue = "Harbourfront Centre",
                Neighborhood = "Harbourfront",
                Category = EventCategory.Cultural,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 2,
                TypicalEndMonth = 2,
                WebsiteUrl = "https://www.harbourfrontcentre.com/kuumba",
                Status = EventStatus.Approved,
                IsSeeded = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000005"),
                Name = "Toronto Black Film Festival",
                Description = "An annual celebration of the global Black experience through cinema. The festival screens feature films, documentaries, and short films by Black filmmakers from around the world, with panel discussions and networking events.",
                Venue = "Various venues",
                Neighborhood = "Downtown",
                Category = EventCategory.Cultural,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 2,
                TypicalEndMonth = 2,
                WebsiteUrl = "https://www.torontoblackfilm.com",
                Status = EventStatus.Approved,
                IsSeeded = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000006"),
                Name = "Black History Month Toronto",
                Description = "City-wide celebration honoring the legacy, history, achievements, and contributions of Black Canadians. Events include exhibitions, lectures, performances, community gatherings, and educational programs across Toronto.",
                Venue = "City-wide",
                Neighborhood = "City-wide",
                Category = EventCategory.Community,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 2,
                TypicalEndMonth = 2,
                WebsiteUrl = "https://www.toronto.ca/blackhistorymonth",
                Status = EventStatus.Approved,
                IsSeeded = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
