using MapAYak.Models;

namespace MapAYak.Interfaces
{
    public interface ILocationRepository
    {
        IEnumerable<Location> GetLocations();
        void SaveLocation(Location location);
    }
}
