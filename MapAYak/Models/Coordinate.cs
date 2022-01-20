using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MapAYak.Models
{
    public class Coordinate
    {
        public int Id { get; set; }

        public int RouteId { get; set; }

        public int Order { get; set; }

        [Precision(18, 6)]
        [Range(-90, 90)]
        public decimal Latitude { get; set; }

        [Precision(18, 6)]
        [Range(-180, 180)]
        public decimal Longitude { get; set; }



        [JsonIgnore]
        public Route Route { get; set; }
    }
}
