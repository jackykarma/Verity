#!/usr/bin/env pwsh
<#
.SYNOPSIS
Sync current Feature status into its EPIC epic.md Feature Registry block.

.DESCRIPTION
- Reads current Feature paths via common.ps1 (branch-based)
- Parses EPIC ID from specs/<branch>/spec.md line: **Epic**：EPIC-001 - ...
- Locates specs/epics/EPIC-001-*/epic.md
- Updates only the block between:
  <!-- BEGIN_FEATURE_REGISTRY -->
  <!-- END_FEATURE_REGISTRY -->

.PARAMETER Notes
Optional notes to append or set in registry row.

.PARAMETER OverwriteNotes
If set, overwrite existing notes cell for the row.
#>
[CmdletBinding()]
param(
    [string]$Notes = "",
    [switch]$OverwriteNotes
)

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/common.ps1"
$paths = Get-FeaturePathsEnv
$repoRoot = $paths.REPO_ROOT

$featureDir = $paths.FEATURE_DIR
$branch = $paths.CURRENT_BRANCH
$specFile = $paths.FEATURE_SPEC
$planFile = $paths.IMPL_PLAN
$tasksFile = $paths.TASKS
$fullDesignFile = $paths.FULL_DESIGN

if (-not (Test-Path $specFile)) {
    Write-Error "Feature spec not found: $specFile. Run /speckit.feature first."
    exit 1
}

function Get-FirstMatch {
    param([string]$Path, [string]$Pattern)
    $m = Select-String -LiteralPath $Path -Pattern $Pattern -Encoding utf8 -AllMatches | Select-Object -First 1
    if ($m) { return $m.Line.Trim() }
    return ""
}

function Extract-Version {
    param([string]$Path, [string]$Label)
    if (-not (Test-Path $Path)) { return "N/A" }
    # e.g. **Plan Version**：v0.1.0 OR **Plan Version**: v0.1.0
    $line = Get-FirstMatch -Path $Path -Pattern "^\*\*${Label}\*\*[:：]\s*(.+)$"
    if (-not $line) { return "N/A" }
    if ($line -match "^\*\*${Label}\*\*[:：]\s*(.+)$") {
        return $Matches[1].Trim()
    }
    return "N/A"
}

# EPIC line e.g. **Epic**：EPIC-001 - xxx
$epicLine = Get-FirstMatch -Path $specFile -Pattern "^\*\*Epic\*\*[:：]\s*(EPIC-\d{3})\b"
if (-not $epicLine -or ($epicLine -notmatch "(EPIC-\d{3})")) {
    Write-Error "Cannot find EPIC ID in spec.md. Expected line like '**Epic**：EPIC-001 - ...'"
    exit 1
}
$epicId = $Matches[1]

# Feature name from first heading
$titleLine = Get-FirstMatch -Path $specFile -Pattern "^#\s+"
$featureName = $branch
if ($titleLine -match "^#\s+Feature\s+规格说明[:：]\s*(.+)$") { $featureName = $Matches[1].Trim() }
elseif ($titleLine -match "^#\s+(.+)$") { $featureName = $Matches[1].Trim() }

# Locate epic directory
$epicsRoot = Join-Path $repoRoot "specs/epics"
if (-not (Test-Path $epicsRoot)) {
    Write-Error "EPIC directory not found: $epicsRoot. Run /speckit.specify first."
    exit 1
}

$epicDir = Get-ChildItem -Path $epicsRoot -Directory | Where-Object { $_.Name -like "$epicId-*" } | Select-Object -First 1
if (-not $epicDir) {
    Write-Error "Cannot locate EPIC directory for $epicId under $epicsRoot"
    exit 1
}
$epicFile = Join-Path $epicDir.FullName "epic.md"
if (-not (Test-Path $epicFile)) {
    Write-Error "epic.md not found: $epicFile"
    exit 1
}

# Versions
$featureVersion = Extract-Version -Path $specFile -Label "Feature Version"
$planVersion = Extract-Version -Path $planFile -Label "Plan Version"
$tasksVersion = Extract-Version -Path $tasksFile -Label "Tasks Version"
$fullDesignVersion = Extract-Version -Path $fullDesignFile -Label "Full Design Version"

function Infer-Status {
    if (Test-Path $tasksFile) { return "Tasks Ready" }
    if (Test-Path $planFile) { return "Plan Ready" }
    if (Test-Path $specFile) { return "Spec Ready" }
    return "N/A"
}
$status = Infer-Status

$fullDesignLink = if (Test-Path $fullDesignFile) { "full-design.md ($fullDesignVersion)" } else { "N/A" }

function Escape-Pipe {
    param([string]$s)
    if (-not $s) { return "" }
    return ($s -replace '\|','\\|')
}

$notesCell = Escape-Pipe -s $Notes

# Build row
$row = "| $(Escape-Pipe $featureName) | $branch | $featureVersion | $planVersion | $tasksVersion | $fullDesignLink | $status | $notesCell |"

# Read epic.md and replace registry block rows
$lines = Get-Content -LiteralPath $epicFile -Encoding utf8
$beginIdx = ($lines | Select-String -SimpleMatch "<!-- BEGIN_FEATURE_REGISTRY -->" | Select-Object -First 1).LineNumber
$endIdx = ($lines | Select-String -SimpleMatch "<!-- END_FEATURE_REGISTRY -->" | Select-Object -First 1).LineNumber
if (-not $beginIdx -or -not $endIdx -or $endIdx -le $beginIdx) {
    Write-Error "Feature Registry markers not found or invalid in epic.md: $epicFile"
    exit 1
}

# Convert to 0-based indexes
$begin0 = $beginIdx - 1
$end0 = $endIdx - 1

$before = $lines[0..$begin0]
$after = $lines[$end0..($lines.Count-1)]

# Extract block including header lines between markers
$block = @()
for ($i = $begin0 + 1; $i -lt $end0; $i++) { $block += $lines[$i] }

# Ensure header exists (keep first two lines that start with |)
$headerLines = $block | Where-Object { $_ -match '^\|\s*Feature\s*\|' } | Select-Object -First 1
if (-not $headerLines) {
    # If missing, create header
    $block = @(
        "| Feature | 分支 | Feature Version | Plan Version | Tasks Version | Full Design | 状态 | 备注 |",
        "|---|---|---|---|---|---|---|---|"
    )
}

# Replace or append row by matching branch in column 2
$newBlock = New-Object System.Collections.Generic.List[string]
$rowWritten = $false
foreach ($line in $block) {
    if ($line -match '^\|') {
        # match branch column
        $cells = $line.Trim() -split '\s*\|\s*'
        # cells: leading '' then col1.. then trailing '' maybe
        if ($cells.Count -ge 3) {
            $branchCell = $cells[2].Trim()
            if ($branchCell -eq $branch) {
                if (-not $OverwriteNotes -and $Notes) {
                    # preserve existing notes if any
                    $existingNotes = ""
                    if ($cells.Count -ge 9) { $existingNotes = $cells[8].Trim() }
                    if ($existingNotes) {
                        # append with separator
                        $notesCell = Escape-Pipe -s ($existingNotes + "；" + $Notes)
                        $row = "| $(Escape-Pipe $featureName) | $branch | $featureVersion | $planVersion | $tasksVersion | $fullDesignLink | $status | $notesCell |"
                    }
                }
                $newBlock.Add($row)
                $rowWritten = $true
                continue
            }
        }
    }
    $newBlock.Add($line)
}
if (-not $rowWritten) {
    # Append after header separator if present; otherwise at end
    $inserted = $false
    $final = New-Object System.Collections.Generic.List[string]
    for ($i=0; $i -lt $newBlock.Count; $i++) {
        $final.Add($newBlock[$i])
        if (-not $inserted -and $newBlock[$i] -match '^\|\s*---') {
            $final.Add($row)
            $inserted = $true
        }
    }
    if (-not $inserted) { $final.Add($row) }
    $newBlock = $final
}

$out = New-Object System.Collections.Generic.List[string]
$before | ForEach-Object { $out.Add($_) }
$newBlock | ForEach-Object { $out.Add($_) }
$after | ForEach-Object { $out.Add($_) }

Set-Content -LiteralPath $epicFile -Value ($out -join "`n") -Encoding utf8

Write-Output "OK: Synced $branch into $epicFile (EPIC: $epicId)"

