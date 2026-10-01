param(
    [switch]$BuildOnly,
    [switch]$SkipBuild,
    [string]$DeviceId,
    [string]$Architecture = 'arm64-v8a'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$toolsRoot = Join-Path $repoRoot '.tools'
$sdkRoot = Join-Path $toolsRoot 'android-sdk'
$node = Join-Path $toolsRoot 'node/node_modules/node/bin/node.exe'
$adb = Join-Path $sdkRoot 'platform-tools/adb.exe'
$php = 'C:/laragon/bin/php/php-8.3.33-Win32-vs16-x64/php.exe'
$mysql = 'C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysqld.exe'
$mysqlConfig = 'C:/laragon/bin/mysql/mysql-8.4.3-winx64/my.ini'

foreach ($required in @($node, $adb, $php, "$sdkRoot/platforms/android-36/android.jar", "$sdkRoot/ndk/27.1.12297006/source.properties")) {
    if (!(Test-Path -LiteralPath $required)) { throw "Setup is incomplete: $required is missing." }
}
if (!$env:JAVA_HOME) { $env:JAVA_HOME = 'C:/Program Files/Microsoft/jdk-17.0.11.9-hotspot' }
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:GRADLE_USER_HOME = Join-Path $toolsRoot 'gradle'
$env:PATH = "$(Split-Path $node);$(Split-Path $adb);$env:PATH"
$env:DEBUG = ''

function Invoke-Adb {
    & $adb @script:deviceArgs @args
    if ($LASTEXITCODE -ne 0) { throw "ADB failed: $args" }
}

function Test-Port([int]$Port) {
    $client = New-Object Net.Sockets.TcpClient
    try { $client.Connect('127.0.0.1', $Port); return $true }
    catch { return $false }
    finally { $client.Dispose() }
}

function Start-DevServer([string]$Name, [string]$Executable, [string[]]$Arguments, [string]$Directory, [int]$Port) {
    if (!(Test-Port $Port)) {
        $process = Start-Process -FilePath $Executable -ArgumentList $Arguments -WorkingDirectory $Directory -WindowStyle Hidden -PassThru `
            -RedirectStandardOutput "$toolsRoot/$Name.log" -RedirectStandardError "$toolsRoot/$Name-error.log"
        for ($attempt = 0; $attempt -lt 60; $attempt++) {
            if (Test-Port $Port) { break }
            if ($process.HasExited) { throw "$Name stopped. Check $toolsRoot/$Name-error.log" }
            Start-Sleep -Seconds 1
        }
        if (!(Test-Port $Port)) { throw "$Name is not ready. Check $toolsRoot/$Name.log" }
    }
    Write-Host "$Name ready on port $Port"
}

$script:deviceArgs = @()
if (!$BuildOnly) {
    $devices = & $adb devices
    $ready = @($devices | Where-Object { $_ -match '^\S+\s+device$' } | ForEach-Object { ($_ -split '\s+')[0] })
    if ($DeviceId) {
        if ($DeviceId -notin $ready) { throw 'Selected phone is not authorized. Unlock it and allow USB debugging.' }
    } elseif ($ready.Count -eq 1) { $DeviceId = $ready[0] }
    elseif ($ready.Count -gt 1) { throw 'Multiple devices found. Use -DeviceId SERIAL.' }
    else { throw 'Connect the phone with a data cable, enable USB debugging, and accept its authorization prompt. Use -BuildOnly to prepare APKs without a phone.' }
    $script:deviceArgs = @('-s', $DeviceId)
    $Architecture = (Invoke-Adb shell getprop ro.product.cpu.abi | Out-String).Trim()
}

foreach ($app in @('customer', 'provider')) {
    $port = if ($app -eq 'customer') { 8081 } else { 8082 }
    $androidDir = Join-Path $repoRoot "apps/$app/android"
    Set-Content "$androidDir/local.properties" ('sdk.dir=' + $sdkRoot.Replace('\', '/')) -Encoding ascii
    if (!$SkipBuild) {
        Push-Location $androidDir
        try {
            & ./gradlew.bat :app:assembleDebug "-PreactNativeArchitectures=$Architecture" "-PreactNativeDevServerPort=$port" --max-workers=2 --build-cache --console=plain
            if ($LASTEXITCODE -ne 0) { throw "$app Android build failed." }
        } finally { Pop-Location }
    }
    if (!(Test-Path "$androidDir/app/build/outputs/apk/debug/app-debug.apk")) { throw "$app APK missing. Run without -SkipBuild." }
}

# Release Gradle memory before starting the two JavaScript servers.
Push-Location "$repoRoot/apps/customer/android"
try { & ./gradlew.bat --stop | Out-Null } finally { Pop-Location }

if ($BuildOnly) { Write-Host 'Both debug APKs are ready.'; return }

if (!(Test-Path "$repoRoot/apps/backend/.env")) { throw 'Configure apps/backend/.env before launching the backend.' }
Start-DevServer 'mysql' $mysql @("--defaults-file=$mysqlConfig") $repoRoot 3306
Start-DevServer 'backend-server' $php @('artisan', 'serve', '--host=127.0.0.1', '--port=8000') "$repoRoot/apps/backend" 8000
$settings = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/setting' -Method Post
if ($settings.status -ne 'success') { throw 'Backend settings API did not return success.' }

foreach ($app in @('customer', 'provider')) {
    $port = if ($app -eq 'customer') { 8081 } else { 8082 }
    $package = if ($app -eq 'customer') { 'com.bezzie' } else { 'com.bezzieprovider' }
    Start-DevServer "$app-metro" $node @('node_modules/react-native/cli.js', 'start', '--port', "$port", '--host', '127.0.0.1', '--max-workers', '1') "$repoRoot/apps/$app" $port
    Invoke-Adb reverse "tcp:$port" "tcp:$port"
    Invoke-Adb reverse tcp:8000 tcp:8000
    Invoke-Adb install -r "$repoRoot/apps/$app/android/app/build/outputs/apk/debug/app-debug.apk"
    Invoke-Adb shell am start -n "$package/.MainActivity"
}
Write-Host 'Both apps launched. Provider is in the foreground; open Bezzie from the phone launcher for the customer app.'
