# scribe installer for Windows
# Usage: irm https://cdn.simse.dev/install.ps1 | iex

$ErrorActionPreference = "Stop"

$Repo = "telordev/scribe"
$BinaryName = "scribe.exe"
$InstallDir = "$env:LOCALAPPDATA\scribe\bin"

# ---------------------------------------------------------------------------
# Detect architecture
# ---------------------------------------------------------------------------

$Arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
switch ($Arch) {
    "X64"   { $Platform = "windows-x86_64" }
    "Arm64" { $Platform = "windows-aarch64" }

    default { Write-Error "Unsupported architecture: $Arch"; exit 1 }
}

# ---------------------------------------------------------------------------
# Get latest version
# ---------------------------------------------------------------------------

Write-Host "Fetching latest version..." -ForegroundColor Cyan
$Release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
$Version = $Release.tag_name

if (-not $Version) {
    Write-Error "Could not determine latest version"
    exit 1
}

# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------

$FileName = "scribe-${Platform}.zip"
$Url = "https://github.com/$Repo/releases/download/$Version/$FileName"

Write-Host "Downloading scribe $Version for $Platform..." -ForegroundColor Cyan

$TmpDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "scribe-install-$(Get-Random)")
$TmpFile = Join-Path $TmpDir $FileName

try {
    Invoke-WebRequest -Uri $Url -OutFile $TmpFile -UseBasicParsing
} catch {
    Write-Error "Download failed: $_"
    exit 1
}

# ---------------------------------------------------------------------------
# Verify checksum
# ---------------------------------------------------------------------------
# Fails CLOSED, matching install.sh: an attacker who can serve a tampered
# archive can also withhold or strip SHA256SUMS, so treating an absent sums
# file or an absent entry as "nothing to check" hands that attacker the
# verification bypass for free. Both abort instead. Every current release
# publishes SHA256SUMS, and Get-FileHash is built into the Windows PowerShell
# that runs this script, so unlike the Unix path there is no tolerated gap
# here at all: the archive is always hashed and always compared.

$SumsUrl = "https://github.com/$Repo/releases/download/$Version/SHA256SUMS"
$SumsFile = Join-Path $TmpDir "SHA256SUMS"
try {
    Invoke-WebRequest -Uri $SumsUrl -OutFile $SumsFile -UseBasicParsing
} catch {
    Write-Error "Could not download SHA256SUMS - refusing to install an unverified archive"
    exit 1
}

# Exact filename match on field 2 so a name that merely contains this
# archive's name cannot supply the expected hash.
$Expected = $null
foreach ($Line in Get-Content $SumsFile) {
    $Parts = $Line -split '\s+', 2
    if ($Parts.Count -eq 2 -and $Parts[1].Trim() -eq $FileName) {
        $Expected = $Parts[0].Trim().ToLower()
    }
}
if (-not $Expected) {
    Write-Error "SHA256SUMS has no entry for ${FileName} - refusing to install an unverified archive"
    exit 1
}

$Actual = (Get-FileHash -Path $TmpFile -Algorithm SHA256).Hash.ToLower()
if ($Actual -ne $Expected) {
    Write-Error "Checksum mismatch for ${FileName}: expected $Expected, got $Actual"
    exit 1
}
Write-Host "Checksum verified" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Extract and install
# ---------------------------------------------------------------------------

Expand-Archive -Path $TmpFile -DestinationPath $TmpDir -Force

# ---------------------------------------------------------------------------
# Remove old versions from common locations
# ---------------------------------------------------------------------------

$OldLocations = @(
    "$env:ProgramFiles\scribe\scribe.exe",
    "$env:USERPROFILE\.cargo\bin\scribe.exe",
    "$env:USERPROFILE\bin\scribe.exe",
    "$env:USERPROFILE\scoop\shims\scribe.exe"
)

foreach ($OldPath in $OldLocations) {
    if (Test-Path $OldPath) {
        Write-Host "Removing old scribe at $OldPath" -ForegroundColor Yellow
        Remove-Item -Force $OldPath -ErrorAction SilentlyContinue
    }
}

# Also remove from install dir if it exists (will be replaced)
$ExistingInstall = Join-Path $InstallDir $BinaryName
if (Test-Path $ExistingInstall) {
    Remove-Item -Force $ExistingInstall -ErrorAction SilentlyContinue
}

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Archive layout: bin\scribe.exe, LICENSE and README.md — that is the whole
# tree scripts/assemble-dist.sh zips. The binary embeds the plugin engine;
# first-party plugins are fetched on demand (scribe plugins install <name>)
# into the user's config directory, not shipped in the archive. Same statement
# as install.sh makes at the matching point.
$SrcBin = Join-Path $TmpDir "bin\$BinaryName"
if (-not (Test-Path $SrcBin)) {
    Write-Error "Archive missing bin\$BinaryName"
    exit 1
}

Copy-Item -Path $SrcBin -Destination (Join-Path $InstallDir $BinaryName) -Force

# ---------------------------------------------------------------------------
# Add to PATH if needed
# ---------------------------------------------------------------------------

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host "Adding $InstallDir to your PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
    $env:Path = "$env:Path;$InstallDir"
}

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Reload PATH in current session
# ---------------------------------------------------------------------------

$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

Write-Host ""
Write-Host "scribe $Version installed to $InstallDir\scribe.exe" -ForegroundColor Green
Write-Host "Run 'scribe' to get started." -ForegroundColor Green
