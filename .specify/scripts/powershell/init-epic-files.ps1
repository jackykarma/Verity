#!/usr/bin/env pwsh
<#
.SYNOPSIS
Initialize EPIC-level files from templates (epic-plan.md, ux-design.md, epic-design.md, key-func-design.md, key-diagram.md, gate-log.md).

.DESCRIPTION
Creates EPIC-level design files in the EPIC directory from their respective templates.
Only creates files that don't already exist (safe to re-run).
Also creates story_detail_design.md in each Feature directory (if features exist).

.PARAMETER EpicId
EPIC identifier (e.g. EPIC-001). Falls back to $env:SPECIFY_EPIC or current branch.

.PARAMETER Force
Overwrite existing files.

.PARAMETER FilesOnly
Comma-separated list of files to create. Default: all.
Valid values: epic-plan, ux-design, epic-design, key-func-design, key-diagram, gate-log, story-detail

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
    Write-Host "Usage: ./init-epic-files.ps1 [-EpicId EPIC-001] [-Force] [-FilesOnly epic-plan,gate-log] [-Json]"
    Write-Host ""
    Write-Host "Creates EPIC-level design files from templates. Safe to re-run (skips existing files unless -Force)."
    Write-Host ""
    Write-Host "Files created:"
    Write-Host "  epic-plan.md              -> EPIC root"
    Write-Host "  ux-design.md              -> EPIC root"
    Write-Host "  epic-design.md            -> EPIC root"
    Write-Host "  key-func-design.md        -> EPIC root"
    Write-Host "  key-diagram.md            -> EPIC root"
    Write-Host "  gate-log.md               -> EPIC root"
    Write-Host "  story_detail_design.md    -> each Feature directory"
    exit 0
}

. "$PSScriptRoot/common.ps1"

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
    Write-Error "EpicId required. Use -EpicId EPIC-001, set SPECIFY_EPIC, or be on an epic/* branch."
    exit 1
}

$p = Get-EpicPathsForUidesign -EpicIdOrArg $EpicId
if (-not $p) {
    Write-Error "EPIC directory not found for $EpicId under specs/epics/"
    exit 1
}

$epicDir = $p.EPIC_DIR
$repoRoot = Get-RepoRoot
$templatesDir = Join-Path $repoRoot '.specify/templates'

$fileMap = @{
    'epic-plan'       = @{ template = 'epic-plan-template.md';              target = 'epic-plan.md' }
    'ux-design'       = @{ template = 'ux-design-template.md';              target = 'ux-design.md' }
    'epic-design'     = @{ template = 'epic-design-doc-template.md';        target = 'epic-design.md' }
    'key-func-design' = @{ template = 'key-func-design-template.md';        target = 'key-func-design.md' }
    'key-diagram'     = @{ template = 'key-diagram-template.md';            target = 'key-diagram.md' }
    'gate-log'        = @{ template = 'gate-log-template.md';               target = 'gate-log.md' }
}

$storyDetailTemplate = 'story_detail_design_template.md'
$storyDetailTarget = 'story_detail_design.md'

$filesToCreate = if ($FilesOnly) {
    $FilesOnly -split ',' | ForEach-Object { $_.Trim() }
} else {
    @('epic-plan', 'ux-design', 'epic-design', 'key-func-design', 'key-diagram', 'gate-log', 'story-detail')
}

$results = @()

foreach ($fileKey in $filesToCreate) {
    if ($fileKey -eq 'story-detail') {
        $featuresDir = Join-Path $epicDir 'features'
        if (Test-Path $featuresDir) {
            $featureDirs = Get-ChildItem -Path $featuresDir -Directory -ErrorAction SilentlyContinue
            foreach ($featDir in $featureDirs) {
                $targetPath = Join-Path $featDir.FullName $storyDetailTarget
                $templatePath = Join-Path $templatesDir $storyDetailTemplate
                if ((Test-Path $targetPath) -and -not $Force) {
                    $results += @{ file = "$($featDir.Name)/$storyDetailTarget"; status = 'skipped (exists)' }
                } elseif (Test-Path $templatePath) {
                    Copy-Item -LiteralPath $templatePath -Destination $targetPath -Force
                    $results += @{ file = "$($featDir.Name)/$storyDetailTarget"; status = 'created' }
                } else {
                    $results += @{ file = "$($featDir.Name)/$storyDetailTarget"; status = 'template not found' }
                }
            }
        } else {
            $results += @{ file = 'story_detail_design.md'; status = 'no features directory' }
        }
        continue
    }

    if (-not $fileMap.ContainsKey($fileKey)) {
        $results += @{ file = $fileKey; status = "unknown file key" }
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
    Write-Output "EPIC_DIR: $epicDir"
    Write-Output ""
    foreach ($r in $results) {
        $icon = switch ($r.status) {
            'created'           { '[+]' }
            'skipped (exists)'  { '[ ]' }
            default             { '[!]' }
        }
        Write-Output "  $icon $($r.file) — $($r.status)"
    }
}
