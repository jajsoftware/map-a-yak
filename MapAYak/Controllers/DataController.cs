using MapAYak.Interfaces;
using MapAYak.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Route = MapAYak.Models.Route;

namespace MapAYak.Controllers
{
    public class DataController : Controller
    {
        #region Data Members

        private readonly UserManager<IdentityUser> _userManager;
        private readonly IRouteRepository _routeRepository;
        private readonly ILocationRepository _locationRepository;

        #endregion

        #region Constructor

        public DataController(UserManager<IdentityUser> userManager,
            IRouteRepository routeRepository, ILocationRepository locationRepository)
        {
            _userManager = userManager;
            _routeRepository = routeRepository;
            _locationRepository = locationRepository;
        }

        #endregion

        #region Actions

        public IEnumerable<Route> Routes()
        {
            return _routeRepository.GetRoutes();
        }

        public IEnumerable<Location> Locations()
        {
            return _locationRepository.GetLocations();
        }

        [Authorize]
        [HttpPost]
        public IActionResult SaveRoute(Route route)
        {
            if (route.Coordinates == null || route.Coordinates.Count() < 2)
            {
                ModelState.AddModelError(string.Empty, "No route data selected.");
                return PartialView("_Partial_Modal_Save", route);
            }

            route.UserId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
                return PartialView("_Partial_Modal_Save", route);

            _routeRepository.SaveRoute(route);

            return StatusCode(201);
        }

        [Authorize]
        [HttpPost]
        public IActionResult SaveLocation(Location location)
        {
            location.UserId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
                return PartialView("_Partial_Modal_Save", location);

            _locationRepository.SaveLocation(location);

            return StatusCode(201);
        }

        #endregion
    }
}
