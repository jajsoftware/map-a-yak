using MapAYak.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MapAYak.Models
{
    [Index(nameof(Name), IsUnique = true)]
    public class Location : IMapLayer
    {
        #region Database Fields

        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        public LocationType Type { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(10000)]
        public string Description { get; set; }

        [Precision(18, 6)]
        [Range(-90, 90)]
        public decimal Latitude { get; set; }

        [Precision(18, 6)]
        [Range(-180, 180)]
        public decimal Longitude { get; set; }

        #endregion

        #region Relations

        [JsonIgnore]
        public IdentityUser User { get; set; }

        #endregion

        #region Non-Database Fields

        [NotMapped]
        public LayerType LayerType
        {
            get
            {
                return Type == LocationType.Portage ? LayerType.Portage : LayerType.Campsite;
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
