using Anansi.Domain.Entities;
using Anansi.Domain.Entities.CRM;
using Anansi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.Helpers;

public static class TestHelper
{
    public static readonly Guid TestPhotographerId = Guid.NewGuid();

    public static ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"AnansiTest_{Guid.NewGuid()}")
            .Options;
        return new ApplicationDbContext(options);
    }

    public static async Task<Photographer> SeedPhotographer(ApplicationDbContext db)
    {
        var photographer = new Photographer
        {
            Id = TestPhotographerId,
            Email = "test@studio.com",
            FirstName = "Test",
            LastName = "Photographer",
            BusinessName = "Test Studio",
            Subdomain = "teststudio"
        };

        db.Photographers.Add(photographer);
        await db.SaveChangesAsync();
        return photographer;
    }

    public static async Task SeedDefaultStages(ApplicationDbContext db)
    {
        var defaults = new[] { "Inquiry", "Booked Session", "Post-production", "Completed Project" };
        for (int i = 0; i < defaults.Length; i++)
        {
            db.ProjectStages.Add(new ProjectStage
            {
                PhotographerId = TestPhotographerId,
                Name = defaults[i],
                SortOrder = i
            });
        }
        await db.SaveChangesAsync();
    }
}
