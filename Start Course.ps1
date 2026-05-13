$ErrorActionPreference = "Stop"

$courseRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledNode = "C:\Users\Bemister\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$node = if (Test-Path $bundledNode) { $bundledNode } else { "node" }

Set-Location $courseRoot
Write-Host "Starting Voddy Dev Course at http://127.0.0.1:4177/"
Write-Host "Close this window to stop the course server."
& $node "server.mjs"
