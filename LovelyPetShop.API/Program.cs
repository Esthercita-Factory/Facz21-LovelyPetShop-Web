using LovelyPetShop.Domain.Interfaces;
using LovelyPetShop.DataAccess.Repositories;
using LovelyPetShop.Business.Services;

var builder = WebApplication.CreateBuilder(args);

// Direct Data Access JSON paths
string dataDirectory = Path.Combine(builder.Environment.ContentRootPath, "Data");
Directory.CreateDirectory(dataDirectory);

string ownersFilePath = Path.Combine(dataDirectory, "owners.json");
string petsFilePath = Path.Combine(dataDirectory, "pets.json");

builder.Services.AddSingleton<IOwnerRepository>(new JsonOwnerRepository(ownersFilePath));
builder.Services.AddSingleton<IPetRepository>(new JsonPetRepository(petsFilePath));

builder.Services.AddScoped<IOwnerService, OwnerService>();
builder.Services.AddScoped<IPetService, PetService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure HTTP pipeline
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LovelyPetShop API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

app.Run();
