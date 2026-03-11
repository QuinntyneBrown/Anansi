@echo off
setlocal

:: Resolve repo root (eng\scripts -> repo root)
set "REPO_ROOT=%~dp0..\.."

echo ============================================
echo  Anansi - Starting API + Studio Manager
echo ============================================
echo.
echo  API:     http://localhost:5236
echo  OpenAPI: http://localhost:5236/openapi/v1.json
echo  App:     http://localhost:4200
echo.
echo  Close either window to stop that process.
echo ============================================
echo.

:: Start the .NET API with hot-reload in a new window
start "Anansi API" cmd /k "cd /d %REPO_ROOT% && dotnet watch run --project src\Anansi.Api"

:: Start the Angular studio-manager in a new window
start "Anansi Studio Manager" cmd /k "cd /d %REPO_ROOT%\src\Anansi.Web && npx ng serve studio-manager"

echo Both processes launched in separate windows.
endlocal
