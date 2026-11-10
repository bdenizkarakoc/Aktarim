# Aktarim kurulumu: C:\Program Files\Aktarim altina kurar (yonetici izni ister).
# Kullanim (PowerShell):  irm https://raw.githubusercontent.com/bdenizkarakoc/Aktarim/main/Kur.ps1 | iex
$ErrorActionPreference = 'Stop'
$KullaniciMasaustu = [Environment]::GetFolderPath('Desktop'); $KullaniciAppData = $env:APPDATA; $KullaniciLocal = $env:LOCALAPPDATA
for ($i = 0; $i -lt $args.Count - 1; $i++) {
  if ($args[$i] -eq '-KullaniciMasaustu') { $KullaniciMasaustu = $args[$i + 1] }
  if ($args[$i] -eq '-KullaniciAppData') { $KullaniciAppData = $args[$i + 1] }
  if ($args[$i] -eq '-KullaniciLocal') { $KullaniciLocal = $args[$i + 1] }
}
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$base = 'https://raw.githubusercontent.com/bdenizkarakoc/Aktarim/main'

# --- yonetici degilse kendini yonetici olarak yeniden baslat ---
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
  $tmp = Join-Path $env:TEMP 'Aktarim-Kur.ps1'
  Invoke-WebRequest -UseBasicParsing -Uri "$base/Kur.ps1" -OutFile $tmp
  Write-Host 'Yonetici izni isteniyor (C:\Program Files icine kurmak icin)...' -ForegroundColor Yellow
  Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$tmp`" -KullaniciMasaustu `"$([Environment]::GetFolderPath('Desktop'))`" -KullaniciAppData `"$env:APPDATA`" -KullaniciLocal `"$env:LOCALAPPDATA`""
  return
}

$name = 'Aktar' + [char]0x0131 + 'm'
$dest = Join-Path $env:ProgramFiles 'Aktarim'
$files = @('Aktarim.ps1', 'Aktarim.vbs', 'Kaldir.ps1', 'aktarim.ico', 'README.md', 'web/index.html', 'web/app.js', 'web/style.css',
           'web/manifest.webmanifest', 'web/icon.svg')
try {
  Write-Host "Kuruluyor: $dest" -ForegroundColor Cyan
  # calisan eski Aktarim'i kapat
  Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*Aktarim.ps1*' -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  New-Item -ItemType Directory -Force -Path (Join-Path $dest 'web') | Out-Null
  foreach ($f in $files) {
    Write-Host "  indiriliyor: $f"
    Invoke-WebRequest -UseBasicParsing -Uri "$base/$f" -OutFile (Join-Path $dest ($f -replace '/', '\'))
  }
  Get-ChildItem -LiteralPath $dest -Recurse -File | Unblock-File

  $ps1 = Join-Path $dest 'Aktarim.ps1'
  $vbs = Join-Path $dest 'Aktarim.vbs'
  $ico = Join-Path $dest 'aktarim.ico'
  $runArgs = '"' + $vbs + '"'

  # --- kisayollar: Baslat menusu + masaustu ---
  $shell = New-Object -ComObject WScript.Shell
  $startMenu = Join-Path ([Environment]::GetFolderPath('CommonPrograms')) "$name.lnk"
  $desktopLnk = Join-Path ([Environment]::GetFolderPath('CommonDesktopDirectory')) "$name.lnk"
  foreach ($p in @($startMenu, $desktopLnk)) {
    $l = $shell.CreateShortcut($p)
    $l.TargetPath = "$env:WINDIR\System32\wscript.exe"; $l.Arguments = $runArgs; $l.WorkingDirectory = $dest
    $l.IconLocation = "$ico,0"; $l.Description = 'Bilgisayar ile telefon arasinda dosya aktarimi'
    $l.Save()
  }

  # --- Windows acilinca arka planda baslasin (pencere acmadan); telefon her zaman gonderebilsin ---
  $startup = Join-Path ([Environment]::GetFolderPath('CommonStartup')) "$name.lnk"
  $l = $shell.CreateShortcut($startup)
  $l.TargetPath = "$env:WINDIR\System32\wscript.exe"; $l.Arguments = $runArgs + ' -TarayiciAcma'
  $l.WorkingDirectory = $dest; $l.IconLocation = "$ico,0"; $l.Save()

  # --- eski kurulumu (AppData\Local\Aktarim) temizle ---
  $oldLnk = Join-Path $KullaniciMasaustu "$name.lnk"
  if (Test-Path -LiteralPath $oldLnk) {
    $o = $shell.CreateShortcut($oldLnk)
    if ($o.Arguments -like '*AppData*Aktarim*') { Remove-Item -LiteralPath $oldLnk -Force }
  }
  $oldDir = Join-Path $KullaniciLocal 'Aktarim'
  if ((Test-Path -LiteralPath (Join-Path $oldDir 'Aktarim.ps1')) -and -not (Test-Path -LiteralPath (Join-Path $oldDir 'files'))) {
    Remove-Item -LiteralPath $oldDir -Recurse -Force
  }

  # --- sag tik > Gonder menusu ---
  $sendto = Join-Path $KullaniciAppData 'Microsoft\Windows\SendTo'
  if (Test-Path -LiteralPath $sendto) {
    $l = $shell.CreateShortcut((Join-Path $sendto "Telefona g$([char]0x00F6)nder ($name).lnk"))
    $l.TargetPath = 'powershell.exe'; $l.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $ps1 + '" -Ekle'
    $l.IconLocation = "$ico,0"; $l.Save()
    Get-ChildItem -LiteralPath $sendto -Filter '*.bat' | Where-Object { $_.Name -like 'Telefona*' } | Remove-Item -Force
  }

  # --- Ayarlar > Uygulamalar listesine ekle (kaldirma icin) ---
  $key = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Aktarim'
  New-Item -Path $key -Force | Out-Null
  $kb = [int]((Get-ChildItem -LiteralPath $dest -Recurse -File | Measure-Object Length -Sum).Sum / 1KB)
  $vals = @{ DisplayName = $name; DisplayVersion = '2.0.0'; Publisher = $name; InstallLocation = $dest; DisplayIcon = $ico
             UninstallString = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $dest 'Kaldir.ps1') + '"'
             URLInfoAbout = 'https://github.com/bdenizkarakoc/Aktarim' }
  foreach ($k in $vals.Keys) { Set-ItemProperty -Path $key -Name $k -Value $vals[$k] }
  Set-ItemProperty -Path $key -Name EstimatedSize -Value $kb -Type DWord
  Set-ItemProperty -Path $key -Name NoModify -Value 1 -Type DWord
  Set-ItemProperty -Path $key -Name NoRepair -Value 1 -Type DWord

  # --- guvenlik duvari: telefonun baglanabilmesi icin (yalniz ozel ag) ---
  & netsh advfirewall firewall delete rule name="Aktarim" | Out-Null
  & netsh advfirewall firewall add rule name="Aktarim" dir=in action=allow protocol=TCP localport=47800-47809 profile=private | Out-Null

  Write-Host ''
  Write-Host "Kuruldu: $dest" -ForegroundColor Green
  Write-Host "Baslat menusunde ve masaustunde '$name' kisayolu var; saat yaninda simgesi gorunur." -ForegroundColor Green
  Write-Host 'Program simdi aciliyor...' -ForegroundColor Green
  # yonetici olmadan baslat (Gezgin uzerinden)
  Start-Process explorer.exe -ArgumentList "`"$desktopLnk`""
  Start-Sleep -Seconds 3
} catch {
  Write-Host "Kurulum hatasi: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host 'Kapatmak icin Enter'
}
