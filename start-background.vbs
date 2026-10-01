' Goofishcbot - Background Mode (Silent)
' Double-click to start, no window will appear

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Create logs folder if not exists
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists("logs") Then fso.CreateFolder("logs")

' Start Node.js silently (window style 0 = hidden)（node.exe 在发布根目录，与 start.bat 一致）
WshShell.Run "node.exe app\index.js", 0, False

MsgBox "Program started in background!" & vbCrLf & vbCrLf & "Access URL: http://localhost:3000" & vbCrLf & vbCrLf & "Run stop.bat to stop the program.", vbInformation, "Goofishcbot"
