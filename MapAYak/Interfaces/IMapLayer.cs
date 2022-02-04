using MapAYak.Models;

namespace MapAYak.Interfaces
{
    public interface IMapLayer
    {
        LayerType LayerType { get; }
        string Name { get; }
        string Description { get; }
    }
}
