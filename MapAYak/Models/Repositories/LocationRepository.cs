using MapAYak.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MapAYak.Models.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        #region Data Members

        private readonly AppDbContext _appDbContext;

        #endregion

        #region Constructor

        public LocationRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        #endregion

        #region Public Methods

        public IEnumerable<Location> GetLocations()
        {
            return _appDbContext.Locations
                .Include(c => c.User);
        }

        public void SaveLocation(Location location)
        {
            _appDbContext.Locations.Add(location);

            _appDbContext.SaveChanges();
        }

        #endregion
    }
}
