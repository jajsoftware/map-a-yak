namespace MapAYak.Interfaces
{
    public interface IEmailService
    {
        bool SendConfirmationEmail(string email, string link);
        bool SendPasswordReset(string email, string link);
    }
}
