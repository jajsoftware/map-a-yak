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
            return _appDbContext.Routes.Include(c => c.Coordinates.OrderBy(o => o.Order));
        }

        public void SaveRoute(Route route)
        {
            var count = 0;
            foreach (var coordinate in route.Coordinates)
                coordinate.Order = count++;

            _appDbContext.Routes.Add(route);

            _appDbContext.SaveChanges();
        }

        #endregion
    }
}
