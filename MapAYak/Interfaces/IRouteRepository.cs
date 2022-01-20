using Route = MapAYak.Models.Route;

namespace MapAYak.Interfaces
{
    public interface IRouteRepository
    {
        IEnumerable<Route> GetRoutes();
        void SaveRoute(Route route);
    }
}
