#!/usr/bin/env pwsh
<#
.SYNOPSIS
Create a new EPIC directory and epic.md; by default also create epic/* git branch.

.DESCRIPTION
Creates specs/epics/EPIC-###-<short-name>/epic.md from template (.specify/templates/epic-template.md).
By default creates and checks out git branch epic/EPIC-###-<short-name>. With -UseCurrentBranch, skips
branch creation and stays on the current HEAD.

.PARAMETER Json
Output JSON result.

.PARAMETER ShortName
Optional short name override.

.PARAMETER Number
Optional epic number override (integer).

.PARAMETER EpicDescription
Remaining args joined as EPIC description.

.PARAMETER UseCurrentBranch
Do not create or switch to epic/* branch; stay on current HEAD. EPIC_DIR and epic.md are still created.
#>
[CmdletBinding()]
param(
    [switch]$Json,
    [string]$ShortName,
    [int]$Number = 0,
    [switch]$UseCurrentBranch,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$EpicDescription
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Host "Usage: ./create-new-epic.ps1 [-Json] [-ShortName <name>] [-Number N] [-UseCurrentBranch] <epic description>"
    Write-Host "  -UseCurrentBranch  不新建/切换 epic/* 分支，保持在当前分支；仍会创建 EPIC 目录与 epic.md"
    exit 0
}

if (-not $EpicDescription -or $EpicDescription.Count -eq 0) {
    Write-Error "Usage: ./create-new-epic.ps1 [-Json] [-ShortName <name>] <epic description>"
    exit 1
}

$epicDesc = ($EpicDescription -join ' ').Trim()

. "$PSScriptRoot/common.ps1"
$repoRoot = Get-RepoRoot

Set-Location $repoRoot

function ConvertTo-CleanName {
    param([string]$Name)
    return $Name.ToLower() -replace '[^a-z0-9]', '-' -replace '-{2,}', '-' -replace '^-', '' -replace '-$', ''
}

function Get-NextEpicNumber {
    param([string]$EpicsDir)
    $highest = 0
    if (Test-Path $EpicsDir) {
        Get-ChildItem -Path $EpicsDir -Directory | ForEach-Object {
            if ($_.Name -match '^EPIC-(\d{3})-') {
                $num = [int]$matches[1]
                if ($num -gt $highest) { $highest = $num }
            }
        }
    }
    return ($highest + 1)
}

# Find the next epic number from git branches (epic/EPIC-###-*) as well.
function Get-HighestEpicNumberFromBranches {
    $highest = 0
    try {
        $branches = git branch -a 2>$null
        if ($LASTEXITCODE -eq 0) {
            foreach ($branch in $branches) {
                $cleanBranch = $branch.Trim() -replace '^\*?\s+', '' -replace '^remotes/[^/]+/', ''
                if ($cleanBranch -match '^epic/EPIC-(\d{3})-') {
                    $num = [int]$matches[1]
                    if ($num -gt $highest) { $highest = $num }
                }
            }
        }
    } catch {
        # ignore
    }
    return $highest
}

# Determine epic short name
if ($ShortName) {
    $short = ConvertTo-CleanName -Name $ShortName
} else {
    # naive: take first 4 words after cleaning
    $clean = ConvertTo-CleanName -Name $epicDesc
    $parts = ($clean -split '-') | Where-Object { $_ } | Select-Object -First 4
    $short = ($parts -join '-')
    if (-not $short) { $short = 'epic' }
}

$specsDir = Join-Path $repoRoot 'specs'
$epicsDir = Join-Path $specsDir 'epics'
New-Item -ItemType Directory -Path $epicsDir -Force | Out-Null

if ($Number -eq 0) {
    $highestDir = (Get-NextEpicNumber -EpicsDir $epicsDir) - 1
    $highestBranch = Get-HighestEpicNumberFromBranches
    $Number = [Math]::Max($highestDir, $highestBranch) + 1
}

$epicNum = ('{0:000}' -f $Number)
$epicId = "EPIC-$epicNum"
$epicDirName = "$epicId-$short"

$hasGit = Test-HasGit
$epicBranch = ""
if ($hasGit) {
    $epicBranch = "epic/$epicDirName"
    if ($UseCurrentBranch) {
        try {
            $cur = git rev-parse --abbrev-ref HEAD 2>$null
            if ($LASTEXITCODE -eq 0 -and $cur) {
                $epicBranch = $cur.Trim()
            }
        } catch {
            # keep suggested epic/* name for JSON metadata only
        }
        Write-Host "[specify] UseCurrentBranch: skipped git checkout -b (staying on $epicBranch)"
    } else {
        try {
            git checkout -b "epic/$epicDirName" | Out-Null
        } catch {
            Write-Warning "Failed to create git branch: epic/$epicDirName"
        }
    }
} else {
    Write-Warning "[specify] Warning: Git repository not detected; skipped EPIC branch creation"
}

$epicDir = Join-Path $epicsDir $epicDirName
New-Item -ItemType Directory -Path $epicDir -Force | Out-Null

$template = Join-Path $repoRoot '.specify/templates/epic-template.md'
$epicFile = Join-Path $epicDir 'epic.md'
if (Test-Path $template) {
    Copy-Item -LiteralPath $template -Destination $epicFile -Force
} else {
    New-Item -ItemType File -Path $epicFile -Force | Out-Null
}

$env:SPECIFY_EPIC = $epicDirName
# Clear active feature selection when creating a new epic
Remove-Item Env:SPECIFY_FEATURE -ErrorAction SilentlyContinue

if ($Json) {
    [PSCustomObject]@{
        EPIC_ID   = $epicId
        EPIC_BRANCH = $epicBranch
        USE_CURRENT_BRANCH = [bool]$UseCurrentBranch
        EPIC_DIR  = $epicDir
        EPIC_FILE = $epicFile
        EPIC_DESC = $epicDesc
    } | ConvertTo-Json -Compress
} else {
    Write-Output "EPIC_ID: $epicId"
    if ($epicBranch) { Write-Output "EPIC_BRANCH: $epicBranch" }
    Write-Output "EPIC_DIR: $epicDir"
    Write-Output "EPIC_FILE: $epicFile"
}

