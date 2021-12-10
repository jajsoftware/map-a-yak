using Microsoft.AspNetCore.Mvc;

namespace MapAYak.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
