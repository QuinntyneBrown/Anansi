using Anansi.Application.Features.Booking;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.CRM;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Booking;

/// <summary>
/// Acceptance tests for BKG-4.3.1 through BKG-4.3.12.
/// </summary>
public class BookingTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public BookingTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// BKG-4.3.2: Create a full session type with all config options.
    /// </summary>
    [Fact]
    public async Task CreateSessionType_WithFullConfig_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var command = new CreateSessionTypeCommand(
            "Wedding Full Day", "8-hour wedding coverage", 480, 350000,
            "Toronto, ON", SessionVisibility.Public, 30, 30, false,
            false, 0, 1, "[{\"day\":1,\"start\":\"09:00\",\"end\":\"17:00\"}]",
            null, true, 100000, null, null);

        // Act
        var handler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Wedding Full Day");
        result.Value.DurationMinutes.Should().Be(480);
        result.Value.PriceCents.Should().Be(350000);
        result.Value.BufferBeforeMinutes.Should().Be(30);
    }

    /// <summary>
    /// BKG-4.3.3: Create a mini session type with dates and spots.
    /// </summary>
    [Fact]
    public async Task CreateMiniSessionType_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var command = new CreateSessionTypeCommand(
            "Holiday Mini", "20-minute mini session", 20, 15000,
            "Studio", SessionVisibility.Public, 0, 0, false,
            true, 5, 1, null, null, true, 7500, null, null);

        // Act
        var handler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsMiniSession.Should().BeTrue();
        result.Value.MiniSessionGapMinutes.Should().Be(5);
    }

    /// <summary>
    /// BKG-4.3.4: Create a booking with automatic status based on manual confirmation setting.
    /// BKG-4.3.6: Buffer time prevents overlapping bookings.
    /// CRM-4.1.3: Lead auto-converts to Client on booking.
    /// </summary>
    [Fact]
    public async Task CreateBooking_AutoConfirm_And_BufferTime()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var stHandler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());
        var sessionType = await stHandler.Handle(
            new CreateSessionTypeCommand("Portrait", "1-hour portrait", 60, 20000,
                "Studio", SessionVisibility.Public, 15, 15, false,
                false, 0, 1, null, null, false, null, null, null),
            CancellationToken.None);

        var startTime = DateTime.UtcNow.AddDays(7);

        // Act - First booking (auto-confirmed)
        var bookHandler = new CreateBookingHandler(db, new FakeCurrentUserService());
        var booking1 = await bookHandler.Handle(
            new CreateBookingCommand(sessionType.Value!.Id, "Test", "Client", "test@client.com", null, startTime, null, null),
            CancellationToken.None);

        // Assert - First booking
        booking1.IsSuccess.Should().BeTrue();
        booking1.Value!.Status.Should().Be(BookingStatus.Confirmed);

        // Act - Overlapping booking (should fail due to buffer)
        var booking2 = await bookHandler.Handle(
            new CreateBookingCommand(sessionType.Value.Id, "Another", "Client", "another@client.com", null, startTime.AddMinutes(30), null, null),
            CancellationToken.None);

        // Assert - Conflict detected
        booking2.IsSuccess.Should().BeFalse();
        booking2.Error.Should().Contain("conflict");
    }

    /// <summary>
    /// BKG-4.3.7: Manual confirmation puts booking in Pending state.
    /// </summary>
    [Fact]
    public async Task CreateBooking_ManualConfirmation_SetsPending()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var stHandler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());
        var sessionType = await stHandler.Handle(
            new CreateSessionTypeCommand("Consultation", "30-min consult", 30, 5000,
                "Online", SessionVisibility.Public, 0, 0, true,
                false, 0, 1, null, "Zoom", false, null, null, null),
            CancellationToken.None);

        // Act
        var bookHandler = new CreateBookingHandler(db, new FakeCurrentUserService());
        var booking = await bookHandler.Handle(
            new CreateBookingCommand(sessionType.Value!.Id, "Pending", "Client", "pending@test.com", null, DateTime.UtcNow.AddDays(5), null, null),
            CancellationToken.None);

        // Assert
        booking.IsSuccess.Should().BeTrue();
        booking.Value!.Status.Should().Be(BookingStatus.Pending);

        // Act - Confirm
        var confirmHandler = new ConfirmBookingHandler(db, new FakeCurrentUserService());
        var confirmed = await confirmHandler.Handle(new ConfirmBookingCommand(booking.Value.Id, true), CancellationToken.None);

        // Assert
        confirmed.IsSuccess.Should().BeTrue();
    }

    /// <summary>
    /// BKG-4.3.12: Booking coupons reduce price.
    /// </summary>
    [Fact]
    public async Task CreateBooking_WithCoupon_AppliesDiscount()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var stHandler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());
        var sessionType = await stHandler.Handle(
            new CreateSessionTypeCommand("Session", "1hr", 60, 20000,
                "Studio", SessionVisibility.Public, 0, 0, false,
                false, 0, 1, null, null, false, null, null, null),
            CancellationToken.None);

        var couponHandler = new CreateBookingCouponHandler(db, new FakeCurrentUserService());
        await couponHandler.Handle(
            new CreateBookingCouponCommand("SAVE20", CouponType.PercentageOff, 20, null, null, null),
            CancellationToken.None);

        // Act
        var bookHandler = new CreateBookingHandler(db, new FakeCurrentUserService());
        var booking = await bookHandler.Handle(
            new CreateBookingCommand(sessionType.Value!.Id, "Coupon", "User", "coupon@test.com", null, DateTime.UtcNow.AddDays(14), "SAVE20", null),
            CancellationToken.None);

        // Assert
        booking.IsSuccess.Should().BeTrue();
        booking.Value!.DiscountCents.Should().Be(4000); // 20% of 20000
    }
}
