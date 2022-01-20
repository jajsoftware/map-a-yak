using MapAYak.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace MapAYak.Models
{
    [Index(nameof(Name), IsUnique = true)]
    public class Route : IMapLayer
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(10000)]
        public string Description { get; set; }



        public IdentityUser User { get; set; }

        public IEnumerable<Coordinate> Coordinates { get; set; }
    }
}
