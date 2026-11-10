' Aktarim'i kod penceresi acmadan baslatir.
Set sh = CreateObject("WScript.Shell")
dir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
extra = ""
For Each a In WScript.Arguments
  extra = extra & " " & a
Next
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dir & "\Aktarim.ps1""" & extra, 0, False
