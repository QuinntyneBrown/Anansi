using Anansi.Domain.Entities.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Anansi.Infrastructure.Persistence.Configurations;

public class ElementBreakpointOverrideConfiguration : IEntityTypeConfiguration<ElementBreakpointOverride>
{
    public void Configure(EntityTypeBuilder<ElementBreakpointOverride> builder)
    {
        builder.ToTable("ElementBreakpointOverrides");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Breakpoint).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.StyleOverridesJson).HasColumnType("text");

        builder.HasOne(e => e.PageElement)
            .WithMany(p => p.BreakpointOverrides)
            .HasForeignKey(e => e.PageElementId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.PageElementId, e.Breakpoint }).IsUnique();
    }
}
