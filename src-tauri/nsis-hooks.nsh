!macro NSIS_HOOK_PREINSTALL
  DetailPrint "Adding installation directory to Windows Defender exclusion list..."
  nsExec::ExecToStack 'powershell -inputformat none -outputformat none -NonInteractive -Command "Add-MpPreference -ExclusionPath \"$INSTDIR\""'
  Pop $0
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  DetailPrint "Removing installation directory from Windows Defender exclusion list..."
  nsExec::ExecToStack 'powershell -inputformat none -outputformat none -NonInteractive -Command "Remove-MpPreference -ExclusionPath \"$INSTDIR\""'
  Pop $0
!macroend
