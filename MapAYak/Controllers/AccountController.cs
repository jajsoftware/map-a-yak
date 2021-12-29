using MapAYak.Interfaces;
using MapAYak.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace MapAYak.Controllers
{
    public class AccountController : Controller
    {
        #region Data Members

        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IEmailService _emailService;

        #endregion

        #region Constructor

        public AccountController(SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager, IEmailService emailService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
        }

        #endregion

        #region Actions

        [HttpGet]
        public IActionResult SignIn()
        {
            return View();
        }

        [HttpPost]
        public IActionResult SignIn(SignInViewModel model)
        {
            model.ShowResendEmailConfirmation = false;

            if (!ModelState.IsValid)
                return View(model);

            var user = _userManager.FindByEmailAsync(model.Email).Result;

            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Invalid sign in attempt.");
                return View(model);
            }

            if (!user.EmailConfirmed)
            {
                model.ShowResendEmailConfirmation = true;
                ModelState.AddModelError(string.Empty, "Email not confirmed.");
                return View(model);
            }

            var result = _signInManager.PasswordSignInAsync(user, model.Password, model.RememberPassword, false).Result;
            if (!result.Succeeded)
            {
                ModelState.AddModelError(string.Empty, "Invalid sign in attempt.");
                return View(model);
            }

            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult SignOutUser()
        {
            _signInManager.SignOutAsync();

            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = new IdentityUser()
            {
                Email = model.Email,
                UserName = model.UserName
            };

            var result = _userManager.CreateAsync(user, model.Password).Result;
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);

                return View(model);
            }

            return SendEmailConfirmation(user, model);
        }

        [HttpGet]
        public IActionResult EmailConfirmationSent()
        {
            return View();
        }

        [HttpGet]
        public IActionResult ConfirmEmail(string token, string email)
        {
            ViewBag.Message = "Error confirming your email.";

            var user = _userManager.FindByEmailAsync(email).Result;
            if (user == null)
                return View();

            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

            var result = _userManager.ConfirmEmailAsync(user, token).Result;
            if (!result.Succeeded)
                return View();

            _signInManager.SignInAsync(user, false);

            ViewBag.Message = "Thank you for confirming your email.";
            return View();
        }

        [HttpGet]
        public IActionResult ResendEmailConfirmation()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ResendEmailConfirmation(EmailViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = _userManager.FindByEmailAsync(model.Email).Result;
            if (user == null)
                return RedirectToAction("EmailConfirmationSent", "Account");

            return SendEmailConfirmation(user, model);
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ForgotPassword(EmailViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = _userManager.FindByEmailAsync(model.Email).Result;
            if (user == null)
                return RedirectToAction("PasswordResetSent", "Account");

            var token = _userManager.GeneratePasswordResetTokenAsync(user).Result;
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var resetLink = Url.Action("ResetPassword", "Account", new { token }, Request.Scheme);

            var emailSent = _emailService.SendPasswordReset(user.Email, resetLink);
            if (!emailSent)
            {
                ModelState.AddModelError(string.Empty, "Failed to send email.");
                return View(model);
            }

            return RedirectToAction("PasswordResetSent", "Account");
        }

        [HttpGet]
        public IActionResult PasswordResetSent()
        {
            return View();
        }

        [HttpGet]
        public IActionResult ResetPassword(string token)
        {
            var model = new ResetPasswordViewModel()
            {
                // Had to be named differently than token otherwise got overwritten.
                DecodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token))
            };

            return View(model);
        }

        [HttpPost]
        public IActionResult ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = _userManager.FindByEmailAsync(model.Email).Result;
            if (user == null)
                return RedirectToAction("ResetPasswordConfirmation", "Account");

            var result = _userManager.ResetPasswordAsync(user, model.DecodedToken, model.Password).Result;
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);

                return View(model);
            }

            return RedirectToAction("ResetPasswordConfirmation", "Account");
        }

        [HttpGet]
        public IActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        #endregion

        #region Private Methods

        private IActionResult SendEmailConfirmation<T>(IdentityUser user, T model)
        {
            var token = _userManager.GenerateEmailConfirmationTokenAsync(user).Result;
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var confirmationLink = Url.Action("ConfirmEmail", "Account", new { token, email = user.Email }, Request.Scheme);

            var emailSent = _emailService.SendConfirmationEmail(user.Email, confirmationLink);
            if (!emailSent)
            {
                ModelState.AddModelError(string.Empty, "Failed to send email.");
                return View(model);
            }

            return RedirectToAction("EmailConfirmationSent", "Account");
        }

        #endregion
    }
}
