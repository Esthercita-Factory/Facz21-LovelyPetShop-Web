# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY ["LovelyPetShop.Domain/LovelyPetShop.Domain.csproj", "LovelyPetShop.Domain/"]
COPY ["LovelyPetShop.DataAccess/LovelyPetShop.DataAccess.csproj", "LovelyPetShop.DataAccess/"]
COPY ["LovelyPetShop.Business/LovelyPetShop.Business.csproj", "LovelyPetShop.Business/"]
COPY ["LovelyPetShop.API/LovelyPetShop.API.csproj", "LovelyPetShop.API/"]
COPY ["LovelyPetShop.Tests/LovelyPetShop.Tests.csproj", "LovelyPetShop.Tests/"]

RUN dotnet restore "LovelyPetShop.API/LovelyPetShop.API.csproj"

# Copy full source and publish
COPY . .
WORKDIR "/src/LovelyPetShop.API"
RUN dotnet publish "LovelyPetShop.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "LovelyPetShop.API.dll"]
