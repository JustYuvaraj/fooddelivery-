# Food Delivery Platform - Database Setup Script (PowerShell)
# This script creates the database and loads the schema

param(
    [string]$DbName = "fooddelivery",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [switch]$NoSeed,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\setup.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -DbName NAME      Database name (default: fooddelivery)"
    Write-Host "  -DbUser USER      Database user (default: postgres)"
    Write-Host "  -DbHost HOST      Database host (default: localhost)"
    Write-Host "  -DbPort PORT      Database port (default: 5432)"
    Write-Host "  -NoSeed           Skip loading seed data"
    Write-Host "  -Help             Show this help message"
    exit 0
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Food Delivery Platform - DB Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Get PostgreSQL password
$SecurePassword = Read-Host "Enter PostgreSQL password for user '$DbUser'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for psql
$env:PGPASSWORD = $Password

# Step 1: Create database
Write-Host "[1/3] Creating database '$DbName'..." -ForegroundColor Cyan
$CheckDb = psql -h $DbHost -p $DbPort -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DbName'"

if ($CheckDb -eq "1") {
    Write-Host "✓ Database already exists" -ForegroundColor Green
} else {
    $CreateDb = psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Load schema
Write-Host "[2/3] Loading schema..." -ForegroundColor Cyan
$SchemaPath = Join-Path $ScriptDir "schema.sql"
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $SchemaPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Schema loaded successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to load schema" -ForegroundColor Red
    exit 1
}

# Step 3: Load seed data (optional)
if (-not $NoSeed) {
    Write-Host "[3/3] Loading seed data..." -ForegroundColor Cyan
    $SeedPath = Join-Path $ScriptDir "seed.sql"
    psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $SeedPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Seed data loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to load seed data" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[3/3] Skipping seed data (-NoSeed flag)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database: $DbName"
Write-Host "Host: $DbHost:$DbPort"
Write-Host ""
Write-Host "Test credentials:"
Write-Host "  Customer: customer@test.com / password123"
Write-Host "  Restaurant: restaurant@test.com / password123"
Write-Host "  Delivery: delivery@test.com / password123"
Write-Host "  Admin: admin@test.com / password123"

# Clear password
$env:PGPASSWORD = ""



