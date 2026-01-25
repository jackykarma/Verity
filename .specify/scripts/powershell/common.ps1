#!/usr/bin/env pwsh
# Common PowerShell functions analogous to common.sh

function Get-RepoRoot {
    try {
        $result = git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $result
        }
    } catch {
        # Git command failed
    }
    
    # Fall back to script location for non-git repos
    return (Resolve-Path (Join-Path $PSScriptRoot "../../..")).Path
}

function Get-CurrentBranch {
    # Prefer git branch name when available (EPIC/Story branch workflow).
    try {
        $result = git rev-parse --abbrev-ref HEAD 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $result
        }
    } catch {
        # Git command failed
    }

    # For non-git repos, allow SPECIFY_FEATURE override
    if ($env:SPECIFY_FEATURE) {
        return $env:SPECIFY_FEATURE
    }
    
    # For non-git repos, try to find the latest feature directory
    $repoRoot = Get-RepoRoot
    $specsDir = Join-Path $repoRoot "specs"
    
    if (Test-Path $specsDir) {
        $latestFeature = ""
        $highest = 0
        
        Get-ChildItem -Path $specsDir -Directory | ForEach-Object {
            if ($_.Name -match '^(\d{3})-') {
                $num = [int]$matches[1]
                if ($num -gt $highest) {
                    $highest = $num
                    $latestFeature = $_.Name
                }
            }
        }
        
        if ($latestFeature) {
            return $latestFeature
        }
    }
    
    # Final fallback
    return "main"
}

function Get-CurrentFeatureKey {
    # Feature key is a relative path under specs/, e.g.
    #   epics/EPIC-001-xxx/features/FEAT-001-yyy
    # For legacy workflow, it may be the feature branch name (001-foo).
    if ($env:SPECIFY_FEATURE) {
        return $env:SPECIFY_FEATURE
    }
    return ""
}

function Test-HasGit {
    try {
        git rev-parse --show-toplevel 2>$null | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

function Test-FeatureBranch {
    param(
        [string]$Branch,
        [bool]$HasGit = $true
    )
    
    # For non-git repos, we can't enforce branch naming but still provide output
    if (-not $HasGit) {
        Write-Warning "[specify] Warning: Git repository not detected; skipped branch validation"
        return $true
    }
    
    # If SPECIFY_FEATURE is set, we are using explicit feature directory selection
    # and do not enforce branch naming (supports epic/* and story/* branches).
    if ($env:SPECIFY_FEATURE) { return $true }

    if ($Branch -notmatch '^[0-9]{3}-') {
        Write-Output "ERROR: Not on a feature branch and SPECIFY_FEATURE is not set. Current branch: $Branch"
        Write-Output "Either:"
        Write-Output "  - switch to a feature branch named like: 001-feature-name, OR"
        Write-Output "  - set SPECIFY_FEATURE to a specs/ subpath (epic workflow), e.g. epics/EPIC-001-xxx/features/FEAT-001-yyy"
        return $false
    }
    return $true
}

function Get-FeatureDir {
    param([string]$RepoRoot, [string]$Branch)
    Join-Path $RepoRoot "specs/$Branch"
}

function Get-FeaturePathsEnv {
    $repoRoot = Get-RepoRoot
    $currentBranch = Get-CurrentBranch
    $hasGit = Test-HasGit
    $featureKey = Get-CurrentFeatureKey
    if ($featureKey) {
        $featureDir = Join-Path $repoRoot "specs/$featureKey"
    } else {
        $featureDir = Get-FeatureDir -RepoRoot $repoRoot -Branch $currentBranch
    }
    
    # EPIC 级 ux-design 路径（仅当 featureKey 为 epics/EPIC-xxx/features/FEAT-xxx 时）
    $epicDir = $null
    $epicUx = $null
    $epicDesign = $null
    if ($featureKey -match '^epics/(EPIC-\d{3}-[^/]+)/') {
        $epicDirName = $matches[1]
        $epicsBase = Join-Path (Join-Path $repoRoot "specs") "epics"
        $epicDir = Join-Path $epicsBase $epicDirName
        $epicUx = Join-Path $epicDir 'ux-design.md'
        $epicDesign = Join-Path $epicDir 'design'
    }
    
    # UX_DESIGN、DESIGN_DIR：在 EPIC 工作流下指向 EPIC 级，否则为 Feature 级（兼容旧流程）
    $uxDesign = if ($epicUx) { $epicUx } else { Join-Path $featureDir 'ux-design.md' }
    $designDir = if ($epicDesign) { $epicDesign } else { Join-Path $featureDir 'design' }
    
    [PSCustomObject]@{
        REPO_ROOT       = $repoRoot
        CURRENT_BRANCH  = $currentBranch
        HAS_GIT         = $hasGit
        FEATURE_KEY     = $featureKey
        FEATURE_DIR     = $featureDir
        FEATURE_SPEC    = Join-Path $featureDir 'spec.md'
        IMPL_PLAN       = Join-Path $featureDir 'plan.md'
        FULL_DESIGN     = Join-Path $featureDir 'full-design.md'
        UX_DESIGN       = $uxDesign
        DESIGN_DIR      = $designDir
        EPIC_DIR        = $epicDir
        EPIC_UX_DESIGN  = $epicUx
        EPIC_DESIGN_DIR = $epicDesign
        TASKS           = Join-Path $featureDir 'tasks.md'
        RESEARCH        = Join-Path $featureDir 'research.md'
        DATA_MODEL      = Join-Path $featureDir 'data-model.md'
        QUICKSTART      = Join-Path $featureDir 'quickstart.md'
        CONTRACTS_DIR   = Join-Path $featureDir 'contracts'
    }
}

# 解析 EPIC 标识并返回 EPIC 根路径，供 /speckit.epicuidesign、/speckit.epicuidesign-update 使用。
# $EpicIdOrArg：如 "EPIC-002"、"EPIC-002-android-english-learning" 或 "EPIC-002 范围：整体"；可从 $env:SPECIFY_EPIC 或 $ARGUMENTS 传入。
function Get-EpicPathsForUidesign {
    param([string]$EpicIdOrArg)
    if (-not $EpicIdOrArg) { return $null }
    $epicId = if ($EpicIdOrArg -match '(EPIC-\d{3})') { $matches[1] } else { $null }
    if (-not $epicId) { return $null }
    $repoRoot = Get-RepoRoot
    $epicsDir = Join-Path (Join-Path $repoRoot "specs") "epics"
    if (-not (Test-Path $epicsDir -PathType Container)) { return $null }
    $dir = Get-ChildItem -Path $epicsDir -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "$epicId-*" } | Select-Object -First 1
    if (-not $dir) { return $null }
    [PSCustomObject]@{
        EPIC_DIR         = $dir.FullName
        EPIC_UX_DESIGN   = Join-Path $dir.FullName 'ux-design.md'
        EPIC_DESIGN_DIR  = Join-Path $dir.FullName 'design'
    }
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    if (Test-Path -Path $Path -PathType Leaf) {
        Write-Output "  ✓ $Description"
        return $true
    } else {
        Write-Output "  ✗ $Description"
        return $false
    }
}

function Test-DirHasFiles {
    param([string]$Path, [string]$Description)
    if ((Test-Path -Path $Path -PathType Container) -and (Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Select-Object -First 1)) {
        Write-Output "  ✓ $Description"
        return $true
    } else {
        Write-Output "  ✗ $Description"
        return $false
    }
}

