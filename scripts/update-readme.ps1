param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$readmePath = Join-Path $ProjectRoot 'README.md'
$start = '<!-- BEGIN GENERATED: examples -->'
$end = '<!-- END GENERATED: examples -->'
$content = [IO.File]::ReadAllText($readmePath, [Text.Encoding]::UTF8)
$directories = Get-ChildItem -LiteralPath $ProjectRoot -Directory |
  Where-Object { $_.Name -match '^\d' } |
  Sort-Object Name

$lines = @($start)
foreach ($directory in $directories) {
  $label = $directory.Name
  $description = switch -Regex ($label) {
    'Seek' { 'recherche d''une cible'; break }
    'PursueEvade' { 'poursuite et evitement'; break }
    'Arrival' { 'arrivee avec ralentissement'; break }
    'Wander' { 'errance controlee'; break }
    default { 'demonstration de steering behaviors' }
  }
  $lines += ('- ' + [char]96 + $label + [char]96 + ' - ' + $description + '.')
}
$lines += $end
$block = [string]::Join("`r`n", $lines)
$pattern = '(?s)<!-- BEGIN GENERATED: examples -->.*?<!-- END GENERATED: examples -->'
$updated = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $block }, 1)
[IO.File]::WriteAllText($readmePath, $updated, [Text.UTF8Encoding]::new($false))
Write-Output "README updated: $($directories.Count) application(s)."
