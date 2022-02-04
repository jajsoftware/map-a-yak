using Route = MapAYak.Models.Route;

namespace MapAYak.Interfaces
{
    public interface IRouteRepository
    {
        IEnumerable<Route> GetRoutes();
        IEnumerable<Route> GetUserRoutes(string userId);
        Route GetRoute(string name);
        void SaveRoute(Route route);
        void UpdateRoute(Route oldRoute, Route newRoute);
        void DeleteRoute(Route route);
    }
}
