# Aktarim'i kaldirir. Telefonla aktarilan dosyalar (Masaustu\Aktarim) SILINMEZ.
$ErrorActionPreference = 'Continue'
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
  Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" `"$env:APPDATA`""
  return
}
$userAppData = $env:APPDATA
if ($args.Count -ge 1) { $userAppData = $args[0] }
$name = 'Aktar' + [char]0x0131 + 'm'
$dest = Join-Path $env:ProgramFiles 'Aktarim'
$answer = Read-Host "$name kaldirilsin mi? Aktarilan dosyalarin silinmez. (E/H)"
if ($answer -notmatch '^[eEyY]') { return }
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*Aktarim.ps1*' -and $_.ProcessId -ne $PID } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
foreach ($p in @((Join-Path ([Environment]::GetFolderPath('CommonPrograms')) "$name.lnk"),
                 (Join-Path ([Environment]::GetFolderPath('CommonStartup')) "$name.lnk"),
                 (Join-Path ([Environment]::GetFolderPath('CommonDesktopDirectory')) "$name.lnk"))) {
  if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Force }
}
$sendto = Join-Path $userAppData 'Microsoft\Windows\SendTo'
Get-ChildItem -LiteralPath $sendto -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "Telefona*$name*" } | Remove-Item -Force
Remove-Item -Path 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Aktarim' -Recurse -Force -ErrorAction SilentlyContinue
& netsh advfirewall firewall delete rule name="Aktarim" | Out-Null
Set-Location $env:TEMP
Remove-Item -LiteralPath $dest -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "$name kaldirildi." -ForegroundColor Green
Start-Sleep -Seconds 3
