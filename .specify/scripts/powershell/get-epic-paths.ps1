#!/usr/bin/env pwsh
# 解析 EPIC 目录路径，供 /aisdd.epicuidesign、/aisdd.epicplan、/aisdd.epicdesign 使用。
# 通过 -EpicId 或 $env:SPECIFY_EPIC 指定 EPIC（如 EPIC-002 或 EPIC-002-android-english-learning）。

[CmdletBinding()]
param(
    [string]$EpicId,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Output "Usage: ./get-epic-paths.ps1 [-EpicId EPIC-002] [-Json] [-Help]"
    Write-Output "  -EpicId    EPIC 标识，如 EPIC-002 或 EPIC-002-android-english-learning；不设则用 `$env:SPECIFY_EPIC"
    Write-Output "  -Json      输出 JSON（含 HAS_EPIC_PLAN、单 Feature 省略 epic-plan 时的 SOLE_FEATURE_PLAN 等）"
    exit 0
}

if (-not $EpicId) { $EpicId = $env:SPECIFY_EPIC }
if (-not $EpicId) {
    Write-Error "EpicId or SPECIFY_EPIC required. Example: ./get-epic-paths.ps1 -EpicId EPIC-002 -Json"
    exit 1
}

. "$PSScriptRoot/common.ps1"
$p = Get-EpicPathsForUidesign -EpicIdOrArg $EpicId
if (-not $p) {
    Write-Error "EPIC dir not found: $EpicId (expected under specs/epics/ as EPIC-xxx-*)"
    exit 1
}

$epicPlanPath = $p.EPIC_PLAN
$hasEpicPlan = Test-Path -LiteralPath $epicPlanPath
$featuresDir = Join-Path $p.EPIC_DIR 'features'
$singleFeatureWithoutEpicPlanOk = $false
$soleFeaturePlan = $null
if (-not $hasEpicPlan -and (Test-Path -LiteralPath $featuresDir)) {
    $featDirs = @(Get-ChildItem -LiteralPath $featuresDir -Directory -ErrorAction SilentlyContinue)
    if ($featDirs.Count -eq 1) {
        $cand = Join-Path $featDirs[0].FullName 'plan.md'
        if (Test-Path -LiteralPath $cand) {
            $singleFeatureWithoutEpicPlanOk = $true
            $soleFeaturePlan = $cand
        }
    }
}
$epicConstraintSource = if ($hasEpicPlan) { $epicPlanPath } elseif ($singleFeatureWithoutEpicPlanOk) { $soleFeaturePlan } else { $null }
$researchDir = Join-Path $p.EPIC_DIR 'research'
$hasResearch = Test-Path -LiteralPath $researchDir

if ($Json) {
    [PSCustomObject]@{
        EPIC_DIR         = $p.EPIC_DIR
        EPIC_UX_DESIGN   = $p.EPIC_UX_DESIGN
        EPIC_DESIGN_DIR  = $p.EPIC_DESIGN_DIR
        EPIC_PLAN        = $p.EPIC_PLAN
        EPIC_RESEARCH_DIR = $researchDir
        HAS_RESEARCH     = $hasResearch
        HAS_EPIC_PLAN    = $hasEpicPlan
        SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK = $singleFeatureWithoutEpicPlanOk
        SOLE_FEATURE_PLAN = $soleFeaturePlan
        EPIC_CONSTRAINT_SOURCE = $epicConstraintSource
    } | ConvertTo-Json -Compress
} else {
    'EPIC_DIR: ' + $p.EPIC_DIR | Write-Output
    'EPIC_UX_DESIGN: ' + $p.EPIC_UX_DESIGN | Write-Output
    'EPIC_DESIGN_DIR: ' + $p.EPIC_DESIGN_DIR | Write-Output
    'EPIC_PLAN: ' + $p.EPIC_PLAN | Write-Output
    'EPIC_RESEARCH_DIR: ' + $researchDir | Write-Output
    'HAS_RESEARCH: ' + $hasResearch | Write-Output
    'HAS_EPIC_PLAN: ' + $hasEpicPlan | Write-Output
    'SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK: ' + $singleFeatureWithoutEpicPlanOk | Write-Output
    if ($soleFeaturePlan) { 'SOLE_FEATURE_PLAN: ' + $soleFeaturePlan | Write-Output }
    if ($epicConstraintSource) { 'EPIC_CONSTRAINT_SOURCE: ' + $epicConstraintSource | Write-Output }
}
