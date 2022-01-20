using MapAYak.Interfaces;
using MapAYak.Models;
using MapAYak.Models.Repositories;
using MapAYak.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

//==============================================================================
// Services
//==============================================================================

var builder = WebApplication.CreateBuilder(args);

// Holds connection string and email credentials.
builder.Configuration.AddJsonFile("secrets.json", true);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services
    .AddDefaultIdentity<IdentityUser>(options =>
    {
        options.SignIn.RequireConfirmedEmail = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRouteRepository, RouteRepository>();
builder.Services.AddScoped<ILocationRepository, LocationRepository>();

builder.Services.AddControllersWithViews();

//==============================================================================
// Middleware
//==============================================================================

var app = builder.Build();

if (!app.Environment.IsDevelopment())
    app.UseHsts();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
