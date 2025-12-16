@echo off
echo ====================================
echo Teste de Configuracao Keycloak
echo ====================================
echo.

echo 1. Testando conexao com Keycloak...
curl -s http://localhost:8180/realms/vendex-master/.well-known/openid-configuration >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Keycloak esta rodando em http://localhost:8180
) else (
    echo [ERRO] Keycloak nao esta acessivel. Inicie o Keycloak primeiro.
    pause
    exit /b 1
)

echo.
echo 2. Testando autenticacao...
echo.
set /p USERNAME="Digite o username: "
set /p PASSWORD="Digite a senha: "

echo.
echo Tentando autenticar com client vedex-frontend...
curl -s -X POST "http://localhost:8180/realms/vendex-master/protocol/openid-connect/token" ^
  -d "client_id=vedex-frontend" ^
  -d "grant_type=password" ^
  -d "username=%USERNAME%" ^
  -d "password=%PASSWORD%" > response.json

findstr "access_token" response.json >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Autenticacao bem-sucedida!
    echo Token obtido com sucesso.
    echo.
    echo Conteudo da resposta:
    type response.json
) else (
    echo.
    echo [ERRO] Falha na autenticacao!
    echo.
    echo Resposta do Keycloak:
    type response.json
    echo.
    echo.
    echo Possiveis causas:
    echo - Client 'vedex-frontend' esta configurado como CONFIDENCIAL (deve ser PUBLICO)
    echo - Usuario ou senha incorretos
    echo - Usuario nao esta habilitado no Keycloak
    echo.
    echo Veja o arquivo KEYCLOAK-FIX-CLIENT.md para instrucoes detalhadas.
)

del response.json >nul 2>&1

echo.
echo ====================================
pause
