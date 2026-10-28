# One-time setup: register THIS Windows PC as a GitHub Actions runner for the
# "E2E tests (manual)" workflow, so "run_on: my-computer" opens a real Chrome window here.
#
#   powershell -ExecutionPolicy Bypass -File tools\runner\setup-windows.ps1
#
# You need a registration token from:
#   GitHub repo -> Settings -> Actions -> Runners -> New self-hosted runner (Windows)
#   (the long value after "--token" on that page; it expires after 1 hour).
#
# The runner is installed OUTSIDE this repository (default C:\agt-runner) and is labelled "agt-local".
# It is NOT installed as a Windows service: a service cannot open windows on your screen.
# Start it when you want to run tests:   C:\agt-runner\run.cmd   (keep that window open)

param(
  [string]$Repo = 'romielmellizacomputo/agentic-testing-framework',
  [string]$Dir = 'C:\agt-runner',
  [string]$Name = "$env:COMPUTERNAME-agt"
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (Test-Path "$Dir\.runner") {
  Write-Host "A runner is already configured in $Dir. Start it with: $Dir\run.cmd"
  Write-Host "To re-register: cd $Dir; .\config.cmd remove --token <removal token>  then run this script again."
  exit 0
}

# Latest official runner release (github.com/actions/runner), Windows x64.
$rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/actions/runner/releases/latest' -Headers @{ 'User-Agent' = 'agt-runner-setup' }
$asset = $rel.assets | Where-Object { $_.name -like 'actions-runner-win-x64-*.zip' } | Select-Object -First 1
if (-not $asset) { throw 'Could not find the Windows runner package in the latest release.' }

New-Item -ItemType Directory -Force -Path $Dir | Out-Null
$zip = Join-Path $Dir $asset.name
Write-Host "Downloading $($asset.name) from github.com/actions/runner ..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing

# Verify the SHA-256 published by GitHub for this file.
if ($asset.digest -and $asset.digest -like 'sha256:*') {
  $expected = $asset.digest.Substring(7).ToLower()
  $actual = (Get-FileHash -Algorithm SHA256 $zip).Hash.ToLower()
  if ($expected -ne $actual) { Remove-Item $zip; throw "Checksum mismatch for $($asset.name). Download removed." }
  Write-Host 'Checksum OK.'
} else {
  Write-Warning 'GitHub did not publish a checksum for this file; continuing without verification.'
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $Dir)
Remove-Item $zip

# Ask for the token without echoing it.
$sec = Read-Host -AsSecureString 'Paste the registration token from the "New self-hosted runner" page'
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))

Push-Location $Dir
try {
  & .\config.cmd --unattended --url "https://github.com/$Repo" --token $token --name $Name --labels agt-local --work _work --replace
  if ($LASTEXITCODE -ne 0) { throw 'Runner registration failed (token expired? get a new one and try again).' }
} finally { Pop-Location; $token = $null }

Write-Host ''
Write-Host "Done. Runner '$Name' is registered with the label agt-local."
Write-Host "Start it whenever you want to run tests from GitHub on this PC:"
Write-Host "    $Dir\run.cmd"
Write-Host 'Then: Actions -> E2E tests (manual) -> Run workflow -> run_on: my-computer.'
