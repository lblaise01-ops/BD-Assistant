@echo off
title BD Assistant

:MENU
cls
echo.
echo =====================================
echo         BD ASSISTANT
echo =====================================
echo.
echo 1 - Voir les fichiers modifies
echo 2 - Publier sur GitHub
echo 3 - Ouvrir le depot GitHub
echo 4 - Ouvrir le site local
echo 5 - Quitter
echo.
set /p CHOIX=Votre choix : 

if "%CHOIX%"=="1" goto STATUS
if "%CHOIX%"=="2" goto PUSH
if "%CHOIX%"=="3" goto GITHUB
if "%CHOIX%"=="4" goto LOCAL
if "%CHOIX%"=="5" exit

goto MENU


:STATUS
cls
echo.
echo ===== FICHIERS MODIFIES =====
echo.
git status
echo.
pause
goto MENU


:PUSH
cls
echo.
echo ===== PREPARATION =====
echo.

git add .

echo.
echo ===== FICHIERS QUI SERONT ENVOYES =====
echo.
git status

echo.
set /p MESSAGE=Message du commit : 

if "%MESSAGE%"=="" set MESSAGE=Mise a jour BD Assistant

echo.
echo ===== ENVOI VERS GITHUB =====
echo.

git commit -m "%MESSAGE%"
git push

echo.
echo =====================================
echo     PUBLICATION EN COURS...
echo =====================================
echo.

echo Attente de la publication de GitHub Pages...
echo.

:ATTENTE

curl -I -s https://lblaise01-ops.github.io/BD-Assistant/ | find "200 OK" >nul

if errorlevel 1 (
    timeout /t 5 >nul
    goto ATTENTE
)

echo.
echo GitHub Pages est disponible.
echo.
echo Appuie sur F5 jusqu'a ce que la nouvelle version apparaisse.
echo Le site va s'ouvrir automatiquement.
echo.

start https://lblaise01-ops.github.io/BD-Assistant/

echo.
echo =====================================
echo      PUBLICATION TERMINEE
echo =====================================
echo.
echo Le site GitHub Pages a ete ouvert.
echo Tu peux maintenant actualiser la page sur ton iPhone.
echo.
pause
goto MENU


:GITHUB
start https://github.com/lblaise01-ops/BD-Assistant
goto MENU


:LOCAL
start http://127.0.0.1:5500/
goto MENU