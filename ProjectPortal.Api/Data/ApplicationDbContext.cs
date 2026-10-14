
using Microsoft.EntityFrameworkCore;
using ProjectPortal.Api.Models;

namespace ProjectPortal.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
}
