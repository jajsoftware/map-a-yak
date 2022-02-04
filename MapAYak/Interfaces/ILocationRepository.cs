using MapAYak.Models;

namespace MapAYak.Interfaces
{
    public interface ILocationRepository
    {
        IEnumerable<Location> GetLocations();
        IEnumerable<Location> GetUserLocations(string userId);
        Location GetLocation(string name);
        void SaveLocation(Location location);
        void UpdateLocation(Location oldLocation, Location newLocation);
        void DeleteLocation(Location location);
    }
}
