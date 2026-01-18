#!/usr/bin/env pwsh
<#
.SYNOPSIS
Create a new EPIC spec directory and epic.md without creating a git branch.

.DESCRIPTION
Creates specs/epics/EPIC-###-<short-name>/epic.md from template:
  .specify/templates/epic-template.md

.PARAMETER Json
Output JSON result.

.PARAMETER ShortName
Optional short name override.

.PARAMETER Number
Optional epic number override (integer).

.PARAMETER EpicDescription
Remaining args joined as EPIC description.
#>
[CmdletBinding()]
param(
    [switch]$Json,
    [string]$ShortName,
    [int]$Number = 0,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$EpicDescription
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Host "Usage: ./create-new-epic.ps1 [-Json] [-ShortName <name>] [-Number N] <epic description>"
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
    $Number = Get-NextEpicNumber -EpicsDir $epicsDir
}

$epicNum = ('{0:000}' -f $Number)
$epicId = "EPIC-$epicNum"
$epicDirName = "$epicId-$short"
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

if ($Json) {
    [PSCustomObject]@{
        EPIC_ID   = $epicId
        EPIC_DIR  = $epicDir
        EPIC_FILE = $epicFile
        EPIC_DESC = $epicDesc
    } | ConvertTo-Json -Compress
} else {
    Write-Output "EPIC_ID: $epicId"
    Write-Output "EPIC_DIR: $epicDir"
    Write-Output "EPIC_FILE: $epicFile"
}

