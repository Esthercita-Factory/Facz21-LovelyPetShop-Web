using System.Text;
using LovelyPetShop.Business.Services;
using LovelyPetShop.DataAccess.Repositories;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Direct Data Access JSON paths
string dataDirectory = Path.Combine(builder.Environment.ContentRootPath, "Data");
Directory.CreateDirectory(dataDirectory);

string ownersFilePath = Path.Combine(dataDirectory, "owners.json");
string petsFilePath = Path.Combine(dataDirectory, "pets.json");
string appointmentsFilePath = Path.Combine(dataDirectory, "appointments.json");
string medicalRecordsFilePath = Path.Combine(dataDirectory, "medical_records.json");
string employeesFilePath = Path.Combine(dataDirectory, "employees.json");
string productsFilePath = Path.Combine(dataDirectory, "products.json");
string usersFilePath = Path.Combine(dataDirectory, "users.json");
string hospitalizationFilePath = Path.Combine(dataDirectory, "hospitalizations.json");
string auditLogsFilePath = Path.Combine(dataDirectory, "audit_logs.json");

// Register Repositories
builder.Services.AddSingleton<IOwnerRepository>(new JsonOwnerRepository(ownersFilePath));
builder.Services.AddSingleton<IPetRepository>(new JsonPetRepository(petsFilePath));
builder.Services.AddSingleton<IAppointmentRepository>(new JsonAppointmentRepository(appointmentsFilePath));
builder.Services.AddSingleton<IMedicalRecordRepository>(new JsonMedicalRecordRepository(medicalRecordsFilePath));
builder.Services.AddSingleton<IEmployeeRepository>(new JsonEmployeeRepository(employeesFilePath));
builder.Services.AddSingleton<IProductRepository>(new JsonProductRepository(productsFilePath));
builder.Services.AddSingleton<IUserRepository>(new JsonUserRepository(usersFilePath));
builder.Services.AddSingleton<IHospitalizationRepository>(new JsonHospitalizationRepository(hospitalizationFilePath));
builder.Services.AddSingleton<IAuditRepository>(new JsonAuditRepository(auditLogsFilePath));

// Register Services
builder.Services.AddScoped<IOwnerService, OwnerService>();
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IHospitalizationService, HospitalizationService>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:SecretKey"] ?? "LovelyPetShopSuperSecretKey2026!#ForSecurity*&SafeTokenGenerator";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LovelyPetShop";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LovelyPetShopUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

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

// Ensure seed default users exist
using (var scope = app.Services.CreateScope())
{
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    await authService.EnsureSeedUsersAsync();
}

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

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/salud", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
