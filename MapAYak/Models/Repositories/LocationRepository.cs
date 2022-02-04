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

        public IEnumerable<Location> GetUserLocations(string userId)
        {
            return _appDbContext.Locations.Where(c => c.UserId == userId);
        }

        public Location GetLocation(string name)
        {
            return _appDbContext.Locations
                .Where(c => c.Name == name)
                .SingleOrDefault();
        }

        public void SaveLocation(Location location)
        {
            _appDbContext.Locations.Add(location);

            _appDbContext.SaveChanges();
        }

        public void UpdateLocation(Location oldLocation, Location newLocation)
        {
            oldLocation.Description = newLocation.Description;
            oldLocation.Latitude = newLocation.Latitude;
            oldLocation.Longitude = newLocation.Longitude;

            _appDbContext.SaveChanges();
        }

        public void DeleteLocation(Location location)
        {
            _appDbContext.Remove(location);

            _appDbContext.SaveChanges();
        }

        #endregion
    }
}
