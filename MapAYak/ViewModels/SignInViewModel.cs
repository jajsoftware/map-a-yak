using System.ComponentModel.DataAnnotations;

namespace MapAYak.ViewModels
{
    public class SignInViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Display(Name = "Remember Password")]
        public bool RememberPassword { get; set; }

        public bool ShowResendEmailConfirmation { get; set; }
    }
}
