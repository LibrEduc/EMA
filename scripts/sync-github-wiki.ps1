# Sync docs/*.md → GitHub Wiki (A-S-T-U-C-E/ucBlockly)
#
# Prérequis : Wikis activés pour l'organisation/dépôt (Settings → Features → Wikis),
# puis création de la première page via l'UI GitHub (sinon *.wiki.git n'existe pas).
#
# Usage (depuis la racine du dépôt) :
#   pwsh -File scripts/sync-github-wiki.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$docsRoot = Join-Path $repoRoot "docs"
$wikiDir = Join-Path $env:TEMP "ucBlockly-wiki-sync"

if (Test-Path $wikiDir) { Remove-Item -Recurse -Force $wikiDir }
New-Item -ItemType Directory -Path $wikiDir | Out-Null

$pageMap = [ordered]@{
  "KERNEL.md"                  = "KERNEL"
  "ARCHITECTURE.md"            = "Architecture"
  "ACCESSIBILITY.md"           = "Accessibility"
  "CONTRIBUTING.md"            = "Contributing"
  "TYPEDOC.md"                 = "TypeDoc"
  "TYPES_ET_COMPATIBILITES.md" = "Types-et-compatibilites"
  "REPARTITION_FICHIERS.md"    = "Repartition-fichiers"
  "CODE_IMPROVEMENTS.md"       = "Code-improvements"
  "CONVERT_RDUINO.md"          = "Convert-rduino"
  "serialization-analysis.md"  = "Serialization"
  "INTEGRATION_DEPOT.md"       = "Integration"
  "functions-list.md"          = "Functions-list"
}

function Convert-WikiMarkdown([string]$text) {
  $text = [regex]::Replace($text, '(?s)<div align="center">\s*(?:!\[.*?\]\(.*?\)|<img[^>]*>)\s*\n\s*\n', "<div align=`"center`">`n`n")
  $text = [regex]::Replace($text, '!\[µcBlockly\]\(\.\./public/assets/logo_[^\)]+\)\s*\r?\n', "")
  $text = [regex]::Replace($text, '<img src="\.\./public/assets/logo_[^"]+"[^>]*>\s*\r?\n', "")
  $linkMap = @{
    './KERNEL.md' = 'KERNEL'; './ARCHITECTURE.md' = 'Architecture'
    './ACCESSIBILITY.md' = 'Accessibility'; './CONTRIBUTING.md' = 'Contributing'
    './TYPEDOC.md' = 'TypeDoc'; './TYPES_ET_COMPATIBILITES.md' = 'Types-et-compatibilites'
    './REPARTITION_FICHIERS.md' = 'Repartition-fichiers'; './CODE_IMPROVEMENTS.md' = 'Code-improvements'
    './CONVERT_RDUINO.md' = 'Convert-rduino'; './serialization-analysis.md' = 'Serialization'
    './INTEGRATION_DEPOT.md' = 'Integration'; './functions-list.md' = 'Functions-list'
    'ARCHITECTURE.md' = 'Architecture'; 'KERNEL.md' = 'KERNEL'
    'ACCESSIBILITY.md' = 'Accessibility'; 'CONTRIBUTING.md' = 'Contributing'
    'TYPEDOC.md' = 'TypeDoc'; 'TYPES_ET_COMPATIBILITES.md' = 'Types-et-compatibilites'
    'CONVERT_RDUINO.md' = 'Convert-rduino'; 'INTEGRATION_DEPOT.md' = 'Integration'
    'CODE_IMPROVEMENTS.md' = 'Code-improvements'; 'REPARTITION_FICHIERS.md' = 'Repartition-fichiers'
  }
  foreach ($k in $linkMap.Keys) {
    $esc = [regex]::Escape($k)
    $text = [regex]::Replace($text, "\]\($esc\)", "]($($linkMap[$k]))")
  }
  $text = $text -replace '\]\(\.\./README\.md\)', '](https://github.com/A-S-T-U-C-E/ucBlockly/blob/main/README.md)'
  $text = $text -replace '\]\(\.\./CHANGELOG\.md\)', '](https://github.com/A-S-T-U-C-E/ucBlockly/blob/main/CHANGELOG.md)'
  $text = $text -replace '\]\(\.\./typedoc\.json\)', '](https://github.com/A-S-T-U-C-E/ucBlockly/blob/main/typedoc.json)'
  return $text
}

foreach ($src in $pageMap.Keys) {
  $raw = Get-Content -Raw -Encoding utf8 (Join-Path $docsRoot $src)
  [IO.File]::WriteAllText(
    (Join-Path $wikiDir ($pageMap[$src] + ".md")),
    (Convert-WikiMarkdown $raw),
    [Text.UTF8Encoding]::new($false)
  )
}

$homeMd = @"
# µcBlockly — documentation

Programmation visuelle de microcontrôleurs avec **Blockly 13**.

Sources : dossier ``docs/`` · miroir LibrEduc : https://wiki.libreduc.cc/fr:arduino:ucblockly

| Page | Contenu |
|------|---------|
| [KERNEL](KERNEL) | Surface publique du noyau |
| [Architecture](Architecture) | Structure du code |
| [Accessibility](Accessibility) | Accessibilité |
| [Contributing](Contributing) | Contribution |
| [Integration](Integration) | Intégration |
| [TypeDoc](TypeDoc) | Doc API |
| [Types et compatibilités](Types-et-compatibilites) | Typage |
| [Convert rduino](Convert-rduino) | Conversion |
| [Serialization](Serialization) | Sérialisation |
| [Répartition fichiers](Repartition-fichiers) | Répartition |
| [Améliorations code](Code-improvements) | Pistes v3 |
| [Functions list](Functions-list) | Inventaire |
"@
[IO.File]::WriteAllText((Join-Path $wikiDir "Home.md"), $homeMd, [Text.UTF8Encoding]::new($false))

$sidebar = @"
**µcBlockly**
* [Accueil](Home)
* [KERNEL](KERNEL)
* [Architecture](Architecture)
* [Accessibility](Accessibility)
* [Contributing](Contributing)
* [Integration](Integration)
* [TypeDoc](TypeDoc)
* [Types](Types-et-compatibilites)
* [Convert rduino](Convert-rduino)
* [Serialization](Serialization)
* [Répartition](Repartition-fichiers)
* [Améliorations](Code-improvements)
* [Functions list](Functions-list)
"@
[IO.File]::WriteAllText((Join-Path $wikiDir "_Sidebar.md"), $sidebar, [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText(
  (Join-Path $wikiDir "_Footer.md"),
  "Synchronisé depuis ``docs/`` (v3 / Blockly 13).",
  [Text.UTF8Encoding]::new($false)
)

Push-Location $wikiDir
if (-not (Test-Path .git)) {
  git init -b master | Out-Null
  git remote add origin "https://github.com/A-S-T-U-C-E/ucBlockly.wiki.git"
} else {
  git remote set-url origin "https://github.com/A-S-T-U-C-E/ucBlockly.wiki.git"
}
git add .
git -c user.email="sebcanet@users.noreply.github.com" -c user.name="SebCanet" commit -m "docs: sync wiki from docs/" | Out-Null
git push -u origin master
$code = $LASTEXITCODE
Pop-Location
if ($code -ne 0) {
  Write-Error "Push wiki échoué (exit $code). Activez Wikis dans les réglages org/dépôt, créez la 1re page via l'UI, puis relancez."
}
Write-Host "Wiki poussé : https://github.com/A-S-T-U-C-E/ucBlockly/wiki"
