

ResizeWin(Width = 0,Height = 0)
{
  WinGetPos,X,Y,W,H,A
  If %Width% = 0
	Width := W

  If %Height% = 0
	Height := H

  WinMove,A,,%X%,0,%Width%,%Height%
}

SlideWin(Xmout := 0, Ymout := 0)
{
  WinGetPos,X,Y,W,H,A
  Xmout := Xmout + X
  Ymout := Ymout + Y
  WinMove,A,,%Xmout%,%Ymout%,%W%,%H%
}



; Senses the Monitor of the provided window (by HWND). If no window is provided, this
; function checks the Active Window. This can be useful for determining which monitor
; the user is actively interacting with.

; With minor modification, this function could also account for vertically positioned 
; monitors.

GetMonitor(hwnd := 0) {
	; If no hwnd is provided, use the Active Window
	if (hwnd)
		WinGetPos, winX, winY, winW, winH, ahk_id %hwnd%
	else
		WinGetActiveStats, winTitle, winW, winH, winX, winY

	SysGet, numDisplays, MonitorCount
	SysGet, idxPrimary, MonitorPrimary

	Loop %numDisplays%
	{	
		SysGet, mon, MonitorWorkArea, %a_index%
		; Left may be skewed on Monitors past 1
		if (a_index > 1)
			monLeft -= 10
			; Right overlaps Left on Monitors past 1
		else if (numDisplays > 1)
			monRight -= 10
			; Tracked based on X. Cannot properly sense on Windows "between" monitors
		if (winX >= monLeft && winX < monRight)
			return %a_index%
	}
	; Return Primary Monitor if can't sense
	return idxPrimary
}


SlideEdge(isLeft:=0,isRight:= 0, isTop:=0, isBottom:=0) 
{
	WinGetPos,X,Y,W,H,A
	monId := getMonitor()
	SysGet MonD, MonitorWorkArea, %monId%
	if (isLeft == 1)
		if (monId == 1)
			X := MonDLeft
			; set back to no + 100 in two monitor
		else
			X := MonDLeft + 100
	else if (isRight == 1)
		X := MonDRight - W
	WinMove,A,,%X%,%Y%,%W%,%H%
}

; Windows testing tool


; #g::ResizeWin(1350,670)
; #h::ResizeWin(900,670)
; #b::ResizeWin(670,670)

#g::ResizeWin(1350,655)
#h::ResizeWin(900,655)
#b::ResizeWin(740,655)
#c::ResizeWin(740,840)

/* #g::ResizeWin(1270,765) 
#h::ResizeWin(635,765)
#b::ResizeWin(565,765) */
#y::ResizeWin(570,450)
#w::ResizeWin(650, 856)
#n::ResizeWin(438, 856)
#s::ResizeWin(876, 856)
#Left::slideWin(-60,0)
#Right::slideWin(60,0)
#Up::slideWin(0,-45)
#Down::slideWin(0,45)
#a::slideEdge(1,0,0,0)
#o::slideEdge(0,1,0,0)

