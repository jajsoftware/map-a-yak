using MapAYak.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MapAYak.Models.Repositories
{
    public class RouteRepository : IRouteRepository
    {
        #region Data Members

        private readonly AppDbContext _appDbContext;

        #endregion

        #region Constructor

        public RouteRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        #endregion

        #region Public Methods

        public IEnumerable<Route> GetRoutes()
        {
            return _appDbContext.Routes
                .Include(c => c.User)
                .Include(c => c.Coordinates.OrderBy(o => o.Order));
        }

        public IEnumerable<Route> GetUserRoutes(string userId)
        {
            return _appDbContext.Routes.Where(c => c.UserId == userId);
        }

        public Route GetRoute(string name)
        {
            return _appDbContext.Routes
                .Where(c => c.Name == name)
                .Include(c => c.Coordinates)
                .SingleOrDefault();
        }

        public void SaveRoute(Route route)
        {
            var count = 0;
            foreach (var coordinate in route.Coordinates)
                coordinate.Order = count++;

            _appDbContext.Routes.Add(route);

            _appDbContext.SaveChanges();
        }

        public void UpdateRoute(Route oldRoute, Route newRoute)
        {
            oldRoute.Description = newRoute.Description;

            foreach (var oldCoordinate in oldRoute.Coordinates)
                _appDbContext.Remove(oldCoordinate);

            var count = 0;
            foreach (var newCoordinate in newRoute.Coordinates)
                _appDbContext.Add(new Coordinate()
                {
                    RouteId = oldRoute.Id,
                    Order = count++,
                    Latitude = newCoordinate.Latitude,
                    Longitude = newCoordinate.Longitude
                });

            _appDbContext.SaveChanges();
        }

        public void DeleteRoute(Route route)
        {
            _appDbContext.Remove(route);

            _appDbContext.SaveChanges();
        }

        #endregion
    }
}
