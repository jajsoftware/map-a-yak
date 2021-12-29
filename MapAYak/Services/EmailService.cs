using MapAYak.Interfaces;
using System.Net;
using System.Net.Mail;

namespace MapAYak.Services
{
    public class EmailService : IEmailService
    {
        #region Data Members

        private readonly IConfiguration _config;

        #endregion

        #region Constructor

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        #endregion

        #region Public Methods

        public bool SendConfirmationEmail(string email, string link)
        {
            return Send(email, "Confirm Email", "confirm your account", link);
        }

        public bool SendPasswordReset(string email, string link)
        {
            return Send(email, "Reset Password", "reset your password", link);
        }

        #endregion

        #region Private Methods

        private bool Send(string email, string subject, string description, string link)
        {
            var message = new MailMessage(_config["EmailService:Email"], email);
            message.Subject = subject;
            message.IsBodyHtml = true;
            message.Body = string.Format("Please {0} by <a href='{1}'>clicking here</a>.", description, link);

            var client = new SmtpClient();
            client.Credentials = new NetworkCredential(_config["EmailService:Email"], _config["EmailService:Password"]);
            client.Host = "mapayak.com";
            client.Port = 587;
            client.EnableSsl = true;

            try
            {
                client.Send(message);
                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion
    }
}
