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

        public IEnumerable<IMapLayer> UserLayers(string userId)
        {
            var routes = _routeRepository.GetUserRoutes(userId) as IEnumerable<IMapLayer>;
            var locations = _locationRepository.GetUserLocations(userId) as IEnumerable<IMapLayer>;

            return routes.Concat(locations);
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

            if (!ModelState.IsValid)
                return PartialView("_Partial_Modal_Save", route);

            var userId = _userManager.GetUserId(User);
            if (route.UserId != userId)
            {
                ModelState.AddModelError(string.Empty, "Cannot add route for another user.");
                return PartialView("_Partial_Modal_Save", route);
            }

            _routeRepository.SaveRoute(route);

            return StatusCode(201);
        }

        [Authorize]
        [HttpPost]
        public IActionResult SaveLocation(Location location)
        {
            if (!ModelState.IsValid)
                return PartialView("_Partial_Modal_Save", location);

            var userId = _userManager.GetUserId(User);
            if (location.UserId != userId)
            {
                ModelState.AddModelError(string.Empty, "Cannot add location for another user.");
                return PartialView("_Partial_Modal_Save", location);
            }

            _locationRepository.SaveLocation(location);

            return StatusCode(201);
        }

        [Authorize]
        [HttpPost]
        public IActionResult UpdateRoute(Route newRoute)
        {
            if (newRoute.Coordinates == null || newRoute.Coordinates.Count() < 2)
            {
                ModelState.AddModelError(string.Empty, "No route data selected.");
                return PartialView("_Partial_Modal_Save", newRoute);
            }

            if (!ModelState.IsValid)
                return PartialView("_Partial_Modal_Save", newRoute);

            var oldRoute = _routeRepository.GetRoute(newRoute.Name);
            if (oldRoute == null)
            {
                ModelState.AddModelError(string.Empty, "Route not found.");
                return PartialView("_Partial_Modal_Save", newRoute);
            }

            var userId = _userManager.GetUserId(User);
            if (oldRoute.UserId != userId)
            {
                ModelState.AddModelError(string.Empty, "Cannot update another user's route.");
                return PartialView("_Partial_Modal_Save", newRoute);
            }

            _routeRepository.UpdateRoute(oldRoute, newRoute);

            return StatusCode(201);
        }

        [Authorize]
        [HttpPost]
        public IActionResult UpdateLocation(Location newLocation)
        {
            if (!ModelState.IsValid)
                return PartialView("_Partial_Modal_Save", newLocation);

            var oldLocation = _locationRepository.GetLocation(newLocation.Name);
            if (oldLocation == null)
            {
                ModelState.AddModelError(string.Empty, "Location not found.");
                return PartialView("_Partial_Modal_Save", newLocation);
            }

            var userId = _userManager.GetUserId(User);
            if (oldLocation.UserId != userId)
            {
                ModelState.AddModelError(string.Empty, "Cannot update another user's location.");
                return PartialView("_Partial_Modal_Save", newLocation);
            }

            _locationRepository.UpdateLocation(oldLocation, newLocation);

            return StatusCode(201);
        }

        [Authorize]
        public IActionResult DeleteRoute(string name)
        {
            var route = _routeRepository.GetRoute(name);
            if (route == null)
                return Json("Route not found.");

            var userId = _userManager.GetUserId(User);
            if (route.UserId != userId)
                return Json("Cannot delete another user's route.");

            _routeRepository.DeleteRoute(route);

            return StatusCode(201);
        }

        [Authorize]
        public IActionResult DeleteLocation(string name)
        {
            var location = _locationRepository.GetLocation(name);
            if (location == null)
                return Json("Location not found.");

            var userId = _userManager.GetUserId(User);
            if (location.UserId != userId)
                return Json("Cannot delete another user's location.");

            _locationRepository.DeleteLocation(location);

            return StatusCode(201);
        }

        #endregion
    }
}
