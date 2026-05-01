param(
    [string]$ProjectRoot = "G:\DevProject\Agent_Proj\GisAgentProj",
    [string]$DesktopPath = "C:\Users\Administrator.DESKTOP-KDKOE48\Desktop",
    [string]$BaseUrl = "https://api.xiaomimimo.com/anthropic",
    [string]$Model = "mimo-v2.5-pro",
    [string]$AuthToken = "sk-ssyy1ay0xo5d8m9thcskoh67jy6mmwqar7bdqa5yhmozk8o9"
)

$taskFile = Join-Path $ProjectRoot "claude-demo-task.txt"
$targetFile = Join-Path $DesktopPath "text2.txt"

if (Test-Path $targetFile) {
    Remove-Item -LiteralPath $targetFile -Force
}

$taskContent = @"
Demo task for the visible Claude Code terminal:

1. Create the file '$targetFile'
2. Put exactly this content into the file:
hello from claude code
3. Verify the file exists
4. Report the result
"@

Set-Content -LiteralPath $taskFile -Value $taskContent -Encoding UTF8

$claudeWindow = @"
`$host.UI.RawUI.WindowTitle = 'Claude Code - MiMo Demo'
Set-Location '$ProjectRoot'
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_SONNET_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_OPUS_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_HAIKU_MODEL -ErrorAction SilentlyContinue
`$env:ANTHROPIC_AUTH_TOKEN = '$AuthToken'
`$env:ANTHROPIC_BASE_URL = '$BaseUrl'
`$env:ANTHROPIC_MODEL = '$Model'
`$env:ANTHROPIC_DEFAULT_SONNET_MODEL = '$Model'
`$env:ANTHROPIC_DEFAULT_OPUS_MODEL = '$Model'
`$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = '$Model'
Write-Host 'Claude demo terminal is ready. Paste the task below into Claude if needed:' -ForegroundColor Green
Get-Content '$taskFile'
Write-Host ''
claude
"@

$monitorWindow = @"
`$host.UI.RawUI.WindowTitle = 'Collab Monitor'
Set-Location '$ProjectRoot'
Write-Host 'Monitoring result file for the visible collaboration test...' -ForegroundColor Cyan
Write-Host ('Watching: ' + '$targetFile')
Write-Host ''
while (`$true) {
    Clear-Host
    Write-Host 'Collab Monitor' -ForegroundColor Cyan
    Write-Host ('Time: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
    Write-Host ('Task file: ' + '$taskFile')
    Write-Host ('Target file: ' + '$targetFile')
    Write-Host ''
    if (Test-Path '$targetFile') {
        Write-Host 'Status: target file exists' -ForegroundColor Green
        Write-Host ''
        Get-Content '$targetFile'
    } else {
        Write-Host 'Status: waiting for Claude to create target file' -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 2
}
"@

$claudeEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($claudeWindow))
$monitorEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($monitorWindow))

Start-Process powershell.exe -WorkingDirectory $ProjectRoot -ArgumentList '-NoExit', '-EncodedCommand', $claudeEncoded
Start-Process powershell.exe -WorkingDirectory $ProjectRoot -ArgumentList '-NoExit', '-EncodedCommand', $monitorEncoded

Write-Host "Started visible collaboration demo windows." -ForegroundColor Green
Write-Host "Task file: $taskFile"
Write-Host "Target file: $targetFile"
