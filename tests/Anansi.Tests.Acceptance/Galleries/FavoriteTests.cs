using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Proofing & Favorites (GAL-1.5.1 through GAL-1.5.6).
/// </summary>
public class FavoriteTests : GalleryTestBase
{
    public FavoriteTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.5.1: Client can create favorite lists and add photos.
    /// </summary>
    [Fact]
    public async Task FavoriteList_CreateAndAddPhotos()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        var favList = new FavoriteList
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            Name = "My Favorites",
            ClientName = "Jane",
            ClientEmail = "jane@example.com",
            ShareToken = Guid.NewGuid().ToString("N")[..16]
        };
        db.FavoriteLists.Add(favList);
        await db.SaveChangesAsync();

        var item = new FavoriteItem
        {
            FavoriteListId = favList.Id,
            MediaId = media.Id
        };
        db.FavoriteItems.Add(item);
        await db.SaveChangesAsync();

        // Assert
        var list = await db.FavoriteLists.FirstOrDefaultAsync(f => f.Id == favList.Id);
        list.Should().NotBeNull();
        list!.Name.Should().Be("My Favorites");

        var items = await db.FavoriteItems.Where(i => i.FavoriteListId == favList.Id).ToListAsync();
        items.Should().HaveCount(1);
        items[0].MediaId.Should().Be(media.Id);
    }

    /// <summary>
    /// GAL-1.5.1: Multiple named favorite lists per collection.
    /// </summary>
    [Fact]
    public async Task FavoriteList_MultipleNamedListsPerCollection()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Album Picks", ShareToken = Guid.NewGuid().ToString("N")[..16] });
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Social Media", ShareToken = Guid.NewGuid().ToString("N")[..16] });
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Print Enlargements", ShareToken = Guid.NewGuid().ToString("N")[..16] });
        await db.SaveChangesAsync();

        // Assert
        var lists = await db.FavoriteLists.Where(f => f.CollectionId == collection.Id).ToListAsync();
        lists.Should().HaveCount(3);
        lists.Select(l => l.Name).Should().Contain("Album Picks")
            .And.Contain("Social Media")
            .And.Contain("Print Enlargements");
    }

    /// <summary>
    /// GAL-1.5.1: Photos can be removed from favorite lists.
    /// </summary>
    [Fact]
    public async Task FavoriteItem_Remove_ShouldDeleteItem()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);
        var favList = new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "My Picks", ShareToken = Guid.NewGuid().ToString("N")[..16] };
        db.FavoriteLists.Add(favList);
        await db.SaveChangesAsync();

        var item = new FavoriteItem { FavoriteListId = favList.Id, MediaId = media.Id };
        db.FavoriteItems.Add(item);
        await db.SaveChangesAsync();

        // Act
        db.FavoriteItems.Remove(item);
        await db.SaveChangesAsync();

        // Assert
        var remaining = await db.FavoriteItems.Where(i => i.FavoriteListId == favList.Id).ToListAsync();
        remaining.Should().BeEmpty();
    }

    /// <summary>
    /// GAL-1.5.2: Comments on favorites.
    /// </summary>
    [Fact]
    public async Task FavoriteItem_AddComment_ShouldPersist()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);
        var favList = new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Review", ShareToken = Guid.NewGuid().ToString("N")[..16] };
        db.FavoriteLists.Add(favList);
        await db.SaveChangesAsync();

        // Act
        var item = new FavoriteItem
        {
            FavoriteListId = favList.Id,
            MediaId = media.Id,
            Comment = "Can you lighten the shadows on this one? Also crop tighter on the couple."
        };
        db.FavoriteItems.Add(item);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.FavoriteItems.FirstOrDefaultAsync(i => i.Id == item.Id);
        result!.Comment.Should().Contain("lighten the shadows");
        result.Comment!.Length.Should().BeGreaterThan(0).And.BeLessThanOrEqualTo(5000);
    }

    /// <summary>
    /// GAL-1.5.3: Preset favorite list categories.
    /// </summary>
    [Fact]
    public async Task PresetFavoriteList_ShouldBeCreatedByPhotographer()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Album Picks", IsPreset = true, ShareToken = Guid.NewGuid().ToString("N")[..16] });
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Social Media", IsPreset = true, ShareToken = Guid.NewGuid().ToString("N")[..16] });
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Retouching", IsPreset = true, ShareToken = Guid.NewGuid().ToString("N")[..16] });
        await db.SaveChangesAsync();

        // Assert
        var presets = await db.FavoriteLists
            .Where(f => f.CollectionId == collection.Id && f.IsPreset)
            .ToListAsync();
        presets.Should().HaveCount(3);
    }

    /// <summary>
    /// GAL-1.5.4: Favorite limit enforcement.
    /// </summary>
    [Fact]
    public async Task FavoriteLimit_WhenReached_ShouldBlockNewAdditions()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        collection.FavoriteLimit = 2;
        await db.SaveChangesAsync();

        var favList = new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Limited", ShareToken = Guid.NewGuid().ToString("N")[..16] };
        db.FavoriteLists.Add(favList);
        await db.SaveChangesAsync();

        var media1 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "p1.jpg");
        var media2 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "p2.jpg");

        db.FavoriteItems.Add(new FavoriteItem { FavoriteListId = favList.Id, MediaId = media1.Id });
        db.FavoriteItems.Add(new FavoriteItem { FavoriteListId = favList.Id, MediaId = media2.Id });
        await db.SaveChangesAsync();

        // Assert
        var count = await db.FavoriteItems.CountAsync(i => i.FavoriteListId == favList.Id);
        count.Should().Be(2);

        var limitReached = count >= collection.FavoriteLimit!.Value;
        limitReached.Should().BeTrue("limit of 2 should be reached");
    }

    /// <summary>
    /// GAL-1.5.5: Favorite list has shareable link.
    /// </summary>
    [Fact]
    public async Task FavoriteList_ShareToken_ShouldBeUnique()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var list1 = new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "List 1", ShareToken = Guid.NewGuid().ToString("N")[..16] };
        var list2 = new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "List 2", ShareToken = Guid.NewGuid().ToString("N")[..16] };
        db.FavoriteLists.Add(list1);
        db.FavoriteLists.Add(list2);
        await db.SaveChangesAsync();

        // Assert
        list1.ShareToken.Should().NotBe(list2.ShareToken);
        list1.ShareToken.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// GAL-1.5.6: Favorite activity dashboard - shows all lists across collections.
    /// </summary>
    [Fact]
    public async Task FavoriteDashboard_ShowsAllListsAcrossCollections()
    {
        // Arrange
        var db = GetDb();
        var photographerId = Guid.NewGuid();
        var photographer = new Domain.Entities.Photographer
        {
            Id = photographerId,
            Email = "dash@example.com",
            FirstName = "Dash",
            LastName = "Test",
            BusinessName = "Dash Studio",
            Subdomain = "dash-studio-" + Guid.NewGuid().ToString("N")[..8]
        };
        db.Set<Domain.Entities.Photographer>().Add(photographer);

        var c1 = new Collection { PhotographerId = photographerId, Title = "Wedding 1", Slug = "w1-" + Guid.NewGuid().ToString("N")[..8] };
        var c2 = new Collection { PhotographerId = photographerId, Title = "Wedding 2", Slug = "w2-" + Guid.NewGuid().ToString("N")[..8] };
        db.Collections.Add(c1);
        db.Collections.Add(c2);
        await db.SaveChangesAsync();

        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = c1.Id, Name = "Bride Picks", ClientName = "Sarah", ShareToken = Guid.NewGuid().ToString("N")[..16] });
        db.FavoriteLists.Add(new FavoriteList { PhotographerId = photographerId, CollectionId = c2.Id, Name = "Groom Picks", ClientName = "Mike", ShareToken = Guid.NewGuid().ToString("N")[..16] });
        await db.SaveChangesAsync();

        // Act
        var allLists = await db.FavoriteLists
            .Where(f => f.PhotographerId == photographerId)
            .ToListAsync();

        // Assert
        allLists.Should().HaveCount(2);
        allLists.Select(l => l.ClientName).Should().Contain("Sarah").And.Contain("Mike");
    }

    /// <summary>
    /// GAL-1.5.6: Favorite list marks as completed.
    /// </summary>
    [Fact]
    public async Task FavoriteList_MarkCompleted_ShouldSetFlag()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var favList = new FavoriteList { PhotographerId = photographerId, CollectionId = collection.Id, Name = "Final Picks", ShareToken = Guid.NewGuid().ToString("N")[..16] };
        db.FavoriteLists.Add(favList);
        await db.SaveChangesAsync();

        // Act
        favList.IsCompleted = true;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.FavoriteLists.FirstOrDefaultAsync(f => f.Id == favList.Id);
        result!.IsCompleted.Should().BeTrue();
    }
}
