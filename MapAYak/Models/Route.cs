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
        #region Database Fields

        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(10000)]
        public string Description { get; set; }

        #endregion

        #region Relations

        [JsonIgnore]
        public IdentityUser User { get; set; }

        public IEnumerable<Coordinate> Coordinates { get; set; }

        #endregion

        #region Non-Database Fields

        [NotMapped]
        public LayerType LayerType
        {
            get
            {
                return LayerType.Route;
            }
        }

        [NotMapped]
        public string UserName
        {
            get
            {
                return User?.UserName;
            }
        }

        #endregion
    }
}
