#!/usr/bin/env pwsh

# Consolidated prerequisite checking script (PowerShell)
#
# Usage: ./check-prerequisites.ps1 [OPTIONS]
#
# OPTIONS:
#   -Json               Output in JSON format
#   -RequireTasks       Require tasks.md to exist (for implementation phase)
#   -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
#   -PathsOnly          Only output path variables (no validation)
#   -Help, -h           Show help message

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks,
    [switch]$PathsOnly,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Output @"
Usage: check-prerequisites.ps1 [OPTIONS]

Prerequisite checking for AISDD workflow.

OPTIONS:
  -Json               Output in JSON format
  -RequireTasks       Require tasks.md to exist (for implementation phase)
  -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
  -PathsOnly          Only output path variables (no prerequisite validation)
  -Help, -h           Show this help message

EXAMPLES:
  .\check-prerequisites.ps1 -Json
  .\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
  .\check-prerequisites.ps1 -PathsOnly

"@
    exit 0
}

. "$PSScriptRoot/common.ps1"

$paths = Get-FeaturePathsEnv

if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) {
    exit 1
}

if ($PathsOnly) {
    if ($Json) {
        [PSCustomObject]@{
            REPO_ROOT     = $paths.REPO_ROOT
            BRANCH        = $paths.CURRENT_BRANCH
            FEATURE_DIR   = $paths.FEATURE_DIR
            FEATURE_SPEC  = $paths.FEATURE_SPEC
            EPIC_DIR      = $paths.EPIC_DIR
            TECH_SPEC     = $paths.TECH_SPEC
            UX_DESIGN     = $paths.UX_DESIGN
            DESIGN_DIR    = $paths.DESIGN_DIR
            RESEARCH_DIR  = $paths.RESEARCH_DIR
            TASKS         = $paths.TASKS
        } | ConvertTo-Json -Compress
    } else {
        Write-Output "REPO_ROOT: $($paths.REPO_ROOT)"
        Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
        Write-Output "FEATURE_DIR: $($paths.FEATURE_DIR)"
        Write-Output "FEATURE_SPEC: $($paths.FEATURE_SPEC)"
        Write-Output "EPIC_DIR: $($paths.EPIC_DIR)"
        Write-Output "TECH_SPEC: $($paths.TECH_SPEC)"
        Write-Output "UX_DESIGN: $($paths.UX_DESIGN)"
        Write-Output "DESIGN_DIR: $($paths.DESIGN_DIR)"
        Write-Output "RESEARCH_DIR: $($paths.RESEARCH_DIR)"
        Write-Output "TASKS: $($paths.TASKS)"
    }
    exit 0
}

if (-not (Test-Path $paths.FEATURE_DIR -PathType Container)) {
    Write-Output "ERROR: Feature directory not found: $($paths.FEATURE_DIR)"
    Write-Output "Run /aisdd.featurespec first to create the Feature directory and spec.md."
    exit 1
}

if (-not $paths.EPIC_DIR) {
    Write-Output "ERROR: EPIC directory not resolved for $($paths.FEATURE_DIR)"
    Write-Output "Ensure the feature is under specs/epics/EPIC-xxx/features/FEAT-xxx."
    exit 1
}

$techSpec = Join-Path $paths.EPIC_DIR 'tech-spec.md'
if (-not (Test-Path $techSpec -PathType Leaf)) {
    Write-Output "ERROR: tech-spec.md not found in $($paths.EPIC_DIR)"
    Write-Output "Run /aisdd.techspec first to create the EPIC technical specification."
    exit 1
}

if ($RequireTasks -and -not (Test-Path $paths.TASKS -PathType Leaf)) {
    Write-Output "ERROR: tasks.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /aisdd.featuretasks first to create the task list."
    exit 1
}

$docs = @()

if ((Test-Path $paths.RESEARCH_DIR -PathType Container) -and (Get-ChildItem -Path $paths.RESEARCH_DIR -Filter 'codebase-*.md' -ErrorAction SilentlyContinue | Select-Object -First 1)) {
    $docs += 'research/'
}

if (Test-Path $paths.UX_DESIGN) { $docs += 'ux-design.md' }

if ($IncludeTasks -and (Test-Path $paths.TASKS)) {
    $docs += 'tasks.md'
}

if ($Json) {
    [PSCustomObject]@{
        FEATURE_DIR    = $paths.FEATURE_DIR
        AVAILABLE_DOCS = $docs
        UX_DESIGN      = $paths.UX_DESIGN
        DESIGN_DIR     = $paths.DESIGN_DIR
        RESEARCH_DIR   = $paths.RESEARCH_DIR
    } | ConvertTo-Json -Compress
} else {
    Write-Output "FEATURE_DIR:$($paths.FEATURE_DIR)"
    Write-Output "AVAILABLE_DOCS:"
    Test-DirHasFiles -Path $paths.RESEARCH_DIR -Description 'research/' | Out-Null
    Test-FileExists -Path $paths.UX_DESIGN -Description 'ux-design.md' | Out-Null
    if ($IncludeTasks) {
        Test-FileExists -Path $paths.TASKS -Description 'tasks.md' | Out-Null
    }
}
