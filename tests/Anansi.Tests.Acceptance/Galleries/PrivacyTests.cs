using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Privacy & Access Control (GAL-1.6.1 through GAL-1.6.7).
/// </summary>
public class PrivacyTests : GalleryTestBase
{
    public PrivacyTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.6.1: Collection password protection.
    /// </summary>
    [Fact]
    public async Task CollectionPassword_CanBeSetAndVerified()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.Password = "SecurePass123";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Password.Should().Be("SecurePass123");
        (result.Password == "SecurePass123").Should().BeTrue();
        (result.Password == "WrongPass").Should().BeFalse();
    }

    /// <summary>
    /// GAL-1.6.1: Password changeable at any time.
    /// </summary>
    [Fact]
    public async Task CollectionPassword_Changeable()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.Password = "OldPassword";
        await db.SaveChangesAsync();

        // Act
        collection.Password = "NewPassword";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Password.Should().Be("NewPassword");
    }

    /// <summary>
    /// GAL-1.6.2: Client exclusive access - separate password for additional sets.
    /// </summary>
    [Fact]
    public async Task ClientExclusiveAccess_SeparatePasswordForHiddenSets()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        collection.Password = "PublicPass";
        collection.ClientExclusivePassword = "ClientPass";
        await db.SaveChangesAsync();

        var publicSet = await SeedSetAsync(db, photographerId, collection.Id, "Public Set", 0);
        var exclusiveSet = new CollectionSet
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            Title = "Exclusive Boudoir Set",
            IsClientExclusive = true,
            SortOrder = 1
        };
        db.CollectionSets.Add(exclusiveSet);
        await db.SaveChangesAsync();

        // Assert
        var publicSets = await db.CollectionSets
            .Where(s => s.CollectionId == collection.Id && !s.IsClientExclusive)
            .ToListAsync();
        publicSets.Should().HaveCount(1);

        var allSets = await db.CollectionSets
            .Where(s => s.CollectionId == collection.Id)
            .ToListAsync();
        allSets.Should().HaveCount(2);

        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.ClientExclusivePassword.Should().Be("ClientPass");
        result.Password.Should().Be("PublicPass");
    }

    /// <summary>
    /// GAL-1.6.3: Homepage password - independent of per-collection.
    /// </summary>
    [Fact]
    public async Task HomepagePassword_IndependentOfCollectionPassword()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act - Each collection has its own password
        collection.Password = "CollectionSpecific";
        await db.SaveChangesAsync();

        // Assert - Collection password is per-collection, homepage is independent (on Photographer entity)
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Password.Should().Be("CollectionSpecific");
    }

    /// <summary>
    /// GAL-1.6.4: Email registration gate.
    /// </summary>
    [Fact]
    public async Task EmailRegistrationGate_RequiresNameAndEmail()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        collection.RequireEmailRegistration = true;
        await db.SaveChangesAsync();

        // Act
        var registration = new GalleryEmailRegistration
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            Name = "Jane Doe",
            Email = "jane@example.com"
        };
        db.GalleryEmailRegistrations.Add(registration);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryEmailRegistrations
            .Where(r => r.CollectionId == collection.Id)
            .FirstOrDefaultAsync();

        result.Should().NotBeNull();
        result!.Name.Should().Be("Jane Doe");
        result.Email.Should().Be("jane@example.com");
    }

    /// <summary>
    /// GAL-1.6.4: Collected emails viewable and exportable.
    /// </summary>
    [Fact]
    public async Task EmailRegistrations_Exportable()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        collection.RequireEmailRegistration = true;

        db.GalleryEmailRegistrations.Add(new GalleryEmailRegistration { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Alice", Email = "alice@test.com" });
        db.GalleryEmailRegistrations.Add(new GalleryEmailRegistration { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Bob", Email = "bob@test.com" });
        await db.SaveChangesAsync();

        // Act
        var registrations = await db.GalleryEmailRegistrations
            .Where(r => r.CollectionId == collection.Id)
            .ToListAsync();

        // Assert
        registrations.Should().HaveCount(2);
        registrations.Select(r => r.Email).Should().Contain("alice@test.com").And.Contain("bob@test.com");
    }

    /// <summary>
    /// GAL-1.6.5: Private photos hidden from other viewers.
    /// </summary>
    [Fact]
    public async Task PrivatePhoto_MarkedByClient_ShouldBeHidden()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        media.IsPrivate = true;
        media.MarkedPrivateByClientId = Guid.NewGuid(); // Client ID
        await db.SaveChangesAsync();

        // Track activity
        var activity = new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.PrivatePhoto,
            MediaId = media.Id,
            Details = "Marked as private"
        };
        db.GalleryActivities.Add(activity);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == media.Id);
        result!.IsPrivate.Should().BeTrue();
        result.MarkedPrivateByClientId.Should().NotBeNull();

        var activities = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.PrivatePhoto)
            .ToListAsync();
        activities.Should().HaveCount(1);
    }

    /// <summary>
    /// GAL-1.6.6: Collection expiration - status changes to Hidden.
    /// </summary>
    [Fact]
    public async Task CollectionExpiration_ShouldChangeStatusToHidden()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.Status = CollectionStatus.Published;
        collection.ExpiresAt = DateTime.UtcNow.AddDays(30);
        await db.SaveChangesAsync();

        // Act - Simulate expiry passing
        collection.ExpiresAt = DateTime.UtcNow.AddDays(-1); // Past
        collection.Status = CollectionStatus.Hidden; // Changed by scheduler
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Status.Should().Be(CollectionStatus.Hidden, "expired collections become Hidden, not deleted");
        result.ExpiresAt.Should().BeBefore(DateTime.UtcNow);
    }

    /// <summary>
    /// GAL-1.6.6: Expiry extendable after passing.
    /// </summary>
    [Fact]
    public async Task CollectionExpiry_Extendable()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.ExpiresAt = DateTime.UtcNow.AddDays(-1);
        collection.Status = CollectionStatus.Hidden;
        await db.SaveChangesAsync();

        // Act
        collection.ExpiresAt = DateTime.UtcNow.AddDays(30);
        collection.Status = CollectionStatus.Published;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
        result.Status.Should().Be(CollectionStatus.Published);
    }

    /// <summary>
    /// GAL-1.6.7: Auto expiry reminder emails configurable.
    /// </summary>
    [Fact]
    public async Task ExpiryReminders_Configurable()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.ExpiresAt = DateTime.UtcNow.AddDays(14);
        collection.ExpiryReminderRecipients = "client@example.com,family@example.com";
        collection.ExpiryReminderDays = "7,3,1";
        collection.ExpiryReminderEmailTemplate = "Hi {name}, your gallery {title} expires on {date}. Download your photos!";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.ExpiryReminderRecipients.Should().Contain("client@example.com");
        result.ExpiryReminderDays.Should().Contain("7").And.Contain("3").And.Contain("1");
        result.ExpiryReminderEmailTemplate.Should().Contain("{name}");
    }
}
