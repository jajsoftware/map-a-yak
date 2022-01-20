using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MapAYak.Models
{
    public class AppDbContext : IdentityDbContext<IdentityUser>
    {
        #region Properties

        public DbSet<Route> Routes { get; set; }

        public DbSet<Coordinate> Coordinates { get; set; }

        public DbSet<Location> Locations { get; set; }

        #endregion

        #region Constructor

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        #endregion
    }
}