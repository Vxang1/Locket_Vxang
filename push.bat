@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   LOCKET_VXANG - COMMIT + PUSH
echo ============================================
echo.

git add -A
if errorlevel 1 (
  echo [LOI] git add that bai
  pause
  exit /b 1
)

git status --short

echo.
set /p MSG="Nhap message commit (Enter = mac dinh): "
if "%MSG%"=="" set MSG=fix: super deep check v2 - security, schema, logic, dns dynamic

git commit -m "%MSG%"
if errorlevel 1 (
  echo [LOI] git commit that bai (khong co gi de commit?)
  pause
  exit /b 1
)

echo.
echo Dang push len GitHub...
git push https://Vxang1@github.com/Vxang1/Locket_Vxang.git main
if errorlevel 1 (
  echo [LOI] git push that bai - kiem tra mang hoac token
  pause
  exit /b 1
)

echo.
echo ============================================
echo   DONE - Da push thanh cong!
echo ============================================
pause