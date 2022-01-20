using Microsoft.AspNetCore.Mvc;

namespace MapAYak.Controllers
{
    public class HomeController : Controller
    {
        #region Actions

        public IActionResult Index()
        {
            return View();
        }

        #endregion
    }
}
