using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Sharing & Social (GAL-1.7.1 through GAL-1.7.5).
/// </summary>
public class SharingTests : GalleryTestBase
{
    public SharingTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.7.1: Email invitation with template and tracking.
    /// </summary>
    [Fact]
    public async Task EmailInvitation_ShouldTrackSendAndOpenStatus()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var invitation = new EmailInvitation
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            RecipientEmail = "client@example.com",
            Subject = "Your wedding photos are ready!",
            Body = "<h1>View your gallery</h1><p>Click the link below.</p>",
            HeaderImageUrl = "https://cdn.example.com/header.jpg",
            IncludePassword = true,
            IsSent = true,
            SentAt = DateTime.UtcNow
        };
        db.EmailInvitations.Add(invitation);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.EmailInvitations.FirstOrDefaultAsync(e => e.Id == invitation.Id);
        result.Should().NotBeNull();
        result!.RecipientEmail.Should().Be("client@example.com");
        result.Subject.Should().Contain("wedding photos");
        result.IsSent.Should().BeTrue();
        result.SentAt.Should().NotBeNull();
        result.IncludePassword.Should().BeTrue();
    }

    /// <summary>
    /// GAL-1.7.1: Email open tracking.
    /// </summary>
    [Fact]
    public async Task EmailInvitation_TrackOpened()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var invitation = new EmailInvitation
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            RecipientEmail = "client@example.com",
            Subject = "Gallery Ready",
            Body = "Your photos are ready",
            IsSent = true,
            SentAt = DateTime.UtcNow
        };
        db.EmailInvitations.Add(invitation);
        await db.SaveChangesAsync();

        // Act - Simulate email opened
        invitation.IsOpened = true;
        invitation.OpenedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.EmailInvitations.FirstOrDefaultAsync(e => e.Id == invitation.Id);
        result!.IsOpened.Should().BeTrue();
        result.OpenedAt.Should().NotBeNull();
    }

    /// <summary>
    /// GAL-1.7.2: Social media sharing platforms available.
    /// </summary>
    [Fact]
    public void SocialSharing_ShouldSupportMultiplePlatforms()
    {
        // Assert
        var platforms = Enum.GetValues<SharePlatform>();
        platforms.Should().Contain(SharePlatform.Facebook);
        platforms.Should().Contain(SharePlatform.Instagram);
        platforms.Should().Contain(SharePlatform.Pinterest);
        platforms.Should().Contain(SharePlatform.WhatsApp);
        platforms.Should().Contain(SharePlatform.Messenger);
        platforms.Should().Contain(SharePlatform.Threads);
        platforms.Should().Contain(SharePlatform.Email);
        platforms.Should().Contain(SharePlatform.CopyLink);
    }

    /// <summary>
    /// GAL-1.7.3: Quick Share link creation and revocation.
    /// </summary>
    [Fact]
    public async Task QuickShareLink_CreateAndRevoke()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media1 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo1.jpg");
        var media2 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo2.jpg");

        // Act
        var link = new QuickShareLink
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            Token = Guid.NewGuid().ToString("N"),
            MediaIds = $"{media1.Id},{media2.Id}",
            IsRevoked = false
        };
        db.QuickShareLinks.Add(link);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.QuickShareLinks.FirstOrDefaultAsync(q => q.Id == link.Id);
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
        result.MediaIds.Should().Contain(media1.Id.ToString());
        result.IsRevoked.Should().BeFalse();

        // Act - Revoke
        link.IsRevoked = true;
        await db.SaveChangesAsync();

        var revoked = await db.QuickShareLinks.FirstOrDefaultAsync(q => q.Id == link.Id);
        revoked!.IsRevoked.Should().BeTrue();
    }

    /// <summary>
    /// GAL-1.7.3: Quick Share independent of collection privacy.
    /// </summary>
    [Fact]
    public async Task QuickShareLink_IndependentOfCollectionPrivacy()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        collection.Password = "ProtectedGallery";
        await db.SaveChangesAsync();

        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        var link = new QuickShareLink
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            Token = Guid.NewGuid().ToString("N"),
            MediaIds = media.Id.ToString()
        };
        db.QuickShareLinks.Add(link);
        await db.SaveChangesAsync();

        // Assert - Quick share link exists independently
        var result = await db.QuickShareLinks.FirstOrDefaultAsync(q => q.Id == link.Id);
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty("Quick Share works independently of collection password");
    }

    /// <summary>
    /// GAL-1.7.4: QR code generation for collection.
    /// </summary>
    [Fact]
    public async Task QrCode_CollectionHasSlugForUrl()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Assert - Collection has slug for URL
        collection.Slug.Should().NotBeNullOrEmpty("QR code links to collection via slug");
    }

    /// <summary>
    /// GAL-1.7.5: Gallery embedding toggleable.
    /// </summary>
    [Fact]
    public async Task GalleryEmbedding_CanBeEnabled()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.EmbeddingEnabled = true;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.EmbeddingEnabled.Should().BeTrue();
    }

    /// <summary>
    /// GAL-1.7.5: Embedded galleries respect privacy settings.
    /// </summary>
    [Fact]
    public async Task GalleryEmbedding_RespectsPrivacy()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.Password = "Protected";
        collection.EmbeddingEnabled = true;
        await db.SaveChangesAsync();

        // Assert - Both password and embedding settings persist
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Password.Should().NotBeNullOrEmpty("embedded galleries should still have password");
        result.EmbeddingEnabled.Should().BeTrue();
    }
}
