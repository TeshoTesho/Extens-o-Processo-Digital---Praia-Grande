@echo off
echo ============================
echo   COMMIT AUTOMATICO GIT
echo ============================
echo.

set /p mensagem=Digite a descricao do commit: 

if "%mensagem%"=="" (
    echo Mensagem nao pode ser vazia!
    pause
    exit
)

git add .

git commit -m "%mensagem%"

git push

echo.
echo Commit enviado com sucesso!
pause