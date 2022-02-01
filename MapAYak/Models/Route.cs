using MapAYak.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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



        [JsonIgnore]
        public IdentityUser User { get; set; }

        public IEnumerable<Coordinate> Coordinates { get; set; }



        [NotMapped]
        public string UserName
        {
            get
            {
                return User.UserName;
            }
        }
    }
}
