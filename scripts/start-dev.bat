@echo off
setlocal enabledelayedexpansion

:: Anansi Development Helper (Windows)
:: Starts database, API, and frontend in parallel

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."

:: Load .env if present
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set "line=%%A"
        if not "!line:~0,1!"=="#" if not "!line!"=="" set "%%A=%%B"
    )
)

:: Defaults
if not defined POSTGRES_USER set "POSTGRES_USER=anansi"
if not defined POSTGRES_PASSWORD set "POSTGRES_PASSWORD=anansi_dev"
if not defined POSTGRES_DB set "POSTGRES_DB=anansi"
if not defined POSTGRES_PORT set "POSTGRES_PORT=5432"

set "APP=studio-manager"
set "TOOLS="

:: Parse arguments
:parse_args
if "%~1"=="" goto :start
if /i "%~1"=="--app" (
    set "APP=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--tools" (
    set "TOOLS=1"
    shift
    goto :parse_args
)
if /i "%~1"=="--help" goto :usage
shift
goto :parse_args

:usage
echo.
echo  Anansi Development Launcher
echo  ============================
echo.
echo  Usage: start-dev.bat [options]
echo.
echo  Options:
echo    --app ^<name^>   Angular app to serve (default: studio-manager)
echo    --tools        Also start pgAdmin on port 5050
echo    --help         Show this help
echo.
echo  Apps: studio-manager, client-gallery, online-store,
echo        website-builder, booking-site, mobile-gallery
echo.
echo  Examples:
echo    start-dev.bat                          Start db + api + studio-manager
echo    start-dev.bat --app client-gallery     Start db + api + client-gallery
echo    start-dev.bat --tools                  Start db + pgAdmin + api + studio-manager
echo.
exit /b 0

:start
echo.
echo  ============================================
echo   Anansi Development Environment
echo  ============================================
echo.

:: 1. Start Docker services
echo [1/3] Starting PostgreSQL...
if defined TOOLS (
    docker compose --profile tools up -d
    echo       pgAdmin: http://localhost:5050
) else (
    docker compose up -d
)

:: Wait for PostgreSQL to be healthy
echo       Waiting for PostgreSQL to be ready...
:wait_pg
docker compose exec -T db pg_isready -U %POSTGRES_USER% >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_pg
)
echo       PostgreSQL ready on localhost:%POSTGRES_PORT%
echo.

:: 2. Start API in a new terminal
echo [2/3] Starting API (dotnet watch)...
start "Anansi API" cmd /k "cd /d "%CD%" && dotnet watch run --project src\Anansi.Api"
echo       API will be at http://localhost:5236
echo.

:: 3. Give the API a moment to start, then launch Angular
echo [3/3] Starting Angular app: %APP%...
timeout /t 3 /nobreak >nul
start "Anansi Frontend" cmd /k "cd /d "%CD%\src\Anansi.Web" && npx ng serve %APP% --open"
echo       Frontend will be at http://localhost:4200
echo.

echo  ============================================
echo   All services launched!
echo.
echo   Database:  localhost:%POSTGRES_PORT%
echo   API:       http://localhost:5236
echo   Frontend:  http://localhost:4200 (%APP%)
if defined TOOLS echo   pgAdmin:   http://localhost:5050
echo.
echo   Close the spawned terminal windows to stop
echo   API and Frontend. Run 'docker compose down'
echo   to stop the database.
echo  ============================================
echo.
