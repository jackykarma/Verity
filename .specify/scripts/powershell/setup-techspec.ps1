#!/usr/bin/env pwsh
# 在 EPIC 根目录创建 tech-spec.md（从模板复制），供 /aisdd.techspec 使用。

[CmdletBinding()]
param(
    [string]$EpicId,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Output "Usage: ./setup-techspec.ps1 [-EpicId EPIC-002] [-Json] [-Help]"
    Write-Output "  -EpicId    EPIC 标识；不设则用 `$env:SPECIFY_EPIC"
    Write-Output "  -Json      输出 JSON（EPIC_DIR、TECH_SPEC 等）"
    exit 0
}

if (-not $EpicId) { $EpicId = $env:SPECIFY_EPIC }
if (-not $EpicId) {
    Write-Error "EpicId or SPECIFY_EPIC required. Example: ./setup-techspec.ps1 -EpicId EPIC-002 -Json"
    exit 1
}

. "$PSScriptRoot/common.ps1"
$p = Get-EpicPathsForUidesign -EpicIdOrArg $EpicId
if (-not $p) {
    Write-Error "EPIC dir not found: $EpicId (expected under specs/epics/ as EPIC-xxx-*)"
    exit 1
}

$repoRoot = Get-RepoRoot
$template = Join-Path $repoRoot '.specify/templates/tech-spec-template.md'
$techSpec = $p.TECH_SPEC

if (Test-Path -LiteralPath $techSpec) {
    Write-Warning "tech-spec.md already exists: $techSpec"
} elseif (Test-Path -LiteralPath $template) {
    Copy-Item -LiteralPath $template -Destination $techSpec -Force
    Write-Output "Copied tech-spec template to $techSpec"
} else {
    Write-Warning "Template not found at $template"
    New-Item -ItemType File -Path $techSpec -Force | Out-Null
}

if ($Json) {
    [PSCustomObject]@{
        EPIC_DIR   = $p.EPIC_DIR
        TECH_SPEC  = $techSpec
        EPIC_PLAN  = $techSpec   # 兼容旧字段名
        HAS_TECH_SPEC = (Test-Path -LiteralPath $techSpec)
    } | ConvertTo-Json -Compress
} else {
    Write-Output "EPIC_DIR: $($p.EPIC_DIR)"
    Write-Output "TECH_SPEC: $techSpec"
}
