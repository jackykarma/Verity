#!/usr/bin/env pwsh
<#
.SYNOPSIS
Initialize EPIC-level files from templates (epic-plan.md, ux-design.md, epic-design.md, nfr.md, gate-log.md) and directory key-func-design/.

.DESCRIPTION
Creates EPIC-level design files in the EPIC directory from their respective templates.
Only creates files that don't already exist (safe to re-run).
Also creates l2_design/.gitkeep (L2 目录占位) in each Feature directory (if features exist).

.PARAMETER EpicId
EPIC identifier (e.g. EPIC-001). Falls back to $env:SPECIFY_EPIC or current branch.

.PARAMETER Force
Overwrite existing files.

.PARAMETER FilesOnly
Comma-separated list of files to create. Default: all.
Valid values: epic-plan, ux-design, epic-design, key-func-design-dir, nfr, gate-log, story-detail
  (story-detail: per-Feature l2_design/.gitkeep；L2 正文由 /aisdd.epicdesign l2 按复杂/高风险 Story 生成)

.PARAMETER Json
Output JSON result.
#>
[CmdletBinding()]
param(
    [string]$EpicId,
    [switch]$Force,
    [string]$FilesOnly,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Host 'Usage: ./init-epic-files.ps1 [-EpicId EPIC-001] [-Force] [-FilesOnly epic-plan,gate-log] [-Json]'
    Write-Host ''
    Write-Host 'Creates EPIC-level design files from templates. Safe to re-run (skips existing unless -Force).'
    Write-Host ''
    Write-Host 'Files created:'
    Write-Host '  epic-plan.md              -> EPIC root'
    Write-Host '  ux-design.md              -> EPIC root'
    Write-Host '  epic-design.md            -> EPIC root'
    Write-Host '  key-func-design/          -> EPIC subdirectory (empty + .gitkeep)'
    Write-Host '  nfr.md                    -> EPIC root (from nfr-template.md)'
    Write-Host '  gate-log.md               -> EPIC root'
    Write-Host '  features/*/l2_design/.gitkeep -> L2 placeholder directory'
    Write-Host ''
    exit 0
}

. (Join-Path $PSScriptRoot 'common.ps1')

if (-not $EpicId) { $EpicId = $env:SPECIFY_EPIC }
if (-not $EpicId) {
    try {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $branch -match '^epic/(EPIC-\d{3})') {
            $EpicId = $Matches[1]
        }
    } catch {}
}
if (-not $EpicId) {
    Write-Error 'EpicId required. Use -EpicId EPIC-001, set SPECIFY_EPIC, or be on an epic/* branch.'
    exit 1
}

$p = Get-EpicPathsForUidesign -EpicIdOrArg $EpicId
if (-not $p) {
    Write-Error ('EPIC directory not found for ' + $EpicId + ' under specs/epics/')
    exit 1
}

$epicDir = $p.EPIC_DIR
$repoRoot = Get-RepoRoot
$templatesDir = Join-Path $repoRoot '.specify/templates'

$fileMap = @{
    'epic-plan'        = @{ template = 'epic-plan-template.md';        target = 'epic-plan.md' }
    'ux-design'        = @{ template = 'ux-design-template.md';        target = 'ux-design.md' }
    'epic-design'      = @{ template = 'epic-design-doc-template.md'; target = 'epic-design.md' }
    'nfr'              = @{ template = 'nfr-template.md';             target = 'nfr.md' }
    'gate-log'         = @{ template = 'gate-log-template.md';         target = 'gate-log.md' }
}

$filesToCreate = if ($FilesOnly) {
    $FilesOnly -split ',' | ForEach-Object { $_.Trim() }
} else {
    @('epic-plan', 'ux-design', 'epic-design', 'key-func-design-dir', 'nfr', 'gate-log', 'story-detail')
}

# Legacy key-diagram files are deprecated and no longer created.
$results = @()
$expanded = [System.Collections.ArrayList]::new()
foreach ($k in $filesToCreate) {
    if ($k -eq 'key-diagram' -or $k -eq 'key-diagram-epic' -or $k -eq 'key-diagram-feature') {
        $results += @{ file = $k; status = 'deprecated (use key-func-design/KD_*_*.md)' }
    } else {
        [void]$expanded.Add($k)
    }
}
$filesToCreate = @($expanded)

foreach ($fileKey in $filesToCreate) {
    if ($fileKey -eq 'key-func-design-dir') {
        $kfdDir = Join-Path $epicDir 'key-func-design'
        $gitkeepPath = Join-Path $kfdDir '.gitkeep'
        if (-not (Test-Path $kfdDir)) {
            New-Item -ItemType Directory -Path $kfdDir -Force | Out-Null
        }
        if ((Test-Path $gitkeepPath) -and -not $Force) {
            $results += @{ file = 'key-func-design/.gitkeep'; status = 'skipped (exists)' }
        } else {
            New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
            $results += @{ file = 'key-func-design/.gitkeep'; status = 'created' }
        }
        continue
    }

    if ($fileKey -eq 'story-detail') {
        $featuresDir = Join-Path $epicDir 'features'
        if (Test-Path $featuresDir) {
            $featureDirs = Get-ChildItem -Path $featuresDir -Directory -ErrorAction SilentlyContinue
            foreach ($featDir in $featureDirs) {
                if ($fileKey -eq 'story-detail') {
                    $l2Dir = Join-Path $featDir.FullName 'l2_design'
                    if (-not (Test-Path $l2Dir)) {
                        New-Item -ItemType Directory -Path $l2Dir -Force | Out-Null
                    }
                    $gitkeepPath = Join-Path $l2Dir '.gitkeep'
                    if ((Test-Path $gitkeepPath) -and -not $Force) {
                        $results += @{ file = ($featDir.Name + '/l2_design/.gitkeep'); status = 'skipped (exists)' }
                    } else {
                        New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
                        $results += @{ file = ($featDir.Name + '/l2_design/.gitkeep'); status = 'created' }
                    }
                    continue
                }
            }
        } else {
            $results += @{ file = 'l2_design/.gitkeep'; status = 'no features directory' }
        }
        continue
    }

    if (-not $fileMap.ContainsKey($fileKey)) {
        $results += @{ file = $fileKey; status = 'unknown file key' }
        continue
    }

    $entry = $fileMap[$fileKey]
    $templatePath = Join-Path $templatesDir $entry.template
    $targetPath = Join-Path $epicDir $entry.target

    if ((Test-Path $targetPath) -and -not $Force) {
        $results += @{ file = $entry.target; status = 'skipped (exists)' }
    } elseif (Test-Path $templatePath) {
        Copy-Item -LiteralPath $templatePath -Destination $targetPath -Force
        $results += @{ file = $entry.target; status = 'created' }
    } else {
        $results += @{ file = $entry.target; status = 'template not found' }
    }
}

if ($Json) {
    [PSCustomObject]@{
        EPIC_DIR = $epicDir
        FILES    = $results
    } | ConvertTo-Json -Depth 3 -Compress
} else {
    Write-Output ('EPIC_DIR: ' + $epicDir)
    Write-Output ''
    foreach ($r in $results) {
        $icon = switch ($r.status) {
            'created'           { '[+]' }
            'skipped (exists)'  { '[ ]' }
            default             { '[!]' }
        }
        Write-Output ('  ' + $icon + ' ' + $r.file + ' - ' + $r.status)
    }
}
