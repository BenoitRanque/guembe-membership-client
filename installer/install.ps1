Copy-Item ($PSScriptRoot + "/GUEMBE") -Destination "C:\Program Files\GUEMBE" -Recurse -Force

$DesktopPath = [Environment]::GetFolderPath("Desktop")

$Shell = New-Object -ComObject ("WScript.Shell")
$ShortCut = $Shell.CreateShortcut($DesktopPath + "\GUEMBE.lnk")
$ShortCut.TargetPath="C:\Program Files\GUEMBE\GUEMBE APP.exe"
$ShortCut.Arguments=""
$ShortCut.WorkingDirectory = "C:\Program Files\GUEMBE";
$ShortCut.WindowStyle = 1;
# $ShortCut.Hotkey = "CTRL+SHIFT+F";
$ShortCut.IconLocation = "C:\Program Files\GUEMBE\GUEMBE APP.exe, 0";
$ShortCut.Description = "GUEMBE";
$ShortCut.Save()

Write-Host 'Done!'
Read-Host -Prompt "Press Enter to continue"