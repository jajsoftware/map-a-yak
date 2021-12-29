using System.ComponentModel.DataAnnotations;

namespace MapAYak.ViewModels
{
    public class EmailViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
